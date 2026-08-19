import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}

let host = fs.readFileSync('lib/index.js', 'utf8')
if (!host.includes("provider === 'digital-ocean' || provider === 'digitalocean') {\n                  try { await refreshFxRate(false)")) {
  host = replaceOnce(host,
`              if (usage) {
                records.push({
`,
`              if (usage) {
                if (provider === 'digital-ocean' || provider === 'digitalocean') {
                  try { await refreshFxRate(false) } catch (e) {}
                }
                records.push({
`, 'capture rate before DigitalOcean record')
}
fs.writeFileSync('lib/index.js', host)

let client = fs.readFileSync('lib/client.js', 'utf8')
client = client.replace(
`      infobox: { border: "1px solid rgba(90,140,255,.35)", background: "rgba(90,140,255,.08)", borderRadius: 8, padding: 12, fontSize: fs(12) },`,
`      infobox: { border: "1px solid rgba(90,140,255,.35)", background: "rgba(90,140,255,.08)", borderRadius: 8, padding: 12, marginTop: 18, fontSize: fs(12) },`
)
client = client.replace(
`          "DeepSeek 官方请求按官方峰谷价；已核验的 SiliconFlow 请求按 SiliconFlow 固定公开价，不套用 DeepSeek 峰谷折扣。其他尚无可靠精确价格映射的服务商暂按 0 统计。模型名与 API 服务商均以请求参数为准。")`,
`          "DeepSeek 官方请求按官方峰谷价；SiliconFlow 按自身人民币公开价；DigitalOcean 按美元公开价 × USD/CNY 汇率折算人民币；千问暂不计费；AMD GPU Cloud DeepSeek V4 Flash 免费按 ¥0。模型名与 API 服务商均以请求参数为准。")`
)
client = client.replace(
`        el("div", { style: st.note, marginTop: 6 }, "只把能与记录中的 provider/model 可靠匹配的价格用于自动计费；不同币种不会强行合并。"),`,
`        el("div", { style: st.note, marginTop: 6 }, "只把能与记录中的 provider/model 可靠匹配的价格用于自动计费；美元价格先按 USD 计算，再乘 USD/CNY 汇率统一折算成人民币。"),`
)
fs.writeFileSync('lib/client.js', client)
console.log('v1.13.0 FX finalize applied')
