/* ============================================================
   新闻通知 · 应用模块
   列表（分类筛选）+ 详情（配图）
   ============================================================ */
(function () {
  if (!window.Portal) return;
  const P = Portal;
  const { $, esc, appLink, emptyState } = P;

  const news = () => P.data.news || [];
  const cats = () => ["全部", ...new Set(news().map((n) => n.cat))];

  function newsCard(n) {
    return `
      <a class="news-card" href="${appLink("news")}/${n.id}">
        <img class="news-thumb" src="${n.img}" alt="${esc(n.title)}" loading="lazy" />
        <div style="flex:1;min-width:0">
          <div class="nc-title">${n.hot ? "🔥 " : ""}${esc(n.title)}</div>
          <div class="nc-desc">${esc(n.summary)}</div>
          <div class="nc-meta"><span class="tag tag-blue">${esc(n.cat)}</span><span>🏢 ${esc(n.source)}</span><span>📅 ${n.date}</span><span>👁 ${n.views}</span></div>
        </div>
      </a>`;
  }

  function render(param) {
    if (param) return detail(param);
    const cur = P.state.newsCat || "全部";
    const list = cur === "全部" ? news() : news().filter((n) => n.cat === cur);
    const metaMap = { "通知公告": ["📢", "#1d4ed8"], "公司新闻": ["🏢", "#16a34a"], "行业动态": ["🌐", "#f59e0b"] };
    return `
      <div class="app-head">
        <h2>📰 新闻通知</h2><span class="app-desc">公司新闻 · 通知公告 · 行业动态</span>
        <span class="app-crumb">应用 · 门户平台</span>
      </div>
      <div class="filter-bar" id="newsCats">
        ${cats().map((c) => `<button class="chip ${c === cur ? "active" : ""}" data-act="news-cat" data-id="${esc(c)}">${esc(c)}</button>`).join("")}
      </div>
      <div class="news-layout">
        <div>${list.map(newsCard).join("")}</div>
        <aside>
          <div class="card card-pad" style="margin-bottom:16px">
            <div class="section-head"><h2>📌 热点公告</h2></div>
            ${news().filter((n) => n.hot).map((n) => `<a href="${appLink("news")}/${n.id}" style="display:block;padding:10px 0;border-bottom:1px solid var(--border);font-weight:600;font-size:13.5px">· ${esc(n.title)}</a>`).join("")}
          </div>
          <div class="card card-pad">
            <div class="section-head"><h2>🗂️ 栏目分布</h2></div>
            ${cats().slice(1).map((c) => {
              const cnt = news().filter((n) => n.cat === c).length;
              const meta = metaMap[c] || ["📄", "#64748b"];
              return `<div class="setting-row">
                <div class="sr-ico" style="background:${meta[1]};color:#fff">${meta[0]}</div>
                <div class="sr-main"><div class="sr-title">${esc(c)}</div></div>
                <span class="tag tag-blue">${cnt} 篇</span>
              </div>`;
            }).join("")}
          </div>
        </aside>
      </div>`;
  }

  function detail(id) {
    const n = news().find((x) => x.id == id);
    if (!n) return emptyState("📰", "未找到该资讯");
    return `
      <a class="back-link" href="${appLink("news")}">‹ 返回新闻列表</a>
      <div class="news-detail-hero">
        <img src="${n.img}" alt="${esc(n.title)}" />
        <span class="ndh-badge">${n.icon} ${esc(n.cat)}</span>
      </div>
      <div class="card card-pad">
        <div class="section-head" style="margin-bottom:8px"><span class="tag tag-blue">${esc(n.cat)}</span>${n.hot ? '<span class="tag tag-red">热点</span>' : ""}</div>
        <h1 style="font-size:22px;line-height:1.4;margin-bottom:10px">${esc(n.title)}</h1>
        <div style="color:var(--text-3);font-size:13px;display:flex;gap:16px;margin-bottom:18px;flex-wrap:wrap">
          <span>🏢 ${esc(n.source)}</span><span>📅 ${n.date}</span><span>👁 ${n.views} 阅读</span>
        </div>
        <div class="prose">${n.body.map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}</div>
        <div style="margin-top:18px;display:flex;gap:10px">
          <button class="btn btn-ghost btn-sm" data-act="toast" data-id="已收藏本文">⭐ 收藏</button>
          <button class="btn btn-ghost btn-sm" data-act="toast" data-id="已复制分享链接">🔗 分享</button>
        </div>
      </div>`;
  }

  function onAction(act, id) {
    if (act === "news-cat") { P.state.newsCat = id; P.refresh(); }
  }

  P.registerApp({ id: "news", render, onAction });
})();
