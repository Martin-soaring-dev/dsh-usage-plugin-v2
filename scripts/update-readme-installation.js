import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  if (text.indexOf(from, i + from.length) >= 0) throw new Error(`non-unique patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}

const enPath = 'README.md'
let en = fs.readFileSync(enPath, 'utf8')
const enOld = `### Recommended Installation\n\nUse the GitHub Release command for the first installation:\n\n\`\`\`bash\n# Prerequisite: install dsh (npm install -g @deepseek-ai/dsh)\ndsh plugin --profile web add \"https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz\"\n\`\`\`\n\nOr install to another profile:\n\n\`\`\`bash\ndsh plugin --profile web add \"https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz\"\ndsh plugin --profile headless add \"https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz\"\n\`\`\`\n\nRestart the dsh web service after installation. Detailed manual install / wiring / uninstall / troubleshooting follows below.\n`
const enNew = `### Recommended Installation\n\nThe following flow has been verified with the standard DeepSeek Harness CLI and does **not** require changing directories or knowing where DSH is installed.\n\n1. Install the official DSH CLI globally (skip this step if \`dsh --version\` already works):\n\n\`\`\`bash\nnpm install -g @deepseek-ai/dsh\n\`\`\`\n\n2. Verify the CLI:\n\n\`\`\`bash\ndsh --version\n\`\`\`\n\nIf your shell still says that \`dsh\` is not recognized immediately after installation, close that terminal and open a new one, then retry.\n\n3. Install this plugin into the default Web profile directly from the stable GitHub Release:\n\n\`\`\`bash\ndsh plugin --profile web add \"https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz\"\n\`\`\`\n\n4. Restart DeepSeek Harness:\n\n\`\`\`bash\ndsh web\n\`\`\`\n\nIf the default Web port is already occupied, start DSH on another port, for example:\n\n\`\`\`bash\ndsh web --port 3070\n\`\`\`\n\nNo \`cd\`, local installation path, YAML editing, or manual file copying is required. For another profile, replace \`web\` with the desired profile name. Detailed manual install / wiring / uninstall / troubleshooting follows below.\n`
en = replaceOnce(en, enOld, enNew, 'English recommended installation')
fs.writeFileSync(enPath, en)

const zhPath = 'README.zh.md'
let zh = fs.readFileSync(zhPath, 'utf8')
const zhOld = `### 推荐安装方式\n\n首次安装使用 GitHub Release 命令：\n\n\`\`\`bash\n# 前提：已安装 dsh（npm install -g @deepseek-ai/dsh）\ndsh plugin --profile web add \"https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz\"\n\`\`\`\n\n也可对其它 profile 安装：\n\n\`\`\`bash\ndsh plugin --profile web add \"https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz\"\ndsh plugin --profile headless add \"https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz\"\n\`\`\`\n\n装完重启 dsh web 服务即可。详细的手动安装 / 接线 / 卸载 / 排障说明见下方。\n`
const zhNew = `### 推荐安装方式\n\n下面这套流程已经通过标准 DeepSeek Harness CLI 验证，**不需要切换目录，也不需要知道 DSH 安装在本机哪个路径**。\n\n1. 全局安装官方 DSH CLI（如果 \`dsh --version\` 已经能运行，可以跳过）：\n\n\`\`\`bash\nnpm install -g @deepseek-ai/dsh\n\`\`\`\n\n2. 验证 DSH CLI：\n\n\`\`\`bash\ndsh --version\n\`\`\`\n\n如果刚安装完成后终端仍提示无法识别 \`dsh\`，关闭当前终端并重新打开一个，再执行上述命令。\n\n3. 直接从稳定 GitHub Release 安装本插件到默认 Web profile：\n\n\`\`\`bash\ndsh plugin --profile web add \"https://github.com/Martin-soaring-dev/dsh-usage-plugin-v2/archive/refs/tags/v1.13.5.tar.gz\"\n\`\`\`\n\n4. 重启 DeepSeek Harness：\n\n\`\`\`bash\ndsh web\n\`\`\`\n\n如果默认 Web 端口已经被其它进程占用，可以指定其它端口，例如：\n\n\`\`\`bash\ndsh web --port 3070\n\`\`\`\n\n整个安装过程**不需要 \`cd\`、不需要填写任何本地安装路径、不需要手改 YAML，也不需要复制插件文件**。如需安装到其它 profile，只需把 \`web\` 换成目标 profile 名。详细的手动安装 / 接线 / 卸载 / 排障说明见下方。\n`
zh = replaceOnce(zh, zhOld, zhNew, 'Chinese recommended installation')
fs.writeFileSync(zhPath, zh)

console.log('README installation instructions updated')
