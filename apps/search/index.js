/* ============================================================
   搜索 · 应用模块（应用 / 资讯 / 待办）
   ============================================================ */
(function () {
  if (!window.Portal) return;
  const P = Portal;
  const { esc, appLink, emptyState } = P;

  function render() {
    const q = (P.state.search || "").trim().toLowerCase();
    const appHits = P.apps.filter((a) => (a.name + a.desc).toLowerCase().includes(q));
    if (!q) return emptyState("🔍", "输入关键词搜索应用、资讯、待办");
    const news = (P.data.news || []).filter((n) => (n.title + n.summary + n.cat).toLowerCase().includes(q));
    const todos = (P.data.todos || []).filter((t) => t.title.toLowerCase().includes(q));
    const todoRow = (P.APP.todo && P.APP.todo.row) ? P.APP.todo.row : null;

    return `
      <div class="app-head"><h2>🔍 搜索结果</h2><span class="app-desc">“${esc(P.state.search)}”</span></div>

      <div class="card card-pad" style="margin-bottom:16px">
        <div class="section-head" style="margin:0"><h2 style="font-size:14px">🧩 应用 (${appHits.length})</h2></div>
        ${appHits.length ? `<div class="app-grid">${appHits.map((a) => {
          const inner = `<div class="at-ico" style="background:${a.color}">${a.icon}</div><div class="at-name">${a.name}</div><div class="at-tag">${esc(a.desc || "&nbsp;")}</div>`;
          return a.kind === "page" ? `<a class="app-tile" href="${appLink(a.id)}">${inner}</a>` : `<div class="app-tile" data-act="toast" data-id="正在打开「${a.name}」" style="cursor:pointer">${inner}</div>`;
        }).join("")}</div>` : emptyState("", "无匹配应用")}
      </div>

      <div class="card card-pad" style="margin-bottom:16px">
        <div class="section-head" style="margin:0"><h2 style="font-size:14px">📰 资讯 (${news.length})</h2></div>
        ${news.length ? news.map((n) => `<a class="list-row" href="${appLink("news")}/${n.id}"><div class="lr-ico" style="background:#1d4ed8">${n.icon}</div><div class="lr-main"><div class="lr-title">${esc(n.title)}</div><div class="lr-meta"><span class="tag tag-blue">${esc(n.cat)}</span></div></div></a>`).join("") : emptyState("", "无匹配资讯")}
      </div>

      <div class="card card-pad">
        <div class="section-head" style="margin:0"><h2 style="font-size:14px">✅ 待办 (${todos.length})</h2></div>
        ${todos.length ? (todoRow ? todos.map(todoRow).join("") : "") : emptyState("", "无匹配待办")}
      </div>`;
  }

  P.registerApp({ id: "search", render });
})();
