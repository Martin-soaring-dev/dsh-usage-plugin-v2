import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const UPDATE_REPOSITORY = 'Martin-soaring-dev/dsh-usage-plugin-v2'
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

export function profileRootFromModule(moduleUrl) {
  const packageRoot = path.dirname(path.dirname(fileURLToPath(moduleUrl)))
  const parts = packageRoot.split(path.sep)

  // Standard pnpm/npm installation: <profile>/node_modules/...
  const nodeModulesRoot = rootBefore(parts, 'node_modules', packageRoot)
  if (nodeModulesRoot) return nodeModulesRoot

  // Harness may mount unpacked GitHub packages under <profile>/plugins/...
  // In that layout there is no node_modules segment, but pnpm still needs to
  // run from the profile root so it can replace the currently installed plugin.
  const pluginsRoot = rootBefore(parts, 'plugins', packageRoot)
  if (pluginsRoot) return pluginsRoot

  return ''
}
