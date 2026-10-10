import path from 'node:path'
import os from 'node:os'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const UPDATE_REPOSITORY = 'Martin-soaring-dev/dsh-usage-plugin-v2'
export const UPDATE_PACKAGE = 'dsh-usage-plugin-v2'
export const RELEASE_API_URL = `https://api.github.com/repos/${UPDATE_REPOSITORY}/releases/latest`

export function parseVersion(value) {
  const match = String(value || '').trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/)
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] || ''
  }
}

export function compareVersions(left, right) {
  const a = parseVersion(left)
  const b = parseVersion(right)
  if (!a || !b) throw new Error('无法比较无效版本号')
  for (const key of ['major', 'minor', 'patch']) {
    if (a[key] !== b[key]) return a[key] > b[key] ? 1 : -1
  }
  if (a.prerelease === b.prerelease) return 0
  if (!a.prerelease) return 1
  if (!b.prerelease) return -1
  return a.prerelease.localeCompare(b.prerelease)
}

export function releaseInfo(payload, currentVersion) {
  if (!payload || payload.draft || payload.prerelease) throw new Error('GitHub 最新 Release 不是正式版本')
  const tag = String(payload.tag_name || '')
  if (!parseVersion(tag)) throw new Error('GitHub Release 的 tag 不是有效语义版本')
  const releaseUrl = String(payload.html_url || '')
  const expectedPrefix = `https://github.com/${UPDATE_REPOSITORY}/releases/tag/`
  if (!releaseUrl.startsWith(expectedPrefix)) throw new Error('GitHub Release 来源不匹配')
  return {
    currentVersion,
    latestVersion: tag.replace(/^v/, ''),
    tag,
    updateAvailable: compareVersions(tag, currentVersion) > 0,
    releaseUrl,
    publishedAt: String(payload.published_at || '')
  }
}

export function releaseArchiveUrl(tag) {
  if (!parseVersion(tag)) throw new Error('拒绝安装无效 Release tag')
  return `https://github.com/${UPDATE_REPOSITORY}/archive/refs/tags/${encodeURIComponent(tag)}.tar.gz`
}

function rootBefore(parts, marker, packageRoot) {
  const index = parts.indexOf(marker)
  if (index < 1) return ''
  return parts.slice(0, index).join(path.sep) || path.parse(packageRoot).root
}

function normalizePath(value) {
  return path.resolve(String(value || ''))
}

function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch (e) { return null }
}

export function profileDependencySpec(profileRoot) {
  const pkg = readJson(path.join(profileRoot, 'package.json'))
  if (!pkg || typeof pkg !== 'object') return ''
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    const map = pkg[section]
    if (map && typeof map === 'object' && map[UPDATE_PACKAGE]) return String(map[UPDATE_PACKAGE])
  }
  return ''
}

function linkedTarget(profileRoot, spec) {
  const value = String(spec || '')
  const match = value.match(/^(?:link|file):(.*)$/)
  if (!match) return ''
  const raw = match[1]
  return normalizePath(path.isAbsolute(raw) ? raw : path.join(profileRoot, raw))
}

function profileLinksToPackage(profileRoot, packageRoot) {
  const spec = profileDependencySpec(profileRoot)
  if (!spec) return false
  const target = linkedTarget(profileRoot, spec)
  return !!target && target === normalizePath(packageRoot)
}

function dshProfilesDir(options) {
  if (options && options.profilesDir) return String(options.profilesDir)
  const home = (options && options.homeDir) || os.homedir()
  const dshHome = (options && options.dshHome) || process.env.DSH_HOME || path.join(home, '.dsh')
  return path.join(dshHome, 'profiles')
}

function findLinkedProfile(packageRoot, options) {
  const profilesDir = dshProfilesDir(options)
  let entries
  try { entries = readdirSync(profilesDir, { withFileTypes: true }) } catch (e) { return '' }
  const matches = []
  for (const entry of entries) {
    if (!entry || !entry.isDirectory()) continue
    const root = path.join(profilesDir, entry.name)
    if (profileLinksToPackage(root, packageRoot)) matches.push(root)
  }
  // A linked development package should belong to one active profile. If it is
  // linked by several profiles, prefer the conventional web profile; otherwise
  // refuse to guess rather than updating an unrelated profile.
  if (matches.length === 1) return matches[0]
  const web = matches.find((root) => path.basename(root).toLowerCase() === 'web')
  return web || ''
}

export function profileRootFromModule(moduleUrl, options = {}) {
  const packageRoot = path.dirname(path.dirname(fileURLToPath(moduleUrl)))
  const parts = packageRoot.split(path.sep)

  // Normal installed package: <profile>/node_modules[/...]/dsh-usage-plugin-v2.
  // The first node_modules belongs to the DSH profile, even with pnpm's nested
  // node_modules/.pnpm/... layout.
  const nodeModulesRoot = rootBefore(parts, 'node_modules', packageRoot)
  if (nodeModulesRoot && existsSync(path.join(nodeModulesRoot, 'package.json'))) return nodeModulesRoot

  // Development/link installation: the module may live under a workspace
  // <workspace>/.dsh/plugins/... while the running DSH profile is actually
  // ~/.dsh/profiles/<name>. Locate the profile by reading profile package.json
  // and matching its link:/file: dependency to this exact package checkout.
  const linkedProfile = findLinkedProfile(packageRoot, options)
  if (linkedProfile) return linkedProfile

  // Only accept a plugins parent directly when it is itself a real DSH profile
  // (i.e. it has package.json and declares this package). Never treat an
  // arbitrary workspace .dsh/plugins parent as the runtime profile.
  const pluginsRoot = rootBefore(parts, 'plugins', packageRoot)
  if (pluginsRoot && profileLinksToPackage(pluginsRoot, packageRoot)) return pluginsRoot

  return ''
}

export function verifyProfileInstall(profileRoot, expectedVersion, expectedTag) {
  const root = String(profileRoot || '')
  if (!root) return { ok: false, error: '未定位到 DSH profile' }
  const expected = String(expectedVersion || '').replace(/^v/, '')
  const spec = profileDependencySpec(root)
  if (!spec) return { ok: false, error: `profile package.json 未声明 ${UPDATE_PACKAGE}` }
  if (/^(?:link|file):/.test(spec)) {
    return { ok: false, error: 'profile 依赖仍为 link:/file: 开发链接，Release 未接管运行插件', dependencySpec: spec }
  }
  const installed = readJson(path.join(root, 'node_modules', UPDATE_PACKAGE, 'package.json'))
  const installedVersion = installed && installed.version ? String(installed.version) : ''
  if (installedVersion !== expected) {
    return {
      ok: false,
      error: `安装命令已完成，但运行 profile 中检测到版本 ${installedVersion || '未知'}，期望 ${expected}`,
      dependencySpec: spec,
      installedVersion
    }
  }
  if (expectedTag) {
    const archive = releaseArchiveUrl(expectedTag)
    const tagPart = `/archive/refs/tags/${encodeURIComponent(expectedTag)}.tar.gz`
    if (spec !== archive && !spec.includes(tagPart)) {
      return {
        ok: false,
        error: '运行 profile 已出现目标版本，但依赖未固定到本次 GitHub Release tarball',
        dependencySpec: spec,
        installedVersion
      }
    }
  }
  return { ok: true, dependencySpec: spec, installedVersion }
}
