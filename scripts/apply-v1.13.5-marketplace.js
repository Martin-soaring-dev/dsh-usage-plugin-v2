import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  if (text.indexOf(from, i + from.length) >= 0) throw new Error(`non-unique patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}

const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.version = '1.13.5'
pkg.keywords = Array.from(new Set([
  ...(Array.isArray(pkg.keywords) ? pkg.keywords : []),
  'deepseek-harness',
  'dsh-plugin',
  'usage-tracker',
  'token-usage',
  'cost-tracker',
  'siliconflow',
  'digitalocean'
]))
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

const enPath = 'README.md'
let en = fs.readFileSync(enPath, 'utf8')
const enAnchor = '### Recommended Installation\n\nUse the GitHub Release command for the first installation:\n'
const enMarketplace = `### DSH Plugin Marketplace Readiness\n\nThis repository is prepared to be discoverable and installable as a standard DSH bundle plugin. It declares the DSH bundle patch in \`package.json\`, ships \`cordis.patch.yml\`, exposes the browser client entry, and includes marketplace-oriented metadata/keywords.\n\nFor first installation, the canonical package source remains the stable GitHub Release tarball:\n\n\`\`\`bash\ndsh plugin --profile web add "https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz"\n\`\`\`\n\nAfter a marketplace installs the package, later upgrades can continue through **Settings → Plugin Update** using this repository's GitHub Releases. No npm publication is required by this project.\n\n> Marketplace operators may use different discovery/indexing rules. To improve discoverability, add the GitHub repository topic \`dsh-plugin\` (plus optional topics such as \`deepseek-harness\`, \`usage-tracker\`, and \`cost-tracker\`) on the repository page.\n\n---\n\n`
if (!en.includes('### DSH Plugin Marketplace Readiness')) en = replaceOnce(en, enAnchor, enMarketplace + enAnchor, 'English marketplace section')
en = en.replaceAll('v1.12.0.tar.gz', 'v1.13.5.tar.gz').replaceAll('1.12.0.tgz', '1.13.5.tgz')
fs.writeFileSync(enPath, en)

const zhPath = 'README.zh.md'
let zh = fs.readFileSync(zhPath, 'utf8')
const zhAnchor = '### 推荐安装方式\n\n首次安装使用 GitHub Release 命令：\n'
const zhMarketplace = `### DSH 插件市场准备\n\n本仓库已经按标准 DSH Bundle 插件的形式整理：\`package.json\` 声明 Bundle patch，仓库包含 \`cordis.patch.yml\`，同时暴露 Web Client 入口，并补充了适合插件市场检索的元数据与关键词。\n\n首次安装仍以本仓库的稳定 GitHub Release tarball 为唯一正式包源：\n\n\`\`\`bash\ndsh plugin --profile web add "https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz"\n\`\`\`\n\n如果某个 DSH 插件市场完成首次安装，后续版本仍可继续通过 **设置 → 插件更新** 从本仓库 GitHub Releases 更新，不要求本项目发布 npm 包。\n\n> 不同插件市场的收录/索引规则可能不同。为提高可发现性，建议在 GitHub 仓库页面手动添加 \`dsh-plugin\` Topic，并可附加 \`deepseek-harness\`、\`usage-tracker\`、\`cost-tracker\` 等 Topic。\n\n---\n\n`
if (!zh.includes('### DSH 插件市场准备')) zh = replaceOnce(zh, zhAnchor, zhMarketplace + zhAnchor, 'Chinese marketplace section')
zh = zh.replaceAll('v1.12.0.tar.gz', 'v1.13.5.tar.gz').replaceAll('1.12.0.tgz', '1.13.5.tgz')
fs.writeFileSync(zhPath, zh)

let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const marker = '## Unreleased\n'
const entry = `\n## v1.13.5 (2026-08-20)\n\n- **插件市场准备**：补充 \`dsh-plugin\`、\`deepseek-harness\`、usage/cost tracker 等 package keywords，增强市场与仓库搜索可发现性。\n- **安装文档更新**：中英文 README 新增 DSH 插件市场准备说明，明确标准 Bundle 契约与 GitHub Release 首次安装路径。\n- **安装链接刷新**：README 中历史固定的 v1.12.0 示例统一更新为 v1.13.5，避免新用户复制旧版本安装命令。\n- **发行策略保持不变**：仍不发布 npm 包；首次安装使用 GitHub Release，后续可通过插件内 GitHub Release updater 更新。\n\n`
if (!changelog.includes('## v1.13.5 (2026-08-20)')) changelog = changelog.replace(marker, marker + entry)
fs.writeFileSync('CHANGELOG.md', changelog)

fs.mkdirSync('docs/releases', { recursive: true })
fs.writeFileSync('docs/releases/v1.13.5.md', `# v1.13.5\n\n本版本面向 DSH 插件市场/目录收录做元数据和安装文档准备，不改变用量统计或余额查询逻辑。\n\n## 更新内容\n\n- package keywords 增加 \`dsh-plugin\`、\`deepseek-harness\`、\`usage-tracker\`、\`token-usage\`、\`cost-tracker\`、\`siliconflow\`、\`digitalocean\`。\n- 中英文 README 增加“插件市场准备”章节。\n- README 首次安装示例统一更新到 v1.13.5 GitHub Release tarball。\n- 继续采用 GitHub Releases-only 分发与插件内自更新，不要求 npm 发布。\n\n## 仓库页面仍需人工操作\n\n建议在 GitHub 仓库 About 区域添加 Topic：\`dsh-plugin\`。不同 DSH 插件市场的具体收录规则由各市场决定，本版本不假定某个市场会自动收录。\n`)

console.log('v1.13.5 marketplace readiness patch applied')
