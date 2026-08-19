import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  if (text.indexOf(from, i + from.length) >= 0) throw new Error(`non-unique patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}

let client = fs.readFileSync('lib/client.js', 'utf8')
client = replaceOnce(client, 'el("div", { style: st.sec }, "今日 USD / CNY 汇率")', 'el("div", { style: st.sec }, "今日 $ / ¥ 汇率")', 'FX section title')
client = replaceOnce(client, 'el(Card, { label: "USD → CNY", value: fx.rate ? ("1 USD = ¥" + Number(fx.rate).toFixed(4)) : "暂不可用", hint: fx.date ? ("汇率日期 " + fx.date) : "等待获取" })', 'el(Card, { label: "$ → ¥", value: fx.rate ? ("$1 = ¥" + Number(fx.rate).toFixed(4)) : "暂不可用", hint: fx.date ? ("汇率日期 " + fx.date) : "等待获取" })', 'USD to CNY card')
client = replaceOnce(client, 'el(Card, { label: "CNY → USD", value: fx.inverse ? ("¥1 = $" + Number(fx.inverse).toFixed(6)) : "暂不可用", hint: fx.source || "Frankfurter" })', 'el(Card, { label: "¥ → $", value: fx.inverse ? ("¥1 = $" + Number(fx.inverse).toFixed(6)) : "暂不可用", hint: fx.source || "Frankfurter" })', 'CNY to USD card')
fs.writeFileSync('lib/client.js', client)

let index = fs.readFileSync('lib/index.js', 'utf8')
const oldInstall = `        const archiveUrl = releaseArchiveUrl(checked.tag)
        const result = await runCollect([pnpm, 'add', archiveUrl, '--save-exact'], {
          cwd: PROFILE_ROOT,
          graceMs: 120000
        })
        if (!result.ok) {
          const detail = String(result.err || result.error || '').trim()
          return fail('安装 GitHub Release 失败' + (detail ? '：' + detail.slice(0, 1000) : ''))
        }
`
const newInstall = `        const archiveUrl = releaseArchiveUrl(checked.tag)
        // pnpm is commonly a JS launcher with #!/usr/bin/env node. DSH may itself
        // run on a newer Node than the login shell's default Node, so prepend the
        // current Harness runtime directory to PATH. This makes pnpm use the same
        // Node runtime as DSH instead of accidentally falling back to an older one.
        const runtimeNode = (typeof process !== 'undefined' && process.execPath) ? String(process.execPath) : ''
        const runtimeDir = runtimeNode ? path.dirname(runtimeNode) : ''
        const inheritedEnv = (typeof process !== 'undefined' && process.env) ? { ...process.env } : {}
        const pathKey = Object.prototype.hasOwnProperty.call(inheritedEnv, 'PATH') ? 'PATH'
          : Object.prototype.hasOwnProperty.call(inheritedEnv, 'Path') ? 'Path' : 'PATH'
        const oldPath = String(inheritedEnv[pathKey] || '')
        if (runtimeDir) inheritedEnv[pathKey] = runtimeDir + (oldPath ? path.delimiter + oldPath : '')
        // A pinned, user-requested GitHub Release should not be blocked because an
        // unrelated dependency in the existing profile lockfile is younger than
        // pnpm's minimumReleaseAge policy. Scope the override to this update only.
        inheritedEnv.npm_config_minimum_release_age = '0'
        const result = await runCollect([pnpm, 'add', archiveUrl, '--save-exact'], {
          cwd: PROFILE_ROOT,
          graceMs: 120000,
          env: inheritedEnv
        })
        if (!result.ok) {
          const stdout = String(result.out || '').trim()
          const stderr = String(result.err || result.error || '').trim()
          const diagnostics = [
            result.exitCode != null ? ('exitCode=' + result.exitCode) : '',
            'profile=' + PROFILE_ROOT,
            runtimeNode ? ('node=' + runtimeNode) : '',
            pnpm ? ('pnpm=' + pnpm) : '',
            stderr ? ('stderr=' + stderr) : '',
            stdout ? ('stdout=' + stdout) : ''
          ].filter(Boolean).join('；')
          return fail('安装 GitHub Release 失败' + (diagnostics ? '：' + diagnostics.slice(0, 3000) : ''))
        }
`
index = replaceOnce(index, oldInstall, newInstall, 'updater install command')
fs.writeFileSync('lib/index.js', index)

const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.version = '1.13.3'
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const marker = '## Unreleased\n'
const entry = `\n## v1.13.3 (2026-08-20)\n\n- **更新器运行时修复**：自动更新执行 pnpm 时优先使用当前 DSH/Harness 进程所在的 Node 运行时目录，避免系统默认旧版 Node 导致 pnpm 启动失败。\n- **供应链策略兼容**：仅对明确指定的 GitHub Release 更新命令临时设置 minimumReleaseAge=0，避免 profile 中无关的新依赖阻断插件升级；不会修改用户的全局 pnpm 配置。\n- **更新失败诊断增强**：错误信息现在包含 exitCode、profile、Node、pnpm、stderr 与 stdout，后续排错不再只显示笼统的“安装 GitHub Release 失败”。\n- **汇率显示统一**：价格页汇率区域使用货币符号（$ / ¥）替代 USD / CNY 字母代码，显示更紧凑。\n\n`
if (!changelog.includes('## v1.13.3 (2026-08-20)')) changelog = changelog.replace(marker, marker + entry)
fs.writeFileSync('CHANGELOG.md', changelog)

fs.mkdirSync('docs/releases', { recursive: true })
fs.writeFileSync('docs/releases/v1.13.3.md', `# v1.13.3\n\n本版本重点加固 GitHub Release 自动更新链路，并统一汇率区域的货币符号显示。\n\n## 更新内容\n\n- 自动更新时让 pnpm 优先使用当前 DSH/Harness 所在的 Node runtime，避免 DSH 使用 Node 24、系统 shell 却使用 Node 20 时出现 pnpm 启动失败。\n- 对本次已确认的 GitHub Release 安装命令局部设置 minimumReleaseAge=0，避免无关依赖的发布时间策略阻断插件自身更新；不修改全局设置。\n- 自动更新失败时回传 exitCode、实际 profile、Node、pnpm、stderr/stdout，便于直接定位问题。\n- 汇率区域将 \`USD / CNY\`、\`USD → CNY\`、\`CNY → USD\` 改为 \`$ / ¥\`、\`$ → ¥\`、\`¥ → $\`。\n\n## 验证重点\n\n请从 v1.13.2 的“插件更新”页面直接安装 v1.13.3，并在完全重启 DSH 后确认当前版本为 1.13.3。\n`)

console.log('v1.13.3 patch applied')
