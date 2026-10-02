/* ============================================================
   应用中心 · 应用模块（读取平台目录，按分类聚合）
   ============================================================ */
(function () {
  if (!window.Portal) return;
  const P = Portal;
  const { esc, appLink } = P;

  function render() {
    const cats = P.data.appCats || [];
    return `
      <div class="app-head">
        <h2>🧩 应用中心</h2><span class="app-desc">全部应用分类目录</span>
        <span class="app-crumb">应用 · 门户平台</span>
      </div>
      ${cats.map((cat) => {
        const list = P.apps.filter((a) => a.cat === cat);
        if (!list.length) return "";
        return `
        <div class="app-cat">
          <div class="section-head"><h2 style="font-size:15px">${esc(cat)}</h2><span class="sub">${list.length} 个应用</span></div>
          <div class="app-grid">
            ${list.map((a) => {
              const inner = `<div class="qa-ico" style="background:${a.color}">${a.icon}</div><div class="qa-name">${a.name}</div>`;
              return a.kind === "page"
                ? `<a class="quick-app" href="${appLink(a.id)}">${inner}</a>`
                : `<div class="quick-app" data-act="toast" data-id="正在打开「${a.name}」" style="cursor:pointer">${inner}</div>`;
            }).join("")}
          </div>
        </div>`;
      }).join("")}`;
  }

  P.registerApp({ id: "apps", render });
})();
