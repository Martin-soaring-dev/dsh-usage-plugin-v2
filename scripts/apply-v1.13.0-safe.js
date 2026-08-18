import fs from 'node:fs'

function replaceFirst(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}
function replaceLast(text, from, to, label) {
  const i = text.lastIndexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}
function replaceIfPresent(text, from, to) {
  return text.includes(from) ? text.replace(from, to) : text
}

// Host pricing: only hard-code provider/model prices that can be matched reliably.
let host = fs.readFileSync('lib/index.js', 'utf8')
if (!host.includes('const SILICONFLOW_PRICING =')) {
  const anchor = `      const PRICE_MODELS = ['deepseek-v4-flash', 'deepseek-v4-pro']\n`
  host = replaceFirst(host, anchor, anchor + `      // Provider-specific verified prices (CNY / 1M tokens), checked 2026-08-19.\n      const SILICONFLOW_PRICING = {\n        'deepseek-ai/deepseek-v4-flash': { cacheHit: 0.02, cacheMiss: 1.0, output: 2.0 },\n        // SiliconFlow 2026-07-29 announcement: cache-hit price becomes ¥1/M from 2026-08-03.\n        'deepseek-ai/deepseek-v4-pro': { cacheHit: 1.0, cacheMiss: 12.0, output: 24.0 },\n        'deepseek-ai/deepseek-v3.2': { cacheHit: 0.4, cacheMiss: 4.0, output: 6.0 },\n        'pro/deepseek-ai/deepseek-v3.2': { cacheHit: 0.4, cacheMiss: 4.0, output: 6.0 },\n        // Qwen3.6-27B public notice does not list a separate cache-hit price; use input price for cached input.\n        'qwen/qwen3.6-27b': { cacheHit: 3.0, cacheMiss: 3.0, output: 18.0 }\n      }\n`, 'pricing constants')
}
if (!host.includes("if (provider === 'siliconflow')")) {
  const anchor = `      function costFor(rec, regime) {\n        const mk = modelKey(rec.model)\n        const hit = rec.cacheReadTokens || 0\n        const miss = rec.inputTokens || 0\n        const out = rec.outputTokens || 0\n`
  host = replaceFirst(host, anchor, `      function costFor(rec, regime) {\n        const provider = String(rec.provider || '').trim().toLowerCase()\n        const model = String(rec.model || '').trim().toLowerCase()\n        const hit = rec.cacheReadTokens || 0\n        const miss = rec.inputTokens || 0\n        const out = rec.outputTokens || 0\n        // SiliconFlow uses its own public fixed prices; do not apply DeepSeek official peak/off-peak discounts.\n        if (provider === 'siliconflow') {\n          const p = SILICONFLOW_PRICING[model]\n          if (!p) return 0\n          return (hit * p.cacheHit + miss * p.cacheMiss + out * p.output) / 1e6\n        }\n        const mk = modelKey(rec.model)\n`, 'provider cost branch')
}
fs.writeFileSync('lib/index.js', host)

let client = fs.readFileSync('lib/client.js', 'utf8')

// Add provider aggregation to the OverviewView copy (the last modelRows block in the file).
if (!client.includes('modelRows[mr].providerText')) {
  const a = `      var modelRows = [];\n      for (var k in byModel) modelRows.push(byModel[k]);\n      modelRows.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });\n      var providerRows = [];`
  const b = `      var modelRows = [];\n      for (var k in byModel) modelRows.push(byModel[k]);\n      modelRows.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });\n      for (var mr = 0; mr < modelRows.length; mr++) {\n        var pset = {};\n        for (var rr = 0; rr < records.length; rr++) {\n          if (modelGroupKey(records[rr]) === modelRows[mr].key) pset[providerName(records[rr].provider)] = true;\n        }\n        modelRows[mr].providerText = Object.keys(pset).sort().join(" / ") || "未知服务商";\n      }\n      var providerRows = [];`
  client = replaceLast(client, a, b, 'overview provider aggregation')
}
client = replaceIfPresent(client,
  `              el("th", { style: st.thFirst }, "模型"), el("th", { style: st.th }, "调用"), el("th", { style: st.th }, "高峰/空闲"),`,
  `              el("th", { style: st.thFirst }, "模型"), el("th", { style: st.thFirst }, "API 服务商"), el("th", { style: st.th }, "调用"), el("th", { style: st.th }, "高峰/空闲"),`)
client = replaceIfPresent(client,
  `                  el("td", { style: st.tdWrap }, m.name),\n                  el("td", { style: st.td }, fmtInt(m.calls)),`,
  `                  el("td", { style: st.tdWrap }, m.name),\n                  el("td", { style: st.tdWrap }, m.providerText),\n                  el("td", { style: st.td }, fmtInt(m.calls)),`)
client = replaceIfPresent(client,
  `                el("td", { style: st.tdTotalFirst }, "合计"),\n                el("td", { style: st.tdTotal }, fmtInt(totalCalls)),`,
  `                el("td", { style: st.tdTotalFirst }, "合计"),\n                el("td", { style: st.tdTotalFirst }, fmtInt(providerRows.length) + " 个服务商"),\n                el("td", { style: st.tdTotal }, fmtInt(totalCalls)),`)

// Move balance-page blue explanation boxes down without changing generic info boxes elsewhere.
client = replaceIfPresent(client,
  `provider === "siliconflow"\n          ? el("div", { style: st.infobox },`,
  `provider === "siliconflow"\n          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 18 }) },`)
client = replaceIfPresent(client,
  `provider === "digitalocean"\n          ? el("div", { style: st.infobox },`,
  `provider === "digitalocean"\n          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 18 }) },`)
client = replaceIfPresent(client,
  `d && d.ok && d.provider === "siliconflow" && d.zeroBalance\n          ? el("div", { style: st.infobox },`,
  `d && d.ok && d.provider === "siliconflow" && d.zeroBalance\n          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 18 }) },`)
client = replaceIfPresent(client,
  `d && d.ok && d.provider === "siliconflow"\n          ? el("div", { style: st.infobox },`,
  `d && d.ok && d.provider === "siliconflow"\n          ? el("div", { style: Object.assign({}, st.infobox, { marginTop: 18 }) },`)

// Add a provider price/coverage table to PriceView.
if (!client.includes('第三方平台价格与覆盖状态')) {
  const anchor = `        el("div", { style: st.note, marginTop: 8 },\n          "单位：元 / 百万 tokens。高峰时段（北京时间 9:00–12:00、14:00–18:00）用高峰价，其余空闲时段用空闲价（空闲价 = 高峰价的一半）。概览、用量日历、缓存命中列表中的消耗均已按高峰 / 空闲分列统计。"\n        )\n`
  const replacement = `        el("div", { style: st.note, marginTop: 8 },\n          "单位：元 / 百万 tokens。高峰时段（北京时间 9:00–12:00、14:00–18:00）用高峰价，其余空闲时段用空闲价（空闲价 = 高峰价的一半）。概览、用量日历、缓存命中列表中的消耗均已按高峰 / 空闲分列统计。"\n        ),\n        el("div", { style: st.sec, marginTop: 18 }, "第三方平台价格与覆盖状态（2026-08-19 核验）"),\n        el("div", { style: st.note, marginTop: 6 }, "只把能与记录中的 provider/model 可靠匹配的价格用于自动计费；不同币种不会强行合并。"),\n        el("div", { style: st.scroll, marginTop: 8 },\n          el("table", { style: st.tbl },\n            el("thead", null, el("tr", null,\n              el("th", { style: st.thFirst }, "API 服务商"), el("th", { style: st.thFirst }, "模型 / 状态"),\n              el("th", { style: st.th }, "缓存命中"), el("th", { style: st.th }, "输入"), el("th", { style: st.th }, "输出"), el("th", { style: st.thFirst }, "说明")\n            )),\n            el("tbody", null, [\n              ["SiliconFlow", "DeepSeek-V4-Flash", "¥0.02", "¥1.00", "¥2.00", "已用于自动计费"],\n              ["SiliconFlow", "DeepSeek-V4-Pro", "¥1.00", "¥12.00", "¥24.00", "缓存命中价按 2026-08-03 起生效公告"],\n              ["SiliconFlow", "DeepSeek-V3.2", "¥0.40", "¥4.00", "¥6.00", "已用于自动计费"],\n              ["SiliconFlow", "Qwen3.6-27B", "按输入价", "¥3.00", "¥18.00", "公告未单列缓存命中价"],\n              ["DigitalOcean", "DeepSeek V4 Flash", "$0.028", "$0.112", "$0.224", "官方 Serverless Inference；美元价格，暂不并入人民币总额"],\n              ["DigitalOcean", "DeepSeek V4 Pro", "$0.348", "$1.392", "$2.784", "官方 Serverless Inference；美元价格"],\n              ["DigitalOcean", "DeepSeek V3.2", "$0.15", "$0.425", "$1.36", "官方 Serverless Inference；美元价格"],\n              ["Alibaba / 千问", "qwen3.7-flash", "依缓存规则", "¥0.20 起", "¥0.80 起", "按上下文长度分档；32K/256K/1M 档位不同"],\n              ["Alibaba / 千问", "qwen3.7-max", "¥1.20 显式命中", "¥12.00", "¥36.00", "北京区原价；其他地域不同"],\n              ["Alibaba / 千问", "qwen3.8-max-preview", "Token Plan", "Token Plan", "Token Plan", "当前仅 Token Plan；不能按普通按量价硬编码"],\n              ["AMD GPU Cloud", "推理服务", "—", "—", "—", "未找到稳定公开逐 token 价格表；暂不硬编码"]\n            ].map(function (row, idx) {\n              return el("tr", { key: "provider-price-" + idx },\n                el("td", { style: st.tdFirst }, row[0]), el("td", { style: st.tdWrap }, row[1]),\n                el("td", { style: st.td }, row[2]), el("td", { style: st.td }, row[3]), el("td", { style: st.td }, row[4]), el("td", { style: st.tdWrap }, row[5])\n              );\n            }))\n          )\n        ),\n        el("div", { style: st.note, marginTop: 8 }, "建议：DigitalOcean 先按 USD 单独汇总或增加可配置汇率；千问按精确 model code + 地域 + 单次上下文长度/缓存类型计价；AMD 等待官方稳定公开价格源。")\n`
  client = replaceFirst(client, anchor, replacement, 'price coverage table')
}

client = client.replace(
  `"计价说明：各模型与 API 服务商的消耗统一按 DeepSeek 官方 API 价格计费（因各厂商定价数据不完整，不按第三方厂商另行计价；无 DeepSeek 官方价格的模型消耗按 0 统计）。"`,
  `"计价说明：DeepSeek 官方请求按 DeepSeek 官方价；已核验的 SiliconFlow 模型按 SiliconFlow 自身公开价。DigitalOcean 为美元计价、千问存在地域/上下文分档、AMD 暂无稳定逐 token 公价，因此尚未可靠映射的记录暂按 0 统计。"`)
client = client.replace(
  `"高峰时段（北京时间 9:00–12:00、14:00–18:00）按高峰价，其余时段按空闲价，系统按每次调用发生的时间自动选择档位。模型名与 API 服务商均以请求参数为准；所有消耗统一按 DeepSeek 官方 API 价格计费（各厂商定价数据不完整，不另行计价），非 DeepSeek 官方模型无对应价格，消耗按 0 统计。单位：元 / 百万 tokens。"`,
  `"DeepSeek 官方请求按官方峰谷价；已核验的 SiliconFlow 请求按 SiliconFlow 固定公开价，不套用 DeepSeek 峰谷折扣。其他尚无可靠精确价格映射的服务商暂按 0 统计。模型名与 API 服务商均以请求参数为准。"`)
fs.writeFileSync('lib/client.js', client)

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.version = '1.13.0'
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')

let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
if (!changelog.includes('## v1.13.0 (2026-08-19)')) {
  changelog = changelog.replace('## Unreleased\n', `## Unreleased\n\n## v1.13.0 (2026-08-19)\n\n- **按模型表增加 API 服务商列**：同一模型跨多个服务商时合并显示实际 provider。\n- **SiliconFlow 独立计价**：已核验模型按 SiliconFlow 官方公开价格计算。\n- **第三方价格覆盖表**：新增 SiliconFlow、DigitalOcean、阿里云 Model Studio（千问）与 AMD GPU Cloud 的价格/覆盖状态。\n- **余额查询布局**：蓝色说明框增加顶部间距，降低与上方控件的拥挤感。\n- **谨慎计价**：不同币种、地域/上下文分档或无稳定公价的服务商不虚构统一价格。\n\n`)
}
fs.writeFileSync('CHANGELOG.md', changelog)
console.log('safe v1.13.0 patch applied')
