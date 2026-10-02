/* ============================================================
   工作台 · 应用模块
   职责：编排组合（hero + KPI + 遍历 Portal.cards 上墙）
   自身导出卡片：工作概览（图表）、常用应用、日程提醒
   待办速览 / 最新消息 卡片由 todo / message 应用各自导出注册
   ============================================================ */
(function () {
  if (!window.Portal) return;
  const P = Portal;
  const { $, esc, appLink, emptyState } = P;

  const wb = () => P.data.workbench || { myStats: [], schedules: [], chart: { week: { days: [], todo: [], done: [] } } };
  const pendingTodos = () => (P.APP.todo && P.APP.todo.badgeCount) ? P.APP.todo.badgeCount() : 0;
  const unreadMsgs = () => (P.APP.message && P.APP.message.badgeCount) ? P.APP.message.badgeCount() : 0;

  function statValue(s) {
    if (s.dyn === "todo") return pendingTodos();
    if (s.dyn === "msg") return unreadMsgs();
    return s.value;
  }

  // 图表（纯 SVG，离线可用）
  function barChartSVG(w) {
    const W = 600, H = 240, pl = 36, pr = 12, pt = 34, pb = 28;
    const plotW = W - pl - pr, plotH = H - pt - pb;
    const maxRaw = Math.max(...w.todo, ...w.done);
    const max = Math.max(5, Math.ceil(maxRaw / 5) * 5);
    const n = w.days.length, gw = plotW / n, bw = 15, gap = 6, pairW = bw * 2 + gap;
    const yOf = (v) => pt + plotH * (1 - v / max);
    let grid = "", bars = "", labels = "";
    for (let i = 0; i <= 4; i++) {
      const y = pt + plotH * (1 - i / 4);
      grid += `<line x1="${pl}" y1="${y}" x2="${W - pr}" y2="${y}" stroke="#eef1f6"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a0b1">${Math.round(max * i / 4)}</text>`;
    }
    w.days.forEach((d, i) => {
      const cx = pl + gw * i + gw / 2, x1 = cx - pairW / 2;
      const y1 = yOf(w.todo[i]), y2 = yOf(w.done[i]);
      bars += `<rect x="${x1}" y="${y1}" width="${bw}" height="${pt + plotH - y1}" rx="3" fill="#1d4ed8"/>`;
      bars += `<rect x="${x1 + bw + gap}" y="${y2}" width="${bw}" height="${pt + plotH - y2}" rx="3" fill="#0ea5e9"/>`;
      labels += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#5b6573">${d}</text>`;
    });
    const legend = `<g font-size="11" fill="#5b6573"><rect x="${pl}" y="11" width="11" height="11" rx="2" fill="#1d4ed8"/><text x="${pl + 16}" y="20">待办</text><rect x="${pl + 58}" y="11" width="11" height="11" rx="2" fill="#0ea5e9"/><text x="${pl + 74}" y="20">完成</text></g>`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%">${grid}${bars}${labels}${legend}</svg>`;
  }
  function initCharts() {
    const el = $("#chartWeek");
    if (el) el.innerHTML = barChartSVG(wb().chart.week);
  }

  function scheduleRow(s) {
    return `
      <div class="list-row">
        <div class="lr-ico" style="background:${s.color}">${s.icon}</div>
        <div class="lr-main">
          <div class="lr-title">${esc(s.title)}</div>
          <div class="lr-meta"><span>🕒 ${esc(s.time)}</span><span>📍 ${esc(s.place)}</span></div>
        </div>
      </div>`;
  }

  function quickAppTile(a) {
    const inner = `
      <div class="qa-ico" style="background:${a.color}">${a.icon}</div>
      <div class="qa-name">${a.name}</div>`;
    return a.kind === "page"
      ? `<a class="quick-app" href="${appLink(a.id)}">${inner}</a>`
      : `<div class="quick-app" data-act="toast" data-id="正在打开「${a.name}」" style="cursor:pointer">${inner}</div>`;
  }

  // ---- 工作台导出的卡片 ----
  const cards = [
    {
      id: "wb-overview", appId: "workbench", title: "工作概览", icon: "📊",
      render() {
        const w = wb().chart.week;
        const d = w.done.reduce((a, b) => a + b, 0), t = w.todo.reduce((a, b) => a + b, 0);
        const rate = t ? Math.round(d / t * 100) : 0;
        return `
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
            <span class="sub">近 7 日待办与完成趋势</span><span class="more">完成率 ${rate}%</span>
          </div>
          <div id="chartWeek" style="height:240px"></div>`;
      },
    },
    {
      id: "wb-quickapps", appId: "workbench", title: "常用应用", icon: "⭐",
      render() {
        const stars = P.apps.filter((a) => a.starred);
        return `
          <div style="display:flex;justify-content:flex-end;margin-bottom:8px"><a class="more" href="${appLink("apps")}">全部 ›</a></div>
          <div class="quick-apps">${stars.map(quickAppTile).join("")}</div>`;
      },
    },
    {
      id: "wb-schedule", appId: "workbench", title: "日程提醒", icon: "🗓️",
      render() {
        const list = wb().schedules || [];
        return `
          <div style="display:flex;justify-content:flex-end;margin-bottom:8px"><a class="more" href="${appLink("todo")}">查看待办 ›</a></div>
          ${list.length ? `<div class="list">${list.map(scheduleRow).join("")}</div>` : emptyState("🗓️", "近期暂无日程")}`;
      },
    },
  ];

  function render() {
    const u = P.data.user || {};
    const hour = new Date().getHours();
    const greet = hour < 11 ? "早上好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好";
    const stat = wb().myStats || [];

    return `
      <section class="hero">
        <h1>${greet}，${esc(u.name || "")} 👋</h1>
        <p>${esc(u.company || "")} · ${esc(u.dept || "")} · ${esc(u.title || "")} · 今天有 ${pendingTodos()} 项待办待处理</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${appLink("todo")}">查看待办 (${pendingTodos()})</a>
          <a class="btn btn-ghost" href="${appLink("apps")}">打开应用中心</a>
        </div>
      </section>

      <div class="app-head">
        <h2>🏠 工作台</h2><span class="app-desc">数据与日程总览，待办消息一站处理</span>
      </div>

      <section class="section">
        <div class="grid stat-cards">
          ${stat.map((s) => `
            <div class="card kpi">
              <div class="kpi-top">
                <div class="kpi-ico" style="background:${s.bg};color:${s.color}">${s.icon}</div>
                ${s.trend ? `<div class="kpi-trend ${s.up ? "up" : "down"}">${s.up ? "▲" : "▼"} ${s.trend}</div>` : ""}
              </div>
              <div class="kpi-val">${statValue(s)}<span style="font-size:13px;color:var(--text-3);font-weight:600"> ${s.unit}</span></div>
              <div class="kpi-label">${s.label}</div>
            </div>`).join("")}
        </div>
      </section>

      <div class="home-cards">
        ${P.cards.map((c) => `
          <div class="card card-pad">
            <div class="section-head"><h2>${c.icon || ""} ${esc(c.title)}</h2></div>
            ${c.render()}
          </div>`).join("")}
      </div>`;
  }

  P.registerApp({
    id: "workbench",
    render,
    mounted() { initCharts(); },
    cards,
  });
})();
