import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  if (text.indexOf(from, i + from.length) >= 0) throw new Error(`non-unique patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}

let client = fs.readFileSync('lib/client.js', 'utf8')

const digitalOceanBox = `        provider === "digitalocean"
          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 18 }) },
              el("div", { style: st.infoboxTitle }, "DigitalOcean Account API"),
              el("div", null, "请创建账户级 Personal Access Token。可选 Read Only（api:read，包含 billing:read），或自定义 billing:read；不要使用 Gradient AI 推理 Key。"),
              el("a", { style: st.actionLink, href: selected.actionUrl, target: "_blank", rel: "noreferrer" }, selected.actionLabel),
              el("div", { style: st.note, marginTop: 8 }, credential.status === "loading"
                ? "正在检查已保存的 Token…"
                : credential.configured
                  ? "已保存：" + (credential.masked || "••••••••••••") + (credential.source ? "（来源：" + credential.source + "）" : "")
                  : credential.status === "error"
                    ? "无法读取 Token 状态：" + (credential.error || "未知错误")
                    : "尚未保存 DIGITALOCEAN_TOKEN。"),
              el("div", { style: st.actions, marginTop: 8 },
                el("input", {
                  type: "password",
                  autoComplete: "new-password",
                  spellCheck: false,
                  style: st.input,
                  placeholder: credential.configured ? "输入新的 dop_v1_ Token 可替换（当前值已隐藏）" : "dop_v1_…",
                  value: digitalOceanToken,
                  disabled: saving.status === "saving" || (credential.configured && !credential.writable),
                  onChange: function (e) { setDigitalOceanToken(e.target.value); }
                }),
                el("button", {
                  style: saving.status === "saving" || (credential.configured && !credential.writable) ? st.btnDisabled : st.btnPrimary,
                  disabled: saving.status === "saving" || (credential.configured && !credential.writable),
                  onClick: saveDigitalOceanCredential
                }, saving.status === "saving" ? "保存中…" : "保存并查询")
              ),
              credential.configured && !credential.writable
                ? el("div", { style: st.note, marginTop: 6 }, "当前 Token 来自只读环境变量；请在原来源中修改，页面不会覆盖它。")
                : null,
              saving.status === "done" ? el("div", { style: st.note, marginTop: 6, color: "#2ecc71", opacity: 1 }, "Token 已安全保存；页面和 API 响应不会回传明文。") : null,
              saving.status === "error" ? el("div", { style: st.err, marginTop: 6 }, saving.error) : null
            )
          : null,
`

client = replaceOnce(client, digitalOceanBox, '', 'remove early DigitalOcean account box')

const cardsBlock = `        d && d.ok
          ? el("div", { style: st.cards },
              (d.details || []).map(function (item, idx) {
                return el(Card, { key: String(idx), label: item.label, value: symbol + " " + fmtBalance(item.value), hint: item.hint });
              }),
              d.generatedAt ? el(Card, { label: "账单更新时间", value: fmtTime(Date.parse(d.generatedAt)), hint: d.generatedAt }) : null,
              el(Card, { label: "查询时间", value: fmtTime(d.queriedAt), hint: "北京时间" })
            )
          : null,
`

client = replaceOnce(client, cardsBlock, cardsBlock + digitalOceanBox, 'place DigitalOcean account box after usage cards')
fs.writeFileSync('lib/client.js', client)

const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.version = '1.13.4'
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const marker = '## Unreleased\n'
const entry = `\n## v1.13.4 (2026-08-20)\n\n- **DigitalOcean 余额页重排**：将“DigitalOcean Account API”凭据说明与 Token 管理区从余额结果上方移动到余额明细卡片之后。\n- **阅读顺序优化**：查询成功后优先展示可用信用余额、本月至今使用、账单更新时间和查询时间，再展示账户 API / Token 管理说明，减少核心账单信息被配置说明打断。\n- **版本更新**：用于继续验证 v1.13.3 加固后的 GitHub Release 自更新链路。\n\n`
if (!changelog.includes('## v1.13.4 (2026-08-20)')) changelog = changelog.replace(marker, marker + entry)
fs.writeFileSync('CHANGELOG.md', changelog)

fs.mkdirSync('docs/releases', { recursive: true })
fs.writeFileSync('docs/releases/v1.13.4.md', `# v1.13.4\n\n本版本优化 DigitalOcean 余额查询页面的信息层级。\n\n## 更新内容\n\n- 将 **DigitalOcean Account API** 配置框移动到余额明细卡片之后。\n- 查询成功后的阅读顺序调整为：可用信用余额 → 本月至今使用 / 账单更新时间 / 查询时间 → DigitalOcean Account API。\n- Token 保存、替换、权限说明等功能保持不变，仅调整展示位置。\n\n## 验证重点\n\n从 v1.13.3 的“插件更新”页面安装 v1.13.4，重启 DSH 后确认 DigitalOcean 页面布局与版本号。\n`)

console.log('v1.13.4 patch applied')
