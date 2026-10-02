/* ============================================================
   知识文库 · 应用模块
   ============================================================ */
(function () {
  if (!window.Portal) return;
  const P = Portal;
  const { esc, emptyState } = P;

  function render() {
    const docs = P.data.docs || [];
    return `
      <div class="app-head">
        <h2>📚 知识文库</h2><span class="app-desc">制度模板 · SOP · 知识沉淀</span>
        <span class="app-crumb">应用 · 门户平台</span>
      </div>
      ${docs.length ? `
      <div class="grid cols-3">
        ${docs.map((d) => `<a class="card card-pad" data-act="toast" data-id="正在打开文档「${d.t}」" style="display:flex;gap:14px;align-items:center;cursor:pointer">
          <div style="width:46px;height:46px;border-radius:12px;background:var(--primary-50);display:grid;place-items:center;font-size:22px;flex:none">${d.icon}</div>
          <div style="min-width:0"><div style="font-weight:700">${esc(d.t)}</div><div style="color:var(--text-3);font-size:12px;margin-top:2px">${esc(d.c)}</div></div>
        </a>`).join("")}
      </div>` : emptyState("📚", "暂无文档")}`;
  }

  P.registerApp({ id: "docs", render });
})();
