import fs from 'node:fs'

function replaceOnce(text, from, to, label) {
  const i = text.indexOf(from)
  if (i < 0) throw new Error(`missing patch target: ${label}`)
  if (text.indexOf(from, i + from.length) >= 0) throw new Error(`non-unique patch target: ${label}`)
  return text.slice(0, i) + to + text.slice(i + from.length)
}

let host = fs.readFileSync('lib/index.js', 'utf8')

const siliconEnd = `      const SILICONFLOW_PRICING = {
        'deepseek-ai/deepseek-v4-flash': { cacheHit: 0.02, cacheMiss: 1.0, output: 2.0 },
        // SiliconFlow 2026-07-29 announcement: cache-hit price becomes ¥1/M from 2026-08-03.
        'deepseek-ai/deepseek-v4-pro': { cacheHit: 1.0, cacheMiss: 12.0, output: 24.0 },
        'deepseek-ai/deepseek-v3.2': { cacheHit: 0.4, cacheMiss: 4.0, output: 6.0 },
        'pro/deepseek-ai/deepseek-v3.2': { cacheHit: 0.4, cacheMiss: 4.0, output: 6.0 },
        // Qwen3.6-27B public notice does not list a separate cache-hit price; use input price for cached input.
        'qwen/qwen3.6-27b': { cacheHit: 3.0, cacheMiss: 3.0, output: 18.0 }
      }
`
const providerTables = siliconEnd + `      // DigitalOcean Serverless Inference prices (USD / 1M tokens), verified 2026-08-19.
      const DIGITALOCEAN_PRICING = {
        flash: { cacheHit: 0.028, cacheMiss: 0.112, output: 0.224 },
        pro: { cacheHit: 0.348, cacheMiss: 1.392, output: 2.784 },
        v32: { cacheHit: 0.15, cacheMiss: 0.425, output: 1.36 }
      }
      let FX = { rate: 0, inverse: 0, date: '', queriedAt: 0, source: 'Frankfurter', stale: false, error: '' }
`
if (!host.includes('const DIGITALOCEAN_PRICING')) host = replaceOnce(host, siliconEnd, providerTables, 'provider price tables')

const oldCost = `      function costFor(rec, regime) {
        const provider = String(rec.provider || '').trim().toLowerCase()
        const model = String(rec.model || '').trim().toLowerCase()
        const hit = rec.cacheReadTokens || 0
        const miss = rec.inputTokens || 0
        const out = rec.outputTokens || 0
        // SiliconFlow uses its own public fixed prices; do not apply DeepSeek official peak/off-peak discounts.
        if (provider === 'siliconflow') {
          const p = SILICONFLOW_PRICING[model]
          if (!p) return 0
          return (hit * p.cacheHit + miss * p.cacheMiss + out * p.output) / 1e6
        }
        const mk = modelKey(rec.model)
`
const newCost = `      function costFor(rec, regime) {
        const provider = String(rec.provider || '').trim().toLowerCase()
        const model = String(rec.model || '').trim().toLowerCase()
        const hit = rec.cacheReadTokens || 0
        const miss = rec.inputTokens || 0
        const out = rec.outputTokens || 0
        if (provider === 'siliconflow') {
          const p = SILICONFLOW_PRICING[model]
          if (!p) return 0
          return (hit * p.cacheHit + miss * p.cacheMiss + out * p.output) / 1e6
        }
        if (provider === 'digital-ocean' || provider === 'digitalocean') {
          let p = null
          if (model.indexOf('v3.2') >= 0 || model.indexOf('v3-2') >= 0) p = DIGITALOCEAN_PRICING.v32
          else if (model.indexOf('pro') >= 0) p = DIGITALOCEAN_PRICING.pro
          else if (model.indexOf('flash') >= 0) p = DIGITALOCEAN_PRICING.flash
          if (!p) return 0
          const rate = Number(rec.usdCnyRate || FX.rate || 0)
          if (!(rate > 0)) return 0
          return ((hit * p.cacheHit + miss * p.cacheMiss + out * p.output) / 1e6) * rate
        }
        if (provider === 'amd' || provider === 'amd-gpu-cloud' || provider === 'alibaba' || provider === 'aliyun' || provider === 'qwen') return 0
        if (provider !== 'deepseek-official' && provider !== 'deepseek') return 0
        const mk = modelKey(rec.model)
`
if (!host.includes("provider !== 'deepseek-official'")) host = replaceOnce(host, oldCost, newCost, 'provider aware cost')

const normTail = `          reasoningTokens: toNum(raw.reasoningTokens),
          finishReason: String(raw.finishReason || '')
`
const normFx = `          reasoningTokens: toNum(raw.reasoningTokens),
          finishReason: String(raw.finishReason || ''),
          usdCnyRate: toNum(raw.usdCnyRate),
          fxDate: String(raw.fxDate || '')
`
if (!host.includes('usdCnyRate: toNum(raw.usdCnyRate)')) host = replaceOnce(host, normTail, normFx, 'normalize fx metadata')

const captureTail = `                  reasoningTokens: usage.reasoningTokens || 0,
                  finishReason
`
const captureFx = `                  reasoningTokens: usage.reasoningTokens || 0,
                  finishReason,
                  usdCnyRate: FX.rate || 0,
                  fxDate: FX.date || ''
`
if (!host.includes('usdCnyRate: FX.rate || 0')) host = replaceOnce(host, captureTail, captureFx, 'capture fx metadata')

const spawnEnd = `        return { ok: true, out: r.out }
      }

      async function checkForUpdate() {
`
const fxFns = `        return { ok: true, out: r.out }
      }

      function bjTodayKey() {
        const d = new Date(Date.now() + 8 * 3600 * 1000)
        return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate())
      }

      async function refreshFxRate(force) {
        if (!force && FX.rate > 0 && FX.queriedAt && bjKey(FX.queriedAt) === bjTodayKey()) return FX
        const script = [
          'const https=require("https");',
          'const u="https://api.frankfurter.dev/v2/rates?base=USD&quotes=CNY";',
          'const req=https.get(u,{headers:{Accept:"application/json","User-Agent":"dsh-usage-plugin-v2"}},function(res){',
          'let b="";res.on("data",c=>b+=c);res.on("end",()=>process.stdout.write(JSON.stringify({status:res.statusCode,body:b})));',
          '});',
          'req.on("error",e=>process.stdout.write(JSON.stringify({error:String(e&&e.message||e)})));',
          'req.setTimeout(15000,()=>req.destroy(new Error("timeout")));'
        ].join('\\n')
        const r = await spawnNode(script)
        if (!r.ok) { FX = { ...FX, stale: FX.rate > 0, error: r.error || '汇率请求失败', queriedAt: Date.now() }; return FX }
        try {
          const wrapper = JSON.parse(r.out)
          if (wrapper.error || wrapper.status !== 200) throw new Error(wrapper.error || ('HTTP ' + wrapper.status))
          const arr = JSON.parse(wrapper.body)
          const row = Array.isArray(arr) ? arr.find((x) => x && x.base === 'USD' && x.quote === 'CNY') : null
          const rate = Number(row && row.rate)
          if (!(rate > 0)) throw new Error('响应中缺少 USD/CNY 汇率')
          FX = { rate, inverse: 1 / rate, date: String(row.date || ''), queriedAt: Date.now(), source: 'Frankfurter', stale: false, error: '' }
        } catch (e) {
          FX = { ...FX, stale: FX.rate > 0, error: msg(e), queriedAt: Date.now() }
        }
        return FX
      }

      async function checkForUpdate() {
`
if (!host.includes('async function refreshFxRate')) host = replaceOnce(host, spawnEnd, fxFns, 'fx fetch functions')

const listCase = `          case 'list': {
            const items = records.map((r) => ({
`
const listFx = `          case 'list': {
            try { await refreshFxRate(false) } catch (e) {}
            const items = records.map((r) => ({
`
if (!host.includes("case 'list': {\n            try { await refreshFxRate(false)")) host = replaceOnce(host, listCase, listFx, 'list fx refresh')

const itemFinish = `              reasoningTokens: r.reasoningTokens, finishReason: r.finishReason,
              modelKey: modelKey(r.model),
`
const itemFx = `              reasoningTokens: r.reasoningTokens, finishReason: r.finishReason,
              usdCnyRate: r.usdCnyRate || 0, fxDate: r.fxDate || '',
              modelKey: modelKey(r.model),
`
if (!host.includes('usdCnyRate: r.usdCnyRate || 0')) host = replaceOnce(host, itemFinish, itemFx, 'list fx record fields')

const listReturn = `            return { ok: true, records: items, count: items.length, dataPath, persistOk, persistError, pricing: PRICING, effectiveAt: EFFECTIVE_AT, days: buildDays() }
          }
`
const listReturnFx = `            return { ok: true, records: items, count: items.length, dataPath, persistOk, persistError, pricing: PRICING, effectiveAt: EFFECTIVE_AT, fx: FX, days: buildDays() }
          }
          case 'fxRefresh': {
            const fx = await refreshFxRate(true)
            return { ok: fx.rate > 0, fx, error: fx.rate > 0 ? '' : (fx.error || '无法获取汇率') }
          }
`
if (!host.includes("case 'fxRefresh'")) host = replaceOnce(host, listReturn, listReturnFx, 'fx refresh API')

fs.writeFileSync('lib/index.js', host)

let client = fs.readFileSync('lib/client.js', 'utf8')
const priceProps = `    function PriceView(props) {
      var pricing = props.pricing || { base: {}, peakValley: {} };
      var effectiveAt = props.effectiveAt || 0;
`
const pricePropsFx = `    function PriceView(props) {
      var pricing = props.pricing || { base: {}, peakValley: {} };
      var effectiveAt = props.effectiveAt || 0;
      var fx = props.fx || {};
`
if (!client.includes('var fx = props.fx || {};')) client = replaceOnce(client, priceProps, pricePropsFx, 'PriceView fx prop')

const priceReturn = `      return el("div", null,
        el("div", { style: st.sec }, "DeepSeek 官方 API 价格表"),
`
const fxBlock = `      return el("div", null,
        el("div", { style: st.sec }, "今日 USD / CNY 汇率"),
        el("div", { style: st.cards, marginTop: 8 },
          el(Card, { label: "USD → CNY", value: fx.rate ? ("1 USD = ¥" + Number(fx.rate).toFixed(4)) : "暂不可用", hint: fx.date ? ("汇率日期 " + fx.date) : "等待获取" }),
          el(Card, { label: "CNY → USD", value: fx.inverse ? ("¥1 = $" + Number(fx.inverse).toFixed(6)) : "暂不可用", hint: fx.source || "Frankfurter" }),
          el(Card, { label: "汇率状态", value: fx.stale ? "缓存汇率" : (fx.rate ? "最新可用" : "获取失败"), hint: fx.error || "Frankfurter · central-bank reference rates" })
        ),
        el("div", { style: st.actions, marginTop: 8 },
          el("button", { style: st.btn, onClick: props.onFxRefresh }, "刷新汇率"),
          el("span", { style: st.note }, "美元计价的 DigitalOcean 消耗按该 USD/CNY 汇率换算成人民币；人民币定价不受汇率影响。")
        ),
        el("div", { style: st.sec, marginTop: 18 }, "DeepSeek 官方 API 价格表"),
`
if (!client.includes('今日 USD / CNY 汇率')) client = replaceOnce(client, priceReturn, fxBlock, 'FX block')

client = client.replace('["DigitalOcean", "DeepSeek V4 Flash", "$0.028", "$0.112", "$0.224", "官方 Serverless Inference；美元价格，暂不并入人民币总额"]', '["DigitalOcean", "DeepSeek V4 Flash", "$0.028", "$0.112", "$0.224", "自动按 USD/CNY 汇率换算人民币并计费"]')
client = client.replace('["DigitalOcean", "DeepSeek V4 Pro", "$0.348", "$1.392", "$2.784", "官方 Serverless Inference；美元价格"]', '["DigitalOcean", "DeepSeek V4 Pro", "$0.348", "$1.392", "$2.784", "自动按 USD/CNY 汇率换算人民币并计费"]')
client = client.replace('["DigitalOcean", "DeepSeek V3.2", "$0.15", "$0.425", "$1.36", "官方 Serverless Inference；美元价格"]', '["DigitalOcean", "DeepSeek V3.2", "$0.15", "$0.425", "$1.36", "自动按 USD/CNY 汇率换算人民币并计费"]')
client = client.replace('["Alibaba / 千问", "qwen3.7-flash", "依缓存规则", "¥0.20 起", "¥0.80 起", "按上下文长度分档；32K/256K/1M 档位不同"],\n              ["Alibaba / 千问", "qwen3.7-max", "¥1.20 显式命中", "¥12.00", "¥36.00", "北京区原价；其他地域不同"],\n              ["Alibaba / 千问", "qwen3.8-max-preview", "Token Plan", "Token Plan", "Token Plan", "当前仅 Token Plan；不能按普通按量价硬编码"],\n              ["AMD GPU Cloud", "推理服务", "—", "—", "—", "未找到稳定公开逐 token 价格表；暂不硬编码"]', '["Alibaba / 千问", "暂不计费", "—", "—", "—", "调用与 token 正常统计；费用暂按 ¥0"],\n              ["AMD GPU Cloud", "DeepSeek V4 Flash", "¥0", "¥0", "¥0", "免费；费用固定按 ¥0"]')
client = client.replace('"建议：DigitalOcean 先按 USD 单独汇总或增加可配置汇率；千问按精确 model code + 地域 + 单次上下文长度/缓存类型计价；AMD 等待官方稳定公开价格源。"', '"DigitalOcean 使用美元官方价并按最新可用 USD/CNY 汇率折算人民币；千问暂不计费；AMD GPU Cloud 的 DeepSeek V4 Flash 免费按 ¥0。"')
client = client.replace('"计价说明：DeepSeek 官方请求按 DeepSeek 官方价；已核验的 SiliconFlow 模型按 SiliconFlow 自身公开价。DigitalOcean 为美元计价、千问存在地域/上下文分档、AMD 暂无稳定逐 token 公价，因此尚未可靠映射的记录暂按 0 统计。"', '"计价说明：DeepSeek 官方与 SiliconFlow 按人民币价格；DigitalOcean 按美元官方价 × USD/CNY 汇率折算人民币；千问暂不计费；AMD GPU Cloud DeepSeek V4 Flash 免费按 ¥0。"')

const priceRender = `        tab === "prices" ? el(PriceView, { pricing: data.pricing, effectiveAt: data.effectiveAt, onChanged: refresh }) : null,
`
const priceRenderFx = `        tab === "prices" ? el(PriceView, { pricing: data.pricing, effectiveAt: data.effectiveAt, fx: data.fx || {}, onFxRefresh: function () { api({ action: "fxRefresh" }).then(refresh).catch(function () {}); }, onChanged: refresh }) : null,
`
if (!client.includes('fx: data.fx || {}')) client = replaceOnce(client, priceRender, priceRenderFx, 'wire FX PriceView')
fs.writeFileSync('lib/client.js', client)

let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const v = '## v1.13.0 (2026-08-19)\n'
if (changelog.includes(v) && !changelog.includes('**USD/CNY 汇率换算**')) {
  changelog = changelog.replace(v, v + '\n- **USD/CNY 汇率换算**：价格页显示 Frankfurter 最新可用 USD/CNY 与反向汇率；DigitalOcean 美元价格自动乘汇率统一折算成人民币。\n- **汇率留痕**：新调用记录当时缓存的 USD/CNY 汇率与汇率日期；旧记录没有历史汇率时使用当前最新可用汇率估算。\n- **服务商计价边界**：DeepSeek 官方价只用于 deepseek-official/deepseek，避免其他 provider 因模型名包含 flash/pro 而误套官方价。\n- **暂不计费/免费**：Alibaba/千问暂不计费；AMD GPU Cloud DeepSeek V4 Flash 按免费 ¥0。\n')
}
fs.writeFileSync('CHANGELOG.md', changelog)
console.log('FX-aware v1.13.0 patch applied')
