import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  if (text.indexOf(from, i + from.length) >= 0) throw new Error(`non-unique patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}

let client = fs.readFileSync('lib/client.js', 'utf8')

const credentialBlock = `        provider === "siliconflow"
          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 18 }) },
              el("div", { style: st.infoboxTitle }, "凭据读取规则"),
              el("div", null, "插件只检查“设置 → 模型”中 Provider ID 或显示名为 siliconflow 的提供商，并读取其 apiKeyEnv 对应的已保存 API Key。"),
              el("div", { style: st.note, marginTop: 6 }, "如果未找到提供商、未填写 API Key 或凭据引用失效，插件会停止查询并说明需要修复的配置；不会回退到其他服务商的 Key。")
            )
          : null,
`
client = replaceOnce(client, credentialBlock, '', 'remove early SiliconFlow credential box')

const explanatoryBlocks = `        d && d.ok && d.provider === "siliconflow" && d.zeroBalance
          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 18 }) },
              el("div", { style: st.infoboxTitle }, "公开 API 已成功返回 ¥0.00"),
              el("div", null, "SiliconFlow 的 /v1/user/info 当前不返回代金券或历史用量；控制台可用总额可能非零。这里忠实展示 API 原始余额字段，不把它等同于控制台完整额度。"),
              el("a", { style: st.actionLink, href: selected.actionUrl, target: "_blank", rel: "noreferrer" }, selected.actionLabel)
            )
          : null,
        d && d.ok && d.provider === "siliconflow"
          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 18 }) },
              el("div", { style: st.infoboxTitle }, "SiliconFlow 返回字段"),
              (d.fieldDefinitions || []).map(function (item) {
                return el("div", { key: item.name, style: { marginTop: 4 } }, item.name + "：" + item.meaning);
              })
            )
          : null,
`
client = replaceOnce(client, explanatoryBlocks, '', 'remove early SiliconFlow explanatory boxes')

const cardsAnchor = `        d && d.ok
          ? el("div", { style: st.cards },
              (d.details || []).map(function (item, idx) {
                return el(Card, { key: String(idx), label: item.label, value: symbol + " " + fmtBalance(item.value), hint: item.hint });
              }),
              d.generatedAt ? el(Card, { label: "账单更新时间", value: fmtTime(Date.parse(d.generatedAt)), hint: d.generatedAt }) : null,
              el(Card, { label: "查询时间", value: fmtTime(d.queriedAt), hint: "北京时间" })
            )
          : null,
`
const cardsThenInfo = cardsAnchor + `        d && d.ok && d.provider === "siliconflow"
          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 22 }) },
              el("div", { style: st.infoboxTitle }, "SiliconFlow 查询说明"),
              d.zeroBalance
                ? el("div", null,
                    el("div", null, "公开 API 已成功返回 ¥0.00。SiliconFlow 的 /v1/user/info 当前不返回代金券或历史用量；控制台可用总额可能非零。这里忠实展示 API 原始余额字段，不把它等同于控制台完整额度。"),
                    el("a", { style: st.actionLink, href: selected.actionUrl, target: "_blank", rel: "noreferrer" }, selected.actionLabel)
                  )
                : el("div", null, "余额卡片展示 SiliconFlow /v1/user/info 公开 API 返回的原始余额字段。"),
              el("div", { style: { marginTop: 12, fontWeight: 600 } }, "返回字段"),
              (d.fieldDefinitions || []).map(function (item) {
                return el("div", { key: item.name, style: { marginTop: 4 } }, item.name + "：" + item.meaning);
              })
            )
          : null,
        provider === "siliconflow"
          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 14 }) },
              el("div", { style: st.infoboxTitle }, "凭据读取规则"),
              el("div", null, "插件只检查“设置 → 模型”中 Provider ID 或显示名为 siliconflow 的提供商，并读取其 apiKeyEnv 对应的已保存 API Key。"),
              el("div", { style: st.note, marginTop: 6 }, "如果未找到提供商、未填写 API Key 或凭据引用失效，插件会停止查询并说明需要修复的配置；不会回退到其他服务商的 Key。")
            )
          : null,
`
client = replaceOnce(client, cardsAnchor, cardsThenInfo, 'place SiliconFlow explanation after balance cards')

fs.writeFileSync('lib/client.js', client)

const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.version = '1.13.2'
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const marker = '## Unreleased\n'
const entry = `\n## v1.13.2 (2026-08-20)\n\n- **SiliconFlow 余额页重排**：账户总余额下方直接显示充值余额、赠送/旧版免费余额与查询时间，先呈现用户最关心的余额信息。\n- **说明信息后置**：将“查询说明 / 返回字段 / 凭据读取规则”等蓝色说明框移动到余额卡片之后，减少余额结果与明细之间的视觉打断。\n- **合并说明框**：将零余额解释和返回字段说明合并为“SiliconFlow 查询说明”，页面结构更紧凑、阅读顺序更自然。\n- **更新验证版本**：作为 v1.13.1 自更新器修复后的首个补丁版本，用于验证从 1.13.1 到 1.13.2 的 UI 自动更新链路。\n\n`
if (!changelog.includes('## v1.13.2 (2026-08-20)')) changelog = changelog.replace(marker, marker + entry)
fs.writeFileSync('CHANGELOG.md', changelog)

console.log('v1.13.2 balance layout patch applied')
