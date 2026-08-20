window.__ModuleLoader__.load({
  id: "@feiyang666/dsh-usage-plugin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var React = require("react");
    var el = React.createElement;

    // ── inline styles (replaces a stylesheet; portable across client plugins) ──
    // 字号用 em 表示，随宿主“显示大小”设置的字体基准自动缩放（继承应用字号）；
    // 间距保持 px，仅微调以适配更大的字号。标注的 px 是默认 13px 基准下的设计值。
    var BASE_FS = 13;
    var fs = function (n) { return (Math.round(n / BASE_FS * 100) / 100).toFixed(2) + "em"; };
    var st = {
      root: { display: "flex", flexDirection: "column", gap: 14, padding: "4px 0", width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" },
      tab: { padding: "16px 20px", maxWidth: "min(1200px, calc(100vw - 24px))", margin: "0 auto", width: "100%", minWidth: 0, boxSizing: "border-box" },
      head: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
      headleft: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
      title: { fontSize: fs(15), fontWeight: 600 },
      sub: { fontSize: fs(11), opacity: 0.55 },
      actions: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
      btn: { border: "1px solid rgba(128,128,128,.35)", background: "transparent", borderRadius: 6, padding: "4px 10px", fontSize: fs(12), cursor: "pointer", color: "inherit" },
      btnPrimary: { border: "1px solid rgba(90,140,255,.6)", background: "rgba(90,140,255,.22)", borderRadius: 6, padding: "4px 10px", fontSize: fs(12), cursor: "pointer", color: "inherit" },
      btnDisabled: { border: "1px solid rgba(128,128,128,.35)", background: "transparent", borderRadius: 6, padding: "4px 10px", fontSize: fs(12), cursor: "default", color: "inherit", opacity: 0.5 },
      input: { border: "1px solid rgba(128,128,128,.35)", background: "transparent", borderRadius: 6, padding: "4px 10px", fontSize: fs(12), color: "inherit", minWidth: 280 },
      dateInput: { border: "1px solid rgba(128,128,128,.35)", background: "transparent", borderRadius: 6, padding: "3px 8px", fontSize: fs(12), color: "inherit" },
      seg: { display: "inline-flex", border: "1px solid rgba(128,128,128,.35)", borderRadius: 6, overflow: "hidden", flexWrap: "wrap" },
      segBtn: { border: 0, background: "transparent", padding: "4px 10px", fontSize: fs(12), cursor: "pointer", color: "inherit" },
      segBtnOn: { border: 0, background: "rgba(90,140,255,.22)", padding: "4px 10px", fontSize: fs(12), cursor: "pointer", color: "inherit", fontWeight: 600 },
      cards: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 10 },
      card: { border: "1px solid rgba(128,128,128,.35)", borderRadius: 8, padding: "10px 12px", minWidth: 0 },
      cardL: { fontSize: fs(11), opacity: 0.6, marginBottom: 4 },
      cardV: { fontSize: fs(18), fontWeight: 600, overflowWrap: "anywhere" },
      cardH: { fontSize: fs(10), opacity: 0.5, marginTop: 2, overflowWrap: "anywhere" },
      sec: { fontSize: fs(13), fontWeight: 600, marginTop: 6 },
      subtabBar: { display: "flex", gap: 6, borderBottom: "1px solid rgba(128,128,128,.2)", paddingBottom: 8, flexWrap: "wrap" },
      subtab: { border: "1px solid rgba(128,128,128,.35)", background: "transparent", borderRadius: 6, padding: "5px 14px", fontSize: fs(12), cursor: "pointer", color: "inherit" },
      subtabOn: { border: "1px solid rgba(90,140,255,.5)", background: "rgba(90,140,255,.22)", borderRadius: 6, padding: "5px 14px", fontSize: fs(12), cursor: "pointer", color: "inherit", fontWeight: 600 },
      scroll: { overflowX: "auto", overflowY: "hidden", width: "100%", maxWidth: "100%", minWidth: 0 },
      tbl: { width: "max-content", minWidth: "100%", borderCollapse: "collapse", fontSize: fs(12) },
      th: { textAlign: "right", padding: "7px 10px", borderBottom: "1px solid rgba(128,128,128,.2)", whiteSpace: "nowrap", opacity: 0.55, fontWeight: 500 },
      thFirst: { textAlign: "left", padding: "7px 10px", borderBottom: "1px solid rgba(128,128,128,.2)", whiteSpace: "nowrap", opacity: 0.55, fontWeight: 500 },
      td: { textAlign: "right", padding: "7px 10px", borderBottom: "1px solid rgba(128,128,128,.2)", whiteSpace: "nowrap" },
      tdFirst: { textAlign: "left", padding: "7px 10px", borderBottom: "1px solid rgba(128,128,128,.2)", whiteSpace: "nowrap" },
      tdWrap: { textAlign: "left", padding: "7px 10px", borderBottom: "1px solid rgba(128,128,128,.2)", whiteSpace: "normal", wordBreak: "break-word", minWidth: 120, maxWidth: 220 },
      tdTotal: { textAlign: "right", padding: "7px 10px", fontWeight: 600, borderTop: "1px solid rgba(128,128,128,.35)" },
      tdTotalFirst: { textAlign: "left", padding: "7px 10px", fontWeight: 600, borderTop: "1px solid rgba(128,128,128,.35)" },
      tdClick: { textAlign: "left", padding: "7px 10px", borderBottom: "1px solid rgba(128,128,128,.2)", whiteSpace: "nowrap", cursor: "pointer" },
      tdClickSel: { textAlign: "left", padding: "7px 10px", borderBottom: "1px solid rgba(128,128,128,.2)", whiteSpace: "nowrap", cursor: "pointer", color: "#5a8cff", fontWeight: 600 },
      tdGroup: { textAlign: "left", padding: "7px 10px", fontWeight: 600, background: "rgba(128,128,128,.09)", borderBottom: "1px solid rgba(128,128,128,.2)", whiteSpace: "nowrap" },
      tdGroupR: { textAlign: "right", padding: "7px 10px", fontWeight: 600, background: "rgba(128,128,128,.09)", borderBottom: "1px solid rgba(128,128,128,.2)", whiteSpace: "nowrap" },
      badgeHit: { display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: fs(11), fontWeight: 500, background: "rgba(46,204,113,.18)", color: "#2ecc71", whiteSpace: "nowrap" },
      badgePeak: { display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: fs(11), fontWeight: 500, background: "rgba(255,152,0,.18)", color: "#ff9800", whiteSpace: "nowrap" },
      badgeValley: { display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: fs(11), fontWeight: 500, background: "rgba(90,140,255,.18)", color: "#5a8cff", whiteSpace: "nowrap" },
      costPeak: { color: "#e08700", fontWeight: 600, whiteSpace: "nowrap" },
      costOff: { color: "#3d6bd6", fontWeight: 600, whiteSpace: "nowrap" },
      err: { color: "#ff6b6b", fontSize: fs(12) },
      empty: { fontSize: fs(12), opacity: 0.6, padding: "16px 0" },
      note: { fontSize: fs(11), opacity: 0.55 },
      errbox: { border: "1px solid rgba(255,107,107,.4)", background: "rgba(255,107,107,.08)", borderRadius: 8, padding: 12, fontSize: fs(12) },
      errboxTitle: { fontWeight: 600, marginBottom: 4, color: "#ff6b6b" },
      infobox: { border: "1px solid rgba(90,140,255,.35)", background: "rgba(90,140,255,.08)", borderRadius: 8, padding: 12, marginTop: 18, fontSize: fs(12) },
      infoboxTitle: { fontWeight: 600, marginBottom: 4, color: "#5a8cff" },
      actionLink: { display: "inline-block", marginTop: 8, color: "#3d6bd6", textDecoration: "underline", fontSize: fs(12) },
      hero: { borderRadius: 12, padding: 20, color: "#fff", background: "linear-gradient(135deg,#3a7bd5,#00d2ff)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 },
      heroLabel: { fontSize: fs(12), opacity: 0.85 },
      heroValue: { fontSize: fs(32), fontWeight: 700, letterSpacing: 0.5 },
      heroCurrency: { fontSize: fs(12), opacity: 0.9 },
      calBar: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 10 },
      calGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginTop: 6 },
      calWk: { textAlign: "center", fontSize: fs(11), opacity: 0.5, padding: "2px 0" },
      calCell: { border: "1px solid rgba(128,128,128,.15)", borderRadius: 6, padding: "6px 2px", textAlign: "center", fontSize: fs(12), cursor: "pointer", minHeight: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 },
      calCellBlank: { border: "1px solid transparent", padding: "6px 2px", minHeight: 40 },
      calCellOn: { outline: "2px solid #5a8cff", outlineOffset: -2 },
      calCellVal: { fontSize: fs(10), opacity: 0.8, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
      legend: { display: "flex", alignItems: "center", gap: 6, fontSize: fs(11), opacity: 0.65, marginTop: 8, flexWrap: "wrap" },
      legendBar: { display: "inline-block", width: 100, height: 8, borderRadius: 4, background: "linear-gradient(90deg,rgba(128,128,128,.12),rgba(46,134,222,.3),rgba(46,134,222,.85))" },
      numInput: { border: "1px solid rgba(128,128,128,.35)", background: "transparent", borderRadius: 4, padding: "3px 6px", fontSize: fs(12), color: "inherit", width: 78, textAlign: "right" },
      selDayTitle: { fontSize: fs(13), fontWeight: 600, marginTop: 14 }
    };

    var pad2 = function (n) { return (n < 10 ? "0" : "") + n; };
    var fmtInt = function (n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
    var fmtTime = function (ts) { var d = new Date(ts + 8 * 3600 * 1000); return pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate()) + " " + pad2(d.getUTCHours()) + ":" + pad2(d.getUTCMinutes()) + ":" + pad2(d.getUTCSeconds()); };
    var fmtMoney = function (n) { if (!n) return "¥0.0000"; if (n < 0.0001) return "¥" + n.toExponential(2); if (n < 1) return "¥" + n.toFixed(4); return "¥" + n.toFixed(2); };
    var fmtPrice = function (n) { if (n == null || isNaN(n)) return "—"; return String(parseFloat(Number(n).toFixed(4))); };
    var modelLabel = function (mk) { if (mk === "deepseek-v4-flash") return "deepseek-v4-flash"; if (mk === "deepseek-v4-pro") return "deepseek-v4-pro"; return "未知模型"; };
    var modelName = function (r) {
      var m = String((r && r.model) || "").trim();
      if (m) return m;
      var mv = r && r.modelKey;
      if (mv && mv !== "unknown") return modelLabel(mv);
      var p = String((r && r.provider) || "").trim();
      return p ? p : "未知模型";
    };
    var modelGroupKey = function (r) {
      var m = String((r && r.model) || "").trim();
      if (m) return m.toLowerCase();
      var mv = r && r.modelKey;
      if (mv && mv !== "unknown") return mv;
      var p = String((r && r.provider) || "").trim();
      return p ? p.toLowerCase() : "unknown";
    };
    var providerName = function (p) { var s = String(p == null ? "" : p).trim(); return s || "未知服务商"; };
    var providerGroupKey = function (p) { var s = String(p == null ? "" : p).trim(); return s ? s.toLowerCase() : "unknown"; };
    var finishLabel = function (f) { if (f === "stop") return "完成"; if (f === "tool-calls") return "工具调用"; if (f === "max-tokens") return "超长"; if (f === "error") return "错误"; return f || "—"; };
    var pct = function (a, b) { return b > 0 ? (a / b * 100).toFixed(1) + "%" : "—"; };
    var isPeakNow = function (ts) { var d = new Date(ts + 8 * 3600 * 1000); var t = d.getUTCHours() * 60 + d.getUTCMinutes(); return (t >= 9 * 60 && t < 12 * 60) || (t >= 14 * 60 && t < 18 * 60); };
    var regimeLabel = function (regime) { if (regime === "auto") return "自动（生效前基础价 · 生效后峰谷价）"; if (regime === "base") return "基础价格"; return "峰谷价格"; };
    var costHint = function (regime) { if (regime === "auto") return "自动"; if (regime === "base") return "基础价格"; return "峰谷价格"; };
    var costOf = function (r, regime) { if (!r) return 0; if (regime === "base") return r.baseCost || 0; if (regime === "auto") return r.autoCost != null ? r.autoCost : (r.baseCost || 0); return r.peakValleyCost || 0; };
    var splitTotals = function (list, regime) { var peak = 0, off = 0; for (var i = 0; i < list.length; i++) { var c = costOf(list[i], regime); if (list[i].peak) peak += c; else off += c; } return { peak: peak, off: off }; };
    var daySplit = function (d, regime, fallback) {
      var peak, off;
      if (d) {
        if (regime === "base") { peak = d.basePeakCost; off = d.baseOffPeakCost; }
        else if (regime === "peakValley") { peak = d.pvPeakCost; off = d.pvOffPeakCost; }
        else { peak = d.autoPeakCost; off = d.autoOffPeakCost; }
        if (peak != null && off != null) return { peak: peak, off: off };
      }
      if (fallback) return fallback;
      return { peak: 0, off: 0 };
    };
    var bjKey = function (ts) { var d = new Date(ts + 8 * 3600 * 1000); return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate()); };
    var bjStartMs = function (key) { var p = String(key).split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]) - 8 * 3600 * 1000; };
    var dayLabel = function (key) { var p = String(key).split("-"); return p[0] + "年" + (+p[1]) + "月" + (+p[2]) + "日"; };
    var monthDays = function (y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); };
    var monthOffset = function (y, m) { var ms = bjStartMs(y + "-" + pad2(m + 1) + "-01"); var wd = new Date(ms).getUTCDay(); return (wd + 6) % 7; };
    var fmtBalance = function (s) { var str = String(s == null ? "0" : s); var num = parseFloat(str); if (isNaN(num)) return str; var parts = str.split("."); var dec = parts[1] ? parts[1].slice(0, 2) : "00"; return fmtInt(parseInt(parts[0], 10)) + "." + (dec.length === 1 ? dec + "0" : dec); };
    var currencySymbol = function (currency) { return currency === "CNY" ? "¥" : currency === "USD" ? "$" : (currency || ""); };
    var api = function (payload) { return fetch("/usage/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(function (r) { return r.json(); }); };
    var PRICE_MODELS = ["deepseek-v4-flash", "deepseek-v4-pro"];

    function Card(props) {
      return el("div", { style: st.card }, el("div", { style: st.cardL }, props.label), el("div", { style: st.cardV }, props.value), props.hint ? el("div", { style: st.cardH }, props.hint) : null);
    }

    // The detailed report, overview, calendar and cache views intentionally keep
    // the upstream structure. Provider-aware costs are supplied by the host.
    function drawReport(canvas, records) {
      records = records.slice();
      records.sort(function (a, b) { return b.time - a.time; });
      var totalIn = records.length;
      if (records.length > 2000) records = records.slice(0, 2000);
      var W = 1520, P = 40, count = records.length;
      var scale = count <= 200 ? 2 : 1;
      var rowH = count <= 200 ? 28 : count <= 800 ? 20 : 14;
      var fBase = count <= 200 ? 12 : count <= 800 ? 11 : 10;
      var headH = count <= 200 ? 26 : count <= 800 ? 20 : 16;
      var totalHit = 0, totalMiss = 0, totalWrite = 0, totalOut = 0, totalReason = 0, totalCost = 0, totalPeakCost = 0, totalOffCost = 0;
      var byModel = {}, byProvider = {}, byProviderModel = {};
      for (var i = 0; i < count; i++) {
        var r = records[i];
        totalHit += r.cacheReadTokens || 0; totalMiss += r.inputTokens || 0; totalWrite += r.cacheWriteTokens || 0; totalOut += r.outputTokens || 0; totalReason += r.reasoningTokens || 0;
        var cst = r.peakValleyCost || 0; totalCost += cst; if (r.peak) totalPeakCost += cst; else totalOffCost += cst;
        var gk = modelGroupKey(r), pk = providerGroupKey(r.provider), pmk = pk + "||" + gk;
        if (!byModel[gk]) byModel[gk] = { key: gk, name: modelName(r), calls: 0, hit: 0, miss: 0, out: 0, reason: 0, cost: 0, peakCost: 0, offCost: 0 };
        if (!byProvider[pk]) byProvider[pk] = { key: pk, name: providerName(r.provider), calls: 0, cost: 0, peakCost: 0, offCost: 0 };
        if (!byProviderModel[pmk]) byProviderModel[pmk] = { key: pmk, providerKey: pk, modelName: modelName(r), calls: 0, cost: 0, peakCost: 0, offCost: 0 };
        byModel[gk].calls++; byModel[gk].hit += r.cacheReadTokens || 0; byModel[gk].miss += r.inputTokens || 0; byModel[gk].out += r.outputTokens || 0; byModel[gk].reason += r.reasoningTokens || 0; byModel[gk].cost += cst;
        byProvider[pk].calls++; byProvider[pk].cost += cst; byProviderModel[pmk].calls++; byProviderModel[pmk].cost += cst;
        if (r.peak) { byModel[gk].peakCost += cst; byProvider[pk].peakCost += cst; byProviderModel[pmk].peakCost += cst; }
        else { byModel[gk].offCost += cst; byProvider[pk].offCost += cst; byProviderModel[pmk].offCost += cst; }
      }
      var hitRate = (totalHit + totalMiss + totalWrite) > 0 ? (totalHit / (totalHit + totalMiss + totalWrite) * 100).toFixed(1) + "%" : "—";
      var modelRows = Object.keys(byModel).map(function (k) { return byModel[k]; });
      var providerRows = Object.keys(byProvider).map(function (k) { return byProvider[k]; });
      var providerGroups = providerRows.map(function (p) { return { provider: p, models: Object.keys(byProviderModel).map(function (k) { return byProviderModel[k]; }).filter(function (m) { return m.providerKey === p.key; }) }; });
      var pmRowTotal = 1; for (var pg = 0; pg < providerGroups.length; pg++) pmRowTotal += 1 + providerGroups[pg].models.length;
      var H = 244 + headH + count * rowH + 24 + 18 + headH + (modelRows.length + 1) * rowH + 24 + 18 + headH + pmRowTotal * rowH + 70;
      canvas.width = W * scale; canvas.height = H * scale;
      var c = canvas.getContext("2d"); if (!c) throw new Error("canvas 2d 不可用"); c.scale(scale, scale); c.textBaseline = "alphabetic";
      var font = function (size, weight) { c.font = (weight || "400") + " " + size + 'px "Segoe UI","Microsoft YaHei",sans-serif'; };
      c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H); c.fillStyle = "#3a7bd5"; c.fillRect(0, 0, W, 64); c.fillStyle = "#ffffff"; c.textAlign = "left"; font(20, "700"); c.fillText("用量与消耗报告", P, 40);
      c.fillStyle = "#7a8699"; font(13); c.fillText("生成时间 " + fmtTime(Date.now()) + "（北京） · 共 " + count + " 条调用 · 缓存命中率 " + hitRate + " · 高峰 " + fmtMoney(totalPeakCost) + " · 空闲 " + fmtMoney(totalOffCost) + " · 合计 " + fmtMoney(totalCost) + (totalIn > count ? " · 报告仅含最近 " + count + " 条" : ""), P, 92);
      var cardW = (W - 2 * P - 6 * 10) / 7;
      var cards = [{l:"调用次数",v:fmtInt(count)},{l:"输入 · 未命中",v:fmtInt(totalMiss)},{l:"输入 · 缓存命中",v:fmtInt(totalHit)},{l:"输出",v:fmtInt(totalOut)},{l:"高峰消耗",v:fmtMoney(totalPeakCost)},{l:"空闲消耗",v:fmtMoney(totalOffCost)},{l:"总消耗",v:fmtMoney(totalCost)}];
      for (var ci = 0; ci < cards.length; ci++) { var x=P+ci*(cardW+10); c.fillStyle="#f5f7fa"; c.fillRect(x,112,cardW,70); c.strokeStyle="#e4e8ee"; c.strokeRect(x,112,cardW,70); c.fillStyle="#7a8699"; font(12); c.fillText(cards[ci].l,x+14,138); c.fillStyle="#1c2733"; font(19,"600"); c.fillText(cards[ci].v,x+14,166); }
      var y=218; c.fillStyle="#1c2733"; font(14,"600"); c.fillText("详细记录、按模型与按 API 服务商统计请在插件界面查看。",P,y); y+=24; c.fillStyle="#98a2b3"; font(11); c.fillText("计价：DeepSeek 官方按官方价；SiliconFlow 按人民币公开价；DigitalOcean 按美元价 × USD/CNY；未可靠映射的第三方价格按 ¥0。",P,y);
    }

    function OverviewView(props) {
      var records = props.records, regime = props.regime;
      var totalCalls = records.length, totalHit = 0, totalMiss = 0, totalWrite = 0, totalOut = 0, totalReason = 0, totalCost = 0, peakTotal = 0, offTotal = 0, peakCalls = 0, offCalls = 0;
      var byModel = {}, byProvider = {}, byProviderModel = {};
      for (var i = 0; i < records.length; i++) {
        var r = records[i], cost = costOf(r, regime), gk = modelGroupKey(r), pk = providerGroupKey(r.provider), pmKey = pk + "||" + gk;
        totalHit += r.cacheReadTokens || 0; totalMiss += r.inputTokens || 0; totalWrite += r.cacheWriteTokens || 0; totalOut += r.outputTokens || 0; totalReason += r.reasoningTokens || 0; totalCost += cost;
        if (!byModel[gk]) byModel[gk] = { key:gk,name:modelName(r),calls:0,hit:0,miss:0,out:0,reason:0,cost:0,peakCost:0,offCost:0,peakCalls:0,offCalls:0,providers:{} };
        if (!byProvider[pk]) byProvider[pk] = { key:pk,name:providerName(r.provider),calls:0,cost:0,peakCost:0,offCost:0,peakCalls:0,offCalls:0,miss:0,hit:0,out:0,reason:0 };
        if (!byProviderModel[pmKey]) byProviderModel[pmKey] = { key:pmKey,providerKey:pk,providerName:providerName(r.provider),modelName:modelName(r),calls:0,cost:0,peakCost:0,offCost:0,peakCalls:0,offCalls:0,miss:0,hit:0,out:0,reason:0 };
        var m=byModel[gk], p=byProvider[pk], pm=byProviderModel[pmKey]; m.calls++; m.hit+=r.cacheReadTokens||0; m.miss+=r.inputTokens||0; m.out+=r.outputTokens||0; m.reason+=r.reasoningTokens||0; m.cost+=cost; m.providers[p.name]=true;
        p.calls++; p.cost+=cost; p.miss+=r.inputTokens||0; p.hit+=r.cacheReadTokens||0; p.out+=r.outputTokens||0; p.reason+=r.reasoningTokens||0;
        pm.calls++; pm.cost+=cost; pm.miss+=r.inputTokens||0; pm.hit+=r.cacheReadTokens||0; pm.out+=r.outputTokens||0; pm.reason+=r.reasoningTokens||0;
        if (r.peak) { m.peakCost+=cost;m.peakCalls++;p.peakCost+=cost;p.peakCalls++;pm.peakCost+=cost;pm.peakCalls++;peakTotal+=cost;peakCalls++; } else { m.offCost+=cost;m.offCalls++;p.offCost+=cost;p.offCalls++;pm.offCost+=cost;pm.offCalls++;offTotal+=cost;offCalls++; }
      }
      var hitRate=(totalHit+totalMiss+totalWrite)>0?(totalHit/(totalHit+totalMiss+totalWrite)*100).toFixed(1)+"%":"—";
      var modelRows=Object.keys(byModel).map(function(k){var m=byModel[k];m.providerText=Object.keys(m.providers).sort().join(" / ")||"未知服务商";return m;});
      var providerRows=Object.keys(byProvider).map(function(k){return byProvider[k];}).sort(function(a,b){return b.cost-a.cost;});
      var pmRows=[];
      for(var pi=0;pi<providerRows.length;pi++){var pr=providerRows[pi];pmRows.push(el("tr",{key:"g-"+pr.key},el("td",{style:st.tdGroup},pr.name),el("td",{style:st.tdGroup},""),el("td",{style:st.tdGroupR},fmtInt(pr.calls)),el("td",{style:st.tdGroupR},fmtInt(pr.miss)),el("td",{style:st.tdGroupR},fmtInt(pr.hit)),el("td",{style:st.tdGroupR},fmtInt(pr.out)),el("td",{style:st.tdGroupR},fmtMoney(pr.cost))));for(var key in byProviderModel){var md=byProviderModel[key];if(md.providerKey!==pr.key)continue;pmRows.push(el("tr",{key:"pm-"+md.key},el("td",{style:st.tdFirst},""),el("td",{style:st.tdWrap},md.modelName),el("td",{style:st.td},fmtInt(md.calls)),el("td",{style:st.td},fmtInt(md.miss)),el("td",{style:st.td},fmtInt(md.hit)),el("td",{style:st.td},fmtInt(md.out)),el("td",{style:st.td},fmtMoney(md.cost))));}}
      return el("div",null,
        el("div",{style:st.cards},el(Card,{label:"调用次数",value:fmtInt(totalCalls),hint:"高峰 "+fmtInt(peakCalls)+" · 空闲 "+fmtInt(offCalls)}),el(Card,{label:"输入 · 未命中",value:fmtInt(totalMiss),hint:"token"}),el(Card,{label:"输入 · 缓存命中",value:fmtInt(totalHit),hint:"命中率 "+hitRate}),el(Card,{label:"输出",value:fmtInt(totalOut),hint:"token"}),el(Card,{label:"高峰消耗",value:fmtMoney(peakTotal)}),el(Card,{label:"空闲消耗",value:fmtMoney(offTotal)}),el(Card,{label:"总消耗",value:fmtMoney(totalCost),hint:regimeLabel(regime)})),
        el("div",{style:st.sec},"消耗表（按模型）"),el("div",{style:st.scroll},el("table",{style:st.tbl},el("thead",null,el("tr",null,el("th",{style:st.thFirst},"模型"),el("th",{style:st.thFirst},"API 服务商"),el("th",{style:st.th},"调用"),el("th",{style:st.th},"输入"),el("th",{style:st.th},"缓存命中"),el("th",{style:st.th},"输出"),el("th",{style:st.th},"总消耗"))),el("tbody",null,modelRows.map(function(m){return el("tr",{key:m.key},el("td",{style:st.tdWrap},m.name),el("td",{style:st.tdWrap},m.providerText),el("td",{style:st.td},fmtInt(m.calls)),el("td",{style:st.td},fmtInt(m.miss)),el("td",{style:st.td},fmtInt(m.hit)),el("td",{style:st.td},fmtInt(m.out)),el("td",{style:st.td},fmtMoney(m.cost)));})))),
        el("div",{style:st.sec,marginTop:14},"消耗明细（按 API 服务商 × 模型）"),el("div",{style:st.scroll},el("table",{style:st.tbl},el("thead",null,el("tr",null,el("th",{style:st.thFirst},"API 服务商"),el("th",{style:st.thFirst},"模型"),el("th",{style:st.th},"调用"),el("th",{style:st.th},"输入"),el("th",{style:st.th},"缓存命中"),el("th",{style:st.th},"输出"),el("th",{style:st.th},"总消耗"))),el("tbody",null,pmRows))),
        el("div",{style:st.note,marginTop:8},"DeepSeek 官方请求按官方价格；SiliconFlow 按自身人民币公开价；DigitalOcean 按美元公开价 × USD/CNY 汇率折算人民币；千问暂不计费；AMD GPU Cloud DeepSeek V4 Flash 免费按 ¥0。模型名与 API 服务商均以请求参数为准。")
      );
    }

    function CalendarView(props) {
      var records=props.records, regime=props.regime, days=props.days||[];
      var nowB=new Date(Date.now()+8*3600*1000), nowY=nowB.getUTCFullYear(), nowM=nowB.getUTCMonth();
      var ymState=React.useState({y:nowY,m:nowM}), ym=ymState[0], setYm=ymState[1]; var selState=React.useState(null), selectedDay=selState[0], setSelectedDay=selState[1]; var dimState=React.useState("cost"), dimMode=dimState[0], setDim=dimState[1];
      var y=ym.y,m=ym.m,nDays=monthDays(y,m),offset=monthOffset(y,m),dayMap={}; for(var di=0;di<days.length;di++)dayMap[days[di].day]=days[di];
      var splitMap={};for(var sr=0;sr<records.length;sr++){var rec0=records[sr],k0=bjKey(rec0.time),c0=costOf(rec0,regime);if(!splitMap[k0])splitMap[k0]={peak:0,off:0};if(rec0.peak)splitMap[k0].peak+=c0;else splitMap[k0].off+=c0;}
      function dayCost(d){if(!d)return 0;if(regime==="base")return d.baseCost||0;if(regime==="peakValley")return d.peakValleyCost||0;return d.autoCost!=null?d.autoCost:(d.baseCost||0);} function dayVal(d){return dimMode==="cost"?dayCost(d):(d?d.calls:0);}
      var maxV=0,monthCalls=0,monthMiss=0,monthHit=0,monthOut=0,monthPeak=0,monthOff=0;for(var d2=1;d2<=nDays;d2++){var key2=y+"-"+pad2(m+1)+"-"+pad2(d2),r2=dayMap[key2],v2=r2?dayVal(r2):0;if(v2>maxV)maxV=v2;if(r2){monthCalls+=r2.calls;monthMiss+=r2.miss;monthHit+=r2.hit;monthOut+=r2.out;var ds2=daySplit(r2,regime,splitMap[key2]);monthPeak+=ds2.peak;monthOff+=ds2.off;}}
      var weeks=["一","二","三","四","五","六","日"],cells=[];for(var b=0;b<offset;b++)cells.push(el("div",{key:"b"+b,style:st.calCellBlank},""));for(var d3=1;d3<=nDays;d3++){(function(day){var key=y+"-"+pad2(m+1)+"-"+pad2(day),r=dayMap[key],v=r?dayVal(r):0,inten=maxV>0?v/maxV:0,bg=r&&v>0?"rgba(46,134,222,"+(0.12+0.66*inten).toFixed(2)+")":"rgba(128,128,128,.06)",fg=inten>0.5?"#fff":"inherit";cells.push(el("div",{key:key,title:r?dayLabel(key)+"\n调用 "+r.calls+" 次\n消耗 "+fmtMoney(dayCost(r)):dayLabel(key)+"\n无记录",onClick:function(){setSelectedDay(selectedDay===key?null:key);},style:Object.assign({background:bg,color:fg},st.calCell,selectedDay===key?st.calCellOn:null)},el("div",null,String(day)),r?el("div",{style:st.calCellVal},dimMode==="cost"?fmtMoney(dayCost(r)):fmtInt(r.calls)):el("div",{style:st.calCellVal},"—")));})(d3);}
      var selRecords=selectedDay?records.filter(function(r){return bjKey(r.time)===selectedDay;}).sort(function(a,b){return b.time-a.time;}):[];
      var monthRows=[];for(var dd=1;dd<=nDays;dd++){var kd=y+"-"+pad2(m+1)+"-"+pad2(dd);if(dayMap[kd])monthRows.push(dayMap[kd]);}monthRows.sort(function(a,b){return a.day<b.day?1:-1;});
      return el("div",null,
        el("div",{style:st.calBar},el("button",{style:st.btn,onClick:function(){setYm({y:m===0?y-1:y,m:m===0?11:m-1});setSelectedDay(null);}},"‹ 上月"),el("span",{style:{fontSize:fs(14),fontWeight:600,minWidth:120,textAlign:"center"}},y+"年"+(m+1)+"月"),el("button",{style:st.btn,onClick:function(){setYm({y:m===11?y+1:y,m:m===11?0:m+1});setSelectedDay(null);}},"下月 ›"),el("button",{style:st.btn,onClick:function(){setYm({y:nowY,m:nowM});setSelectedDay(bjKey(Date.now()));}},"今天"),el("div",{style:st.seg,marginLeft:8},el("button",{style:dimMode==="cost"?st.segBtnOn:st.segBtn,onClick:function(){setDim("cost");}},"按消耗"),el("button",{style:dimMode==="calls"?st.segBtnOn:st.segBtn,onClick:function(){setDim("calls");}},"按调用数"))),
        el("div",{style:st.calGrid},weeks.map(function(w){return el("div",{key:w,style:st.calWk},w);}),cells),
        el("div",{style:st.cards,marginTop:12},el(Card,{label:"本月调用",value:fmtInt(monthCalls)}),el(Card,{label:"输入 · 未命中",value:fmtInt(monthMiss)}),el(Card,{label:"输入 · 缓存命中",value:fmtInt(monthHit)}),el(Card,{label:"输出",value:fmtInt(monthOut)}),el(Card,{label:"高峰消耗",value:fmtMoney(monthPeak)}),el(Card,{label:"空闲消耗",value:fmtMoney(monthOff)}),el(Card,{label:"本月消耗",value:fmtMoney(monthPeak+monthOff)})),
        monthRows.length?el("div",{style:st.scroll},el("table",{style:st.tbl},el("thead",null,el("tr",null,el("th",{style:st.thFirst},"日期"),el("th",{style:st.th},"调用"),el("th",{style:st.th},"输入"),el("th",{style:st.th},"缓存命中"),el("th",{style:st.th},"输出"),el("th",{style:st.th},"消耗"))),el("tbody",null,monthRows.map(function(d){return el("tr",{key:d.day},el("td",{style:st.tdClick,onClick:function(){setSelectedDay(d.day);}},dayLabel(d.day)),el("td",{style:st.td},fmtInt(d.calls)),el("td",{style:st.td},fmtInt(d.miss)),el("td",{style:st.td},fmtInt(d.hit)),el("td",{style:st.td},fmtInt(d.out)),el("td",{style:st.td},fmtMoney(dayCost(d))));})))):el("div",{style:st.empty},"本月暂无记录。"),
        selectedDay?el("div",null,el("div",{style:st.selDayTitle},dayLabel(selectedDay)+" 调用明细"),selRecords.length?el("div",{style:st.scroll},el("table",{style:st.tbl},el("thead",null,el("tr",null,el("th",{style:st.thFirst},"时间"),el("th",{style:st.thFirst},"模型 / 服务商"),el("th",{style:st.th},"输入"),el("th",{style:st.th},"缓存命中"),el("th",{style:st.th},"输出"),el("th",{style:st.th},"消耗"))),el("tbody",null,selRecords.map(function(r){return el("tr",{key:r.time},el("td",{style:st.tdFirst},fmtTime(r.time)),el("td",{style:st.tdWrap},modelName(r)+" · "+providerName(r.provider)),el("td",{style:st.td},fmtInt(r.inputTokens)),el("td",{style:st.td},fmtInt(r.cacheReadTokens)),el("td",{style:st.td},fmtInt(r.outputTokens)),el("td",{style:st.td},fmtMoney(costOf(r,regime))));})))):el("div",{style:st.empty},"该日无记录。")):null
      );
    }

    function CacheListView(props) {
      var records=props.records,regime=props.regime;var presetState=React.useState("all"),preset=presetState[0],setPreset=presetState[1];var fromState=React.useState(""),fromDate=fromState[0],setFromDate=fromState[1];var toState=React.useState(""),toDate=toState[0],setToDate=toState[1];var pageState=React.useState(1),page=pageState[0],setPage=pageState[1];
      var nowKey=bjKey(Date.now()),fromMs=null,toMs=null;if(preset==="today"){fromMs=bjStartMs(nowKey);toMs=Date.now();}else if(preset==="7d"){fromMs=bjStartMs(nowKey)-6*86400000;toMs=Date.now();}else if(preset==="30d"){fromMs=bjStartMs(nowKey)-29*86400000;toMs=Date.now();}else if(preset==="custom"){if(fromDate)fromMs=bjStartMs(fromDate);if(toDate)toMs=bjStartMs(toDate)+86400000-1;}
      var filtered=records.filter(function(r){return (fromMs==null||r.time>=fromMs)&&(toMs==null||r.time<=toMs);}).sort(function(a,b){return b.time-a.time;});var PAGE_SIZE=100,totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)),curPage=Math.min(Math.max(1,page),totalPages),pageRows=filtered.slice((curPage-1)*PAGE_SIZE,curPage*PAGE_SIZE),sums=splitTotals(filtered,regime);
      return el("div",null,el("div",{style:st.calBar},["today","7d","30d","all"].map(function(k){var labels={today:"今天","7d":"近7天","30d":"近30天",all:"全部"};return el("button",{key:k,style:preset===k?st.segBtnOn:st.segBtn,onClick:function(){setPreset(k);setPage(1);}},labels[k]);}),el("input",{type:"date",style:st.dateInput,value:fromDate,onChange:function(e){setFromDate(e.target.value);setPreset("custom");setPage(1);}}),el("span",{style:st.note},"至"),el("input",{type:"date",style:st.dateInput,value:toDate,onChange:function(e){setToDate(e.target.value);setPreset("custom");setPage(1);}})),
        el("div",{style:st.note,marginTop:8},"当前范围："+fmtInt(filtered.length)+" 条 · 高峰 "+fmtMoney(sums.peak)+" · 空闲 "+fmtMoney(sums.off)),
        filtered.length?el("div",null,el("div",{style:st.calBar},el("button",{style:curPage<=1?st.btnDisabled:st.btn,disabled:curPage<=1,onClick:function(){setPage(curPage-1);}},"‹ 上一页"),el("span",{style:st.note},"第 "+curPage+" / "+totalPages+" 页"),el("button",{style:curPage>=totalPages?st.btnDisabled:st.btn,disabled:curPage>=totalPages,onClick:function(){setPage(curPage+1);}},"下一页 ›")),el("div",{style:st.scroll},el("table",{style:st.tbl},el("thead",null,el("tr",null,el("th",{style:st.thFirst},"时间(北京)"),el("th",{style:st.thFirst},"模型 / 服务商"),el("th",{style:st.th},"输入"),el("th",{style:st.th},"缓存命中"),el("th",{style:st.th},"输出"),el("th",{style:st.th},"消耗"))),el("tbody",null,pageRows.map(function(r){return el("tr",{key:r.time},el("td",{style:st.tdFirst},fmtTime(r.time)),el("td",{style:st.tdWrap},modelName(r)+" · "+providerName(r.provider)),el("td",{style:st.td},fmtInt(r.inputTokens)),el("td",{style:st.td},fmtInt(r.cacheReadTokens)),el("td",{style:st.td},fmtInt(r.outputTokens)),el("td",{style:st.td},fmtMoney(costOf(r,regime))));}))))):el("div",{style:st.empty},"该时间范围内没有记录。"));
    }

    function PriceView(props) {
      var pricing=props.pricing||{base:{},peakValley:{}},effectiveAt=props.effectiveAt||0,fx=props.fx||{};var regimeState=React.useState("auto"),regime=regimeState[0],setRegime=regimeState[1];
      var showRegime=function(r){if(r==="auto")return Date.now()<effectiveAt?"base":"peakValley";return r;};var table=pricing[showRegime(regime)]||{};var cell=function(mk,a,b){var row=table[mk];if(!row)return"—";if(showRegime(regime)==="base")return fmtPrice(row[a]);return row[a]?fmtPrice(row[a][b]):"—";};
      var rows=PRICE_MODELS.map(function(mk){return showRegime(regime)==="base"?el("tr",{key:mk},el("td",{style:st.tdFirst},modelLabel(mk)),el("td",{style:st.td},cell(mk,"cacheHit")),el("td",{style:st.td},cell(mk,"cacheMiss")),el("td",{style:st.td},cell(mk,"output"))):el("tr",{key:mk},el("td",{style:st.tdFirst},modelLabel(mk)),el("td",{style:st.td},cell(mk,"offPeak","cacheHit")),el("td",{style:st.td},cell(mk,"offPeak","cacheMiss")),el("td",{style:st.td},cell(mk,"offPeak","output")),el("td",{style:st.td},cell(mk,"peak","cacheHit")),el("td",{style:st.td},cell(mk,"peak","cacheMiss")),el("td",{style:st.td},cell(mk,"peak","output")));});
      var third=[
        ["SiliconFlow","DeepSeek-V4-Flash","¥0.02","¥1.00","¥2.00","已用于自动计费"],["SiliconFlow","DeepSeek-V4-Pro","¥1.00","¥12.00","¥24.00","已用于自动计费"],["SiliconFlow","DeepSeek-V3.2","¥0.40","¥4.00","¥6.00","已用于自动计费"],["SiliconFlow","Qwen3.6-27B","按输入价","¥3.00","¥18.00","公告未单列缓存命中价"],["DigitalOcean","DeepSeek V4 Flash","$0.028","$0.112","$0.224","按 USD/CNY 汇率折算"],["DigitalOcean","DeepSeek V4 Pro","$0.348","$1.392","$2.784","按 USD/CNY 汇率折算"],["DigitalOcean","DeepSeek V3.2","$0.15","$0.425","$1.36","按 USD/CNY 汇率折算"],["Alibaba / 千问","暂不计费","—","—","—","调用与 token 正常统计；费用暂按 ¥0"],["AMD GPU Cloud","DeepSeek V4 Flash","¥0","¥0","¥0","免费；费用按 ¥0"]
      ];
      return el("div",null,
        el("div",{style:st.sec},"今日 $ / ¥ 汇率"),el("div",{style:st.cards,marginTop:8},el(Card,{label:"$ → ¥",value:fx.rate?("$1 = ¥"+Number(fx.rate).toFixed(4)):"暂不可用",hint:fx.date?("汇率日期 "+fx.date):"等待获取"}),el(Card,{label:"¥ → $",value:fx.inverse?("¥1 = $"+Number(fx.inverse).toFixed(6)):"暂不可用",hint:fx.source||"Frankfurter"}),el(Card,{label:"汇率状态",value:fx.stale?"缓存汇率":(fx.rate?"最新可用":"获取失败"),hint:fx.error||"Frankfurter"})),el("div",{style:st.actions,marginTop:8},el("button",{style:st.btn,onClick:props.onFxRefresh},"刷新汇率"),el("span",{style:st.note},"DigitalOcean 美元计价按该 USD/CNY 汇率换算成人民币。")),
        el("div",{style:st.sec,marginTop:18},"DeepSeek 官方 API 价格表"),el("div",{style:st.note,marginTop:6},"本表仅用于 DeepSeek 官方 Provider；第三方 Provider 按下方已核验的自身价格计费，无法可靠匹配价格的模型按 0 统计。价格按官方公布固定，不可编辑。"),
        el("div",{style:st.calBar},el("div",{style:st.seg},["auto","peakValley","base"].map(function(k){var labels={auto:"自动",peakValley:"峰谷价",base:"基础价"};return el("button",{key:k,style:regime===k?st.segBtnOn:st.segBtn,onClick:function(){setRegime(k);}},labels[k]);}))),
        showRegime(regime)==="base"?el("div",{style:st.scroll},el("table",{style:st.tbl},el("thead",null,el("tr",null,el("th",{style:st.thFirst},"模型"),el("th",{style:st.th},"缓存命中"),el("th",{style:st.th},"输入"),el("th",{style:st.th},"输出"))),el("tbody",null,rows))):el("div",{style:st.scroll},el("table",{style:st.tbl},el("thead",null,el("tr",null,el("th",{style:st.thFirst},"模型"),el("th",{style:st.th},"空闲 · 缓存命中"),el("th",{style:st.th},"空闲 · 输入"),el("th",{style:st.th},"空闲 · 输出"),el("th",{style:st.th},"高峰 · 缓存命中"),el("th",{style:st.th},"高峰 · 输入"),el("th",{style:st.th},"高峰 · 输出"))),el("tbody",null,rows))),
        el("div",{style:st.sec,marginTop:18},"第三方平台价格与覆盖状态"),el("div",{style:st.note,marginTop:6},"只把能与记录中的 provider/model 可靠匹配的价格用于自动计费；美元价格先按 USD 计算，再乘 USD/CNY 汇率统一折算成人民币。"),el("div",{style:st.scroll,marginTop:8},el("table",{style:st.tbl},el("thead",null,el("tr",null,el("th",{style:st.thFirst},"API 服务商"),el("th",{style:st.thFirst},"模型 / 状态"),el("th",{style:st.th},"缓存命中"),el("th",{style:st.th},"输入"),el("th",{style:st.th},"输出"),el("th",{style:st.thFirst},"说明"))),el("tbody",null,third.map(function(row,idx){return el("tr",{key:idx},el("td",{style:st.tdFirst},row[0]),el("td",{style:st.tdWrap},row[1]),el("td",{style:st.td},row[2]),el("td",{style:st.td},row[3]),el("td",{style:st.td},row[4]),el("td",{style:st.tdWrap},row[5]));}))))
      );
    }

    var SUBTABS=[{k:"overview",t:"概览"},{k:"calendar",t:"用量日历"},{k:"cache",t:"缓存命中列表"},{k:"prices",t:"价格表"}];
    function UsagePanel(props){
      var state=React.useState({records:[],count:0,dataPath:"",persistOk:false,persistError:"",pricing:null,days:[],fx:{}}),data=state[0],setData=state[1];var tabState=React.useState("overview"),tab=tabState[0],setTab=tabState[1];var errState=React.useState(""),error=errState[0],setError=errState[1];var expState=React.useState(""),exportMsg=expState[0],setExportMsg=expState[1];var impState=React.useState(""),importMsg=impState[0],setImportMsg=impState[1];var destState=React.useState(""),destDir=destState[0],setDestDir=destState[1];var canvasNode=null,fileInputNode=null,timer=props.timer;
      function refresh(){api({action:"list"}).then(function(res){setData(res||{records:[],count:0,dataPath:"",persistOk:false,persistError:"",pricing:null,days:[],fx:{}});setError("");}).catch(function(e){setError(String((e&&e.message)||e));});}
      React.useEffect(function(){refresh();if(timer&&timer.interval)return timer.interval(refresh,10000);},[]);
      function showExport(res){if(res&&res.ok){setExportMsg("已导出："+res.path);if(res.dir)api({action:"reveal",dir:res.dir}).catch(function(){});}else setExportMsg("导出失败："+((res&&res.error)||"未知错误"));}
      function doExport(kind){setExportMsg("导出中…");api({action:"export",kind:kind,dir:destDir||undefined}).then(showExport).catch(function(e){setExportMsg("导出失败："+String((e&&e.message)||e));});}
      function doExportImage(){setExportMsg("生成图片中…");if(!canvasNode){setExportMsg("画布不可用");return;}try{drawReport(canvasNode,(data.records||[]).slice());api({action:"exportPng",dataUrl:canvasNode.toDataURL("image/png"),dir:destDir||undefined}).then(showExport).catch(function(e){setExportMsg("导出失败："+String((e&&e.message)||e));});}catch(e){setExportMsg("生成图片失败："+String((e&&e.message)||e));}}
      function pickDestDir(){api({action:"pickDir"}).then(function(res){if(res&&res.ok){setDestDir(res.path);setExportMsg("导出目标："+res.path);}else if(!res||!res.cancelled)setExportMsg("选择目录失败："+((res&&res.error)||""));});}
      function doReveal(){api({action:"reveal",dir:destDir||"data"}).then(function(res){if(!res||!res.ok)setExportMsg("打开文件夹失败："+((res&&res.error)||""));});}
      function doClear(){api({action:"clear"}).then(refresh).catch(function(e){setError(String((e&&e.message)||e));});}
      function onFileChange(e){var f=e.target.files&&e.target.files[0];if(!f)return;var readPromise=typeof f.text==="function"?f.text():new Promise(function(resolve,reject){var r=new FileReader();r.onload=function(){resolve(r.result);};r.onerror=reject;r.readAsText(f);});readPromise.then(function(content){api({action:"import",content:String(content),filename:f.name}).then(function(res){if(res&&res.ok){setImportMsg("导入成功：新增 "+res.imported+" 条，跳过重复 "+res.skipped+" 条");refresh();}else setImportMsg("导入失败："+((res&&res.error)||"未知错误"));});});}
      var records=data.records||[],nowPeak=isPeakNow(Date.now()),effectiveAt=data.effectiveAt||0,nowEffective=effectiveAt?Date.now()>=effectiveAt:true;
      return el("div",{style:st.root},el("canvas",{ref:function(n){canvasNode=n;},style:{display:"none"}}),el("div",{style:st.head},el("div",{style:st.headleft},el("div",null,el("div",{style:st.title},"用量与消耗"),el("div",{style:st.sub},"记录插件激活后的每一次模型调用")),el("span",{style:nowPeak?st.badgePeak:st.badgeValley},nowPeak?"当前 · 高峰时段":"当前 · 空闲时段"),el("span",{style:nowEffective?st.badgeHit:st.badgeValley},nowEffective?"新价格已生效":"新价格未生效")),el("div",{style:st.actions},el("button",{style:st.btn,onClick:refresh},"刷新"),el("button",{style:st.btn,onClick:doClear},"清空"))),
        el("div",{style:st.subtabBar},SUBTABS.map(function(t){return el("button",{key:t.k,style:tab===t.k?st.subtabOn:st.subtab,onClick:function(){setTab(t.k);}},t.t);})),el("div",{style:st.note,marginTop:6},"计价说明：DeepSeek 官方与 SiliconFlow 按人民币价格；DigitalOcean 按美元官方价 × USD/CNY 汇率折算人民币；千问暂不计费；AMD GPU Cloud DeepSeek V4 Flash 免费按 ¥0。"),
        tab==="overview"?el(OverviewView,{records:records,regime:"auto"}):null,tab==="calendar"?el(CalendarView,{records:records,regime:"auto",days:data.days||[]}):null,tab==="cache"?el(CacheListView,{records:records,regime:"auto"}):null,tab==="prices"?el(PriceView,{pricing:data.pricing,effectiveAt:data.effectiveAt,fx:data.fx||{},onFxRefresh:function(){api({action:"fxRefresh"}).then(refresh).catch(function(){});}}):null,
        el("div",{style:st.actions,marginTop:4},el("button",{style:st.btn,onClick:function(){doExport("csv");}},"导出 CSV"),el("button",{style:st.btn,onClick:function(){doExport("json");}},"导出 JSON"),el("button",{style:st.btn,onClick:doExportImage},"导出图片 (PNG)"),el("button",{style:st.btn,onClick:doReveal},"打开目录"),exportMsg?el("span",{style:st.sub},exportMsg):null),
        el("div",{style:st.actions},el("input",{style:st.input,placeholder:"导出目标目录（留空 = 默认数据目录）",value:destDir,onChange:function(e){setDestDir(e.target.value);}}),el("button",{style:st.btn,onClick:pickDestDir},"选择目录…"),destDir?el("button",{style:st.btn,onClick:function(){setDestDir("");}},"重置"):null),
        el("div",{style:st.actions},el("input",{type:"file",accept:".json,.csv",style:{display:"none"},ref:function(n){fileInputNode=n;},onChange:onFileChange}),el("button",{style:st.btn,onClick:function(){if(fileInputNode)fileInputNode.click();}},"选择文件导入"),importMsg?el("span",{style:st.sub},importMsg):null),error?el("div",{style:st.err},error):null,data.dataPath?el("div",{style:st.note},"数据持久化："+data.dataPath+"（每次调用实时落盘，插件重启后自动恢复，最多保留 100000 条）"):el("div",{style:st.note,color:"#ff6b6b",opacity:1},"持久化未启用："+(data.persistError||"未知原因")));
    }

    function BalancePanel(){
      var state=React.useState({status:"idle",data:null,error:""}),s=state[0],setS=state[1];var providerState=React.useState("deepseek"),provider=providerState[0],setProvider=providerState[1];var tokenState=React.useState(""),digitalOceanToken=tokenState[0],setDigitalOceanToken=tokenState[1];var credentialState=React.useState({status:"idle",configured:false,source:"",writable:true,masked:""}),credential=credentialState[0],setCredential=credentialState[1];var saveState=React.useState({status:"idle",error:""}),saving=saveState[0],setSaving=saveState[1];
      var providers=[{id:"deepseek",name:"DeepSeek",hint:"DEEPSEEK_API_KEY（推理 Key）"},{id:"siliconflow",name:"SiliconFlow",hint:"模型设置中 siliconflow Provider 所引用的 API Key",actionUrl:"https://cloud.siliconflow.cn/account/ak",actionLabel:"打开 SiliconFlow API 密钥"},{id:"digitalocean",name:"DigitalOcean",hint:"账户级 dop_v1_ Personal Access Token",actionUrl:"https://cloud.digitalocean.com/account/api/tokens",actionLabel:"创建 DigitalOcean Account API Token"},{id:"amd-gpu-cloud",name:"AMD GPU Cloud",hint:"暂无公开余额 API，仅支持控制台查看",unsupported:true,actionUrl:"https://www.amd.com/en/developer/resources/cloud-access/amd-developer-cloud.html",actionLabel:"打开 AMD Developer Cloud"}];var selected=providers.filter(function(p){return p.id===provider;})[0]||providers[0];
      function query(nextProvider){var target=typeof nextProvider==="string"?nextProvider:provider;setS({status:"loading",data:null,error:""});api({action:"balance",provider:target}).then(function(res){if(res&&res.ok)setS({status:"done",data:res,error:""});else setS({status:"error",data:res,error:(res&&res.error)||"查询失败"});}).catch(function(e){setS({status:"error",data:null,error:String((e&&e.message)||e)});});}
      function loadDO(shouldQuery){setCredential({status:"loading",configured:false,source:"",writable:true,masked:""});api({action:"balanceCredentialStatus",provider:"digitalocean"}).then(function(res){if(!res||!res.ok){setCredential({status:"error",configured:false,source:"",writable:false,masked:"",error:(res&&res.error)||"无法读取凭据状态"});return;}setCredential({status:"done",configured:!!res.configured,source:res.source||"",writable:res.writable!==false,masked:res.masked||""});if(shouldQuery&&res.configured)query("digitalocean");});}
      function saveDO(){var value=String(digitalOceanToken||"").trim();if(!value){setSaving({status:"error",error:"请输入以 dop_v1_ 开头的 DigitalOcean 账户 PAT。"});return;}setSaving({status:"saving",error:""});api({action:"saveBalanceCredential",provider:"digitalocean",value:value}).then(function(res){if(!res||!res.ok){setSaving({status:"error",error:(res&&res.error)||"保存失败"});return;}setDigitalOceanToken("");setCredential({status:"done",configured:true,source:res.source||"file",writable:res.writable!==false,masked:res.masked||"••••••••••••"});setSaving({status:"done",error:""});query("digitalocean");});}
      function choose(id){setProvider(id);setS({status:"idle",data:null,error:""});setSaving({status:"idle",error:""});setDigitalOceanToken("");if(id==="digitalocean")loadDO(true);else query(id);}React.useEffect(function(){query("deepseek");},[]);
      var d=s.data,symbol=currencySymbol(d&&d.currency),actionUrl=(d&&d.credentialHelpUrl)||selected.actionUrl||"",meta=[];if(d&&d.credentialName)meta.push("使用凭据 "+d.credentialName);if(d&&d.credentialSource)meta.push("来源 "+d.credentialSource);if(d&&d.modelProviderRoute)meta.push("模型提供商 "+d.modelProviderRoute);var heroLabel=d&&d.balanceLabel?d.balanceLabel:((d&&d.providerName)||selected.name)+" · 账户余额";
      return el("div",{style:st.root},el("div",{style:st.head},el("div",null,el("div",{style:st.title},"剩余余额查询"),el("div",{style:st.sub},"查询 DeepSeek、SiliconFlow 与 DigitalOcean 账户余额")),el("div",{style:st.actions},selected.unsupported?el("a",{style:Object.assign({},st.btn,{textDecoration:"none"}),href:selected.actionUrl,target:"_blank",rel:"noreferrer"},"打开控制台"):(provider==="digitalocean"&&!credential.configured?null:el("button",{style:s.status==="loading"?st.btnDisabled:st.btn,disabled:s.status==="loading",onClick:function(){query();}},s.status==="loading"?"查询中…":provider==="digitalocean"?"查询账单":"查询余额")))),
        el("div",{style:st.subtabBar},providers.map(function(p){return el("button",{key:p.id,style:provider===p.id?st.subtabOn:st.subtab,onClick:function(){choose(p.id);}},p.name);})),el("div",{style:st.note},"所需凭据："+selected.hint),
        s.status==="error"?el("div",{style:d&&d.unsupported?st.infobox:st.errbox},el("div",{style:d&&d.unsupported?st.infoboxTitle:st.errboxTitle},d&&d.unsupported?"仅支持控制台查看":"查询失败"),el("div",null,s.error),actionUrl?el("a",{style:st.actionLink,href:actionUrl,target:"_blank",rel:"noreferrer"},selected.actionLabel||"打开服务商凭据页面"):null):null,
        s.status==="loading"&&!d?el("div",{style:st.empty},"正在查询余额…"):null,d&&d.ok?el("div",{style:st.hero},el("div",{style:st.heroLabel},heroLabel),el("div",{style:st.heroValue},symbol+" "+fmtBalance(d.totalBalance)),el("div",{style:st.heroCurrency},d.currency||"查询成功"),d.isAvailable==null?null:el("span",{style:d.isAvailable?st.badgeHit:st.badgePeak},d.isAvailable?"可用":"不可用")):null,
        d&&d.ok?el("div",{style:st.cards},(d.details||[]).map(function(item,idx){return el(Card,{key:String(idx),label:item.label,value:symbol+" "+fmtBalance(item.value),hint:item.hint});}),d.generatedAt?el(Card,{label:"账单更新时间",value:fmtTime(Date.parse(d.generatedAt)),hint:d.generatedAt}):null,el(Card,{label:"查询时间",value:fmtTime(d.queriedAt),hint:"北京时间"})):null,
        provider==="digitalocean"?el("div",{style:st.infobox},el("div",{style:st.infoboxTitle},"DigitalOcean Account API"),el("div",null,"请使用账户级 Personal Access Token，不要使用 Gradient AI 推理 Key。"),el("a",{style:st.actionLink,href:selected.actionUrl,target:"_blank",rel:"noreferrer"},selected.actionLabel),el("div",{style:st.note,marginTop:8},credential.status==="loading"?"正在检查已保存的 Token…":credential.configured?"已保存："+(credential.masked||"••••••••••••")+(credential.source?"（来源："+credential.source+"）":""):credential.status==="error"?"无法读取 Token 状态："+(credential.error||"未知错误"):"尚未保存 DIGITALOCEAN_TOKEN。"),el("div",{style:st.actions,marginTop:8},el("input",{type:"password",autoComplete:"new-password",style:st.input,placeholder:credential.configured?"输入新的 dop_v1_ Token 可替换":"dop_v1_…",value:digitalOceanToken,disabled:saving.status==="saving"||(credential.configured&&!credential.writable),onChange:function(e){setDigitalOceanToken(e.target.value);}}),el("button",{style:saving.status==="saving"?st.btnDisabled:st.btnPrimary,disabled:saving.status==="saving"||(credential.configured&&!credential.writable),onClick:saveDO},saving.status==="saving"?"保存中…":"保存并查询")),saving.status==="error"?el("div",{style:st.err},saving.error):null):null,
        provider==="siliconflow"?el("div",{style:st.infobox},el("div",{style:st.infoboxTitle},"凭据读取规则"),el("div",null,"插件只读取“设置 → 模型”中 Provider ID 或显示名为 siliconflow 的提供商所引用的 apiKeyEnv；不会回退到其他服务商的 Key。"),d&&d.ok&&d.zeroBalance?el("div",{style:st.note,marginTop:8},"公开 API 成功返回 ¥0.00 时会忠实显示；/v1/user/info 不包含代金券或历史用量，因此控制台可用总额可能不同。"):null):null,
        d&&d.ok?el("div",{style:st.note},(d.sourceNote||"")+(meta.length?" "+meta.join("；")+"。":"")):null,el("div",{style:st.note},"DigitalOcean 查询主账户 Billing API；AMD GPU Cloud 当前仅提供控制台查看。"));
    }

    var inject=["slots"];
    function apply(ctx){var slots=ctx.get("slots");if(slots===undefined)return;var timer=ctx.get("timer");slots.inject("conversation.view",function(){return slots.register({name:"conversation.view",id:"usage-cost-view",order:20,label:"用量与消耗"},function(){return el("div",{style:st.tab},el(UsagePanel,{timer:timer}));});});slots.inject("conversation.view",function(){return slots.register({name:"conversation.view",id:"balance-view",order:30,label:"剩余余额查询"},function(){return el("div",{style:st.tab},el(BalancePanel,null));});});slots.inject("settings.section",function(){return slots.register({name:"settings.section",id:"usage-cost",order:30,label:"用量与消耗"},function(){return el(UsagePanel,{timer:timer});});});slots.inject("settings.section",function(){return slots.register({name:"settings.section",id:"balance",order:31,label:"剩余余额查询"},function(){return el(BalancePanel,null);});});}
    exports.inject=inject;exports.apply=apply;return module.exports;
  }
});