import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const idx = text.indexOf(from)
  if (idx < 0) throw new Error(`patch target not found: ${label}`)
  if (text.indexOf(from, idx + from.length) >= 0) throw new Error(`patch target not unique: ${label}`)
  return text.slice(0, idx) + to + text.slice(idx + from.length)
}

// 1) Provider-aware pricing: SiliconFlow verified public prices.
let host = fs.readFileSync('lib/index.js', 'utf8')
const pricingAnchor = `      const PRICE_MODELS = ['deepseek-v4-flash', 'deepseek-v4-pro']\n`
host = replaceOnce(host, pricingAnchor, pricingAnchor + `      // 第三方平台已核验价格（2026-08-19）。单位：元 / 百万 tokens。\n      // 仅对有公开、稳定且能与请求 model/provider 精确匹配的条目启用计费。\n      const SILICONFLOW_PRICING = {\n        'deepseek-ai/deepseek-v4-flash': { cacheHit: 0.02, cacheMiss: 1.0, output: 2.0 },\n        'deepseek-ai/deepseek-v4-pro': { cacheHit: 1.0, cacheMiss: 12.0, output: 24.0 },\n        'deepseek-ai/deepseek-v3.2': { cacheHit: 0.4, cacheMiss: 4.0, output: 6.0 },\n        'pro/deepseek-ai/deepseek-v3.2': { cacheHit: 0.4, cacheMiss: 4.0, output: 6.0 },\n        // SiliconFlow 公告只给出 Qwen3.6-27B 输入/输出价；若未来出现 cacheReadTokens，\n        // 在没有单独缓存价前按普通输入价计，避免误计为免费。\n        'qwen/qwen3.6-27b': { cacheHit: 3.0, cacheMiss: 3.0, output: 18.0 }\n      }\n`, 'third-party pricing constants')

const costAnchor = `      function costFor(rec, regime) {\n        const mk = modelKey(rec.model)\n        const hit = rec.cacheReadTokens || 0\n        const miss = rec.inputTokens || 0\n        const out = rec.outputTokens || 0\n`
host = replaceOnce(host, costAnchor, `      function costFor(rec, regime) {\n        const provider = String(rec.provider || '').trim().toLowerCase()\n        const model = String(rec.model || '').trim().toLowerCase()\n        const hit = rec.cacheReadTokens || 0\n        const miss = rec.inputTokens || 0\n        const out = rec.outputTokens || 0\n        // SiliconFlow 不使用 DeepSeek 官方峰谷价；按 SiliconFlow 自身公开模型价格计费。\n        if (provider === 'siliconflow') {\n          const sp = SILICONFLOW_PRICING[model]\n          if (!sp) return 0\n          return (hit * sp.cacheHit + miss * sp.cacheMiss + out * sp.output) / 1e6\n        }\n        const mk = modelKey(rec.model)\n`, 'provider-aware cost')
fs.writeFileSync('lib/index.js', host)

// 2) Client UI: provider column, third-party reference price table, and more vertical spacing for info boxes.
let client = fs.readFileSync('lib/client.js', 'utf8')
client = replaceOnce(client,
  `      infobox: { border: "1px solid rgba(90,140,255,.35)", background: "rgba(90,140,255,.08)", borderRadius: 8, padding: 12, fontSize: fs(12) },`,
  `      infobox: { border: "1px solid rgba(90,140,255,.35)", background: "rgba(90,140,255,.08)", borderRadius: 8, padding: 12, marginTop: 18, fontSize: fs(12) },`,
  'balance info-box spacing')

client = replaceOnce(client,
  `      var modelRows = [];\n      for (var k in byModel) modelRows.push(byModel[k]);\n      modelRows.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });\n      var providerRows = [];`,
  `      var modelRows = [];\n      for (var k in byModel) modelRows.push(byModel[k]);\n      modelRows.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });\n      // “按模型”表补充 API 服务商列；同一模型跨多个服务商时合并列出。\n      for (var mr = 0; mr < modelRows.length; mr++) {\n        var pset = {};\n        for (var rr = 0; rr < records.length; rr++) {\n          if (modelGroupKey(records[rr]) === modelRows[mr].key) pset[providerName(records[rr].provider)] = true;\n        }\n        modelRows[mr].providerText = Object.keys(pset).sort().join(" / ") || "未知服务商";\n      }\n      var providerRows = [];`,
  'overview model provider aggregation')

client = replaceOnce(client,
  `              el("th", { style: st.thFirst }, "模型"), el("th", { style: st.th }, "调用"), el("th", { style: st.th }, "高峰/空闲"),`,
  `              el("th", { style: st.thFirst }, "模型"), el("th", { style: st.thFirst }, "API 服务商"), el("th", { style: st.th }, "调用"), el("th", { style: st.th }, "高峰/空闲"),`,
  'overview provider header')

client = replaceOnce(client,
  `                  el("td", { style: st.tdWrap }, m.name),\n                  el("td", { style: st.td }, fmtInt(m.calls)),`,
  `                  el("td", { style: st.tdWrap }, m.name),\n                  el("td", { style: st.tdWrap }, m.providerText),\n                  el("td", { style: st.td }, fmtInt(m.calls)),`,
  'overview provider body')

client = replaceOnce(client,
  `                el("td", { style: st.tdTotalFirst }, "合计"),\n                el("td", { style: st.tdTotal }, fmtInt(totalCalls)),`,
  `                el("td", { style: st.tdTotalFirst }, "合计"),\n                el("td", { style: st.tdTotalFirst }, fmtInt(providerRows.length) + " 个服务商"),\n                el("td", { style: st.tdTotal }, fmtInt(totalCalls)),`,
  'overview provider total')

const priceInsertAnchor = `        el("div", { style: st.note, marginTop: 8 },\n          "单位：元 / 百万 tokens。高峰时段（北京时间 9:00–12:00、14:00–18:00）用高峰价，其余空闲时段用空闲价（空闲价 = 高峰价的一半）。概览、用量日历、缓存命中列表中的消耗均已按高峰 / 空闲分列统计。"\n        )\n`
const priceInsert = priceInsertAnchor.replace(`        )\n`, `        ),\n        el("div", { style: st.sec, marginTop: 18 }, "第三方平台参考价与覆盖状态（2026-08-19 核验）"),\n        el("div", { style: st.note, marginTop: 6 },\n          "下表只列入能从平台官方公开资料核验、并能与当前请求 model/provider 精确匹配的价格。已核验的 SiliconFlow 条目会参与实际消耗计算；DigitalOcean、阿里云 Model Studio（千问）和 AMD GPU Cloud 暂不在信息不足时硬编码价格，避免产生看似精确但错误的账单。"),\n        el("div", { style: st.scroll, marginTop: 8 },\n          el("table", { style: st.tbl },\n            el("thead", null, el("tr", null,\n              el("th", { style: st.thFirst }, "API 服务商"), el("th", { style: st.thFirst }, "模型 / 状态"),\n              el("th", { style: st.th }, "缓存命中"), el("th", { style: st.th }, "输入"), el("th", { style: st.th }, "输出"), el("th", { style: st.thFirst }, "说明")\n            )),\n            el("tbody", null,\n              [\n                ["SiliconFlow", "deepseek-ai/DeepSeek-V4-Flash", "¥0.02", "¥1.00", "¥2.00", "已用于计费"],\n                ["SiliconFlow", "deepseek-ai/DeepSeek-V4-Pro", "¥1.00", "¥12.00", "¥24.00", "缓存命中价按 2026-08-03 起生效公告"],\n                ["SiliconFlow", "deepseek-ai/DeepSeek-V3.2", "¥0.40", "¥4.00", "¥6.00", "已用于计费"],\n                ["SiliconFlow", "Qwen/Qwen3.6-27B", "按输入价", "¥3.00", "¥18.00", "公开公告未单列缓存价"],\n                ["DigitalOcean", "Gradient AI Model Catalog", "—", "动态", "动态", "官方建议以 Model Catalog 当前模型价格为准；未确认当前记录中的具体模型映射，暂不硬编码"],\n                ["Alibaba / 千问", "Model Studio", "依模型", "依模型/地域/上下文", "依模型/地域/上下文", "当前记录含 qwen3.7/qwen3.8 多个快照，需按精确 model code 与地域匹配后再计费"],\n                ["AMD GPU Cloud", "推理服务", "—", "—", "—", "未找到稳定公开的逐 token 价格表/API；暂不硬编码"]\n              ].map(function (row, idx) {\n                return el("tr", { key: "third-price-" + idx },\n                  el("td", { style: st.tdFirst }, row[0]), el("td", { style: st.tdWrap }, row[1]),\n                  el("td", { style: st.td }, row[2]), el("td", { style: st.td }, row[3]), el("td", { style: st.td }, row[4]), el("td", { style: st.tdWrap }, row[5])\n                );\n              })\n            )\n          )\n        ),\n        el("div", { style: st.note, marginTop: 8 },\n          "建议：DigitalOcean 与千问平台下一步按 provider + 精确 model code + 区域/上下文档位建立价格映射；AMD 等待官方公开稳定价格源。第三方价格变化较快，应以平台实时/官方价格页为最终依据。"\n        )\n`)
client = replaceOnce(client, priceInsertAnchor, priceInsert, 'third-party price reference table')

client = client.replace(
  `"计价说明：各模型与 API 服务商的消耗统一按 DeepSeek 官方 API 价格计费（因各厂商定价数据不完整，不按第三方厂商另行计价；无 DeepSeek 官方价格的模型消耗按 0 统计）。"`,
  `"计价说明：DeepSeek 官方请求按 DeepSeek 官方价格计费；已核验的 SiliconFlow 模型按 SiliconFlow 自身公开价格计费。DigitalOcean、千问平台、AMD GPU Cloud 在尚未建立可靠的精确模型价格映射时暂按 0 统计，并在价格表中标注覆盖状态。"`
)
client = client.replace(
  `"高峰时段（北京时间 9:00–12:00、14:00–18:00）按高峰价，其余时段按空闲价，系统按每次调用发生的时间自动选择档位。模型名与 API 服务商均以请求参数为准；所有消耗统一按 DeepSeek 官方 API 价格计费（各厂商定价数据不完整，不另行计价），非 DeepSeek 官方模型无对应价格，消耗按 0 统计。单位：元 / 百万 tokens。"`,
  `"DeepSeek 官方请求按官方峰谷价；已核验的 SiliconFlow 请求按 SiliconFlow 固定公开价，不套用 DeepSeek 峰谷折扣。其他尚无可靠精确价格映射的服务商暂按 0 统计。模型名与 API 服务商均以请求参数为准。单位：元 / 百万 tokens。"`
)
fs.writeFileSync('lib/client.js', client)

// 3) Version + changelog.
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.version = '1.13.0'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')

let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const marker = '## Unreleased\n'
const entry = `## v1.13.0 (2026-08-19)\n\n- **按模型表增加 API 服务商列**：同一模型跨多个服务商时合并列出实际 provider。\n- **SiliconFlow 独立计价**：DeepSeek-V4-Flash / V4-Pro / V3.2 与 Qwen3.6-27B 按 SiliconFlow 官方公开价格计算，不再错误套用 DeepSeek 官方峰谷价。\n- **第三方价格覆盖表**：价格页新增 SiliconFlow 已核验价格，以及 DigitalOcean、阿里云 Model Studio（千问）、AMD GPU Cloud 的覆盖状态与后续建议。\n- **余额查询信息框下移**：蓝色说明框增加上方间距，避免紧贴页签/凭据提示，使余额卡片区域层次更清晰。\n- **谨慎计价**：DigitalOcean、千问、AMD 在缺少可与当前记录精确匹配的稳定官方价格映射时继续按 0 统计，不虚构价格。\n\n`
if (!changelog.includes('## v1.13.0 (2026-08-19)')) changelog = changelog.replace(marker, marker + '\n' + entry)
fs.writeFileSync('CHANGELOG.md', changelog)

console.log('v1.13.0 patch applied')
