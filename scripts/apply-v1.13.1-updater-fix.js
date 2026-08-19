import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  if (text.indexOf(from, i + from.length) >= 0) throw new Error(`non-unique patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}

let host = fs.readFileSync('lib/index.js', 'utf8')
host = replaceOnce(host,
`  RELEASE_API_URL,
  profileRootFromModule,
  releaseArchiveUrl,
  releaseInfo
} from './updater.js'`,
`  RELEASE_API_URL,
  profileRootFromModule,
  releaseArchiveUrl,
  releaseInfo,
  verifyProfileInstall
} from './updater.js'`,
'import updater verification')

const oldInstall = `      async function installUpdate(requestedTag) {
        const checked = await checkForUpdate()
        if (!checked.ok) return checked
        if (!checked.updateAvailable) return fail('当前已是最新版本')
        if (String(requestedTag || '') !== checked.tag) return fail('Release 已发生变化，请重新检查更新')
        if (!PROFILE_ROOT) return fail('无法定位当前 Harness profile；请按 README 的 GitHub 安装命令手动更新')
        const subprocess = ctx.get('subprocess')
        if (!subprocess) return fail('命令执行服务不可用')
        let pnpm = null
        for (const candidate of IS_WIN ? ['pnpm.cmd', 'pnpm.exe', 'pnpm'] : ['pnpm']) {
          try { pnpm = await subprocess.resolveExecutable(candidate); if (pnpm) break } catch (e) {}
        }
        if (!pnpm) return fail('未找到 pnpm；请先安装 pnpm，或按 README 手动更新')
        const archiveUrl = releaseArchiveUrl(checked.tag)
        const result = await runCollect([pnpm, 'add', archiveUrl, '--save-exact'], {
          cwd: PROFILE_ROOT,
          graceMs: 120000
        })
        if (!result.ok) {
          const detail = String(result.err || result.error || '').trim()
          return fail('安装 GitHub Release 失败' + (detail ? '：' + detail.slice(0, 1000) : ''))
        }
        return {
          ok: true,
          installedVersion: checked.latestVersion,
          tag: checked.tag,
          restartRequired: true,
          message: '更新文件已安装。请完全重启 Harness 服务后生效。'
        }
      }`

const newInstall = `      async function installUpdate(requestedTag) {
        const checked = await checkForUpdate()
        if (!checked.ok) return checked
        if (!checked.updateAvailable) return fail('当前已是最新版本')
        if (String(requestedTag || '') !== checked.tag) return fail('Release 已发生变化，请重新检查更新')
        if (!PROFILE_ROOT) return fail('无法定位当前运行的 DSH profile；检测到的插件路径不属于可确认的 profile，请按 README 手动更新')
        const subprocess = ctx.get('subprocess')
        if (!subprocess) return fail('命令执行服务不可用')
        let pnpm = null
        for (const candidate of IS_WIN ? ['pnpm.cmd', 'pnpm.exe', 'pnpm'] : ['pnpm']) {
          try { pnpm = await subprocess.resolveExecutable(candidate); if (pnpm) break } catch (e) {}
        }
        if (!pnpm) return fail('未找到 pnpm；请先安装 pnpm，或按 README 手动更新')
        const archiveUrl = releaseArchiveUrl(checked.tag)
        const result = await runCollect([pnpm, 'add', archiveUrl, '--save-exact'], {
          cwd: PROFILE_ROOT,
          graceMs: 120000
        })
        if (!result.ok) {
          const detail = String(result.err || result.error || '').trim()
          return fail('安装 GitHub Release 失败' + (detail ? '：' + detail.slice(0, 1000) : ''))
        }
        const verified = verifyProfileInstall(PROFILE_ROOT, checked.latestVersion, checked.tag)
        if (!verified.ok) {
          return fail('更新命令执行完成，但安装验证失败：' + verified.error + (verified.dependencySpec ? '；当前依赖：' + verified.dependencySpec : ''))
        }
        return {
          ok: true,
          installedVersion: verified.installedVersion,
          dependencySpec: verified.dependencySpec,
          profileRoot: PROFILE_ROOT,
          tag: checked.tag,
          restartRequired: true,
          message: '已在当前 DSH profile 安装并验证目标 Release。请完全重启 Harness 服务后生效。'
        }
      }`
host = replaceOnce(host, oldInstall, newInstall, 'install update verification')
fs.writeFileSync('lib/index.js', host)

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.version = '1.13.1'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')

let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const entry = `## v1.13.1 (2026-08-19)\n\n- **修复更新装错目录**：开发态插件位于 workspace 的 \`.dsh/plugins/...\` 时，不再把 workspace \`.dsh\` 误判为运行中的 DSH profile；改为扫描 \`~/.dsh/profiles/*/package.json\`，按 \`link:/file:\` 依赖精确反查真正的 profile。\n- **开发链接迁移到 Release**：在真正的 profile 目录执行 \`pnpm add <GitHub Release tarball> --save-exact\`，使正式运行依赖从 \`link:\` 切换为固定 Release tarball。\n- **安装后验证**：只有当运行 profile 的依赖不再是 \`link:/file:\`、且 \`node_modules/dsh-usage-plugin-v2/package.json\` 的版本与目标 Release 完全一致时才报告成功，杜绝“命令成功但 DSH 仍加载旧版本”的假成功。\n- **拒绝猜测 profile**：无法唯一确认运行 profile 时停止自动更新并给出错误，而不是修改无关 workspace。\n\n`
if (!changelog.includes('## v1.13.1 (2026-08-19)')) changelog = changelog.replace('## Unreleased\n', '## Unreleased\n\n' + entry)
fs.writeFileSync('CHANGELOG.md', changelog)
console.log('v1.13.1 updater fix applied')
