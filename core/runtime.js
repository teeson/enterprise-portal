/* ============================================================
   智汇门户 · 核心运行时（Portal Framework）
   职责：
   - 应用/卡片/数据 注册表（registerApp / registerCard / registerData / setCatalog）
   - 路由（#/app/{id}/{param}）+ 事件委托（按 activeId 派发到应用 onAction）
   - 平台壳：导航、角标、抽屉、快捷面板、全局搜索、快捷键
   - 公共工具：$, $$, esc, toast, avatarURI, appLink, refresh, emptyState
   应用是一等公民：各 app 在自身目录中注册 render / onAction / 卡片，
   工作台只负责编排组合，不内联业务卡片。
   ============================================================ */
window.Portal = (function () {
  "use strict";

  const apps = [];        // 注册顺序（含平台目录中的链接型应用）
  const APP = {};         // id -> app 定义
  const cards = [];       // 已注册的卡片（应用导出供工作台使用）
  const data = {};        // 应用注册的自有数据
  let catalog = {};       // 平台目录（setCatalog 注入）

  // 跨应用 UI 态：集中管理，确保刷新后不丢（筛选/搜索/会话等）
  const state = {
    search: "",
    todoTab: "all",
    todoFilter: "all",
    newsCat: "全部",
    sheetMode: null,
    activeConv: null,
    activeId: "workbench",
  };

  /* ---------------- 工具 ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 1800);
  }

  // 生成离线可用的 SVG 头像（首字母），避免依赖外部图片
  function avatarURI(name) {
    const ch = (name || "?").slice(0, 1);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1e3a8a'/><stop offset='1' stop-color='#0ea5e9'/></linearGradient></defs><rect width='80' height='80' rx='40' fill='url(#g)'/><text x='40' y='42' font-size='34' fill='#fff' text-anchor='middle' dominant-baseline='central' font-family='sans-serif'>${ch}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  const appLink = (id) => "#/app/" + id;

  function emptyState(ico, text) {
    return `<div class="empty"><div class="em-ico">${ico}</div><div class="em-text">${text}</div></div>`;
  }

  /* ---------------- 注册 ---------------- */
  function setCatalog(c) {
    catalog = c || {};
    // 将目录中的每一项登记进 APP（链接型应用仅有元数据，无 render → 统一占位页）
    Object.keys(catalog).forEach((id) => {
      if (!APP[id]) { const def = Object.assign({ id }, catalog[id]); apps.push(def); APP[id] = def; }
      else Object.assign(APP[id], catalog[id]);
    });
  }

  function registerApp(def) {
    if (!def || !def.id) { console.warn("[Portal] registerApp 缺少 id", def); return; }
    if (APP[def.id]) Object.assign(APP[def.id], def);     // 已有元数据（来自目录）→ 合并 render/卡片
    else { apps.push(def); APP[def.id] = def; }
    (def.cards || []).forEach(registerCard);
    return def;
  }

  function registerCard(def) {
    if (!def || !def.id) return;
    if (!cards.find((c) => c.id === def.id)) cards.push(def);
    return def;
  }

  function registerData(key, val) { data[key] = val; return val; }

  /* ---------------- 派生集合 ---------------- */
  const PAGE_APPS = () => apps.filter((a) => a.kind === "page");
  const DOCK_APPS = () => apps.filter((a) => a.dock);
  const STAR_APPS = () => apps.filter((a) => a.starred);

  /* ---------------- 路由 ---------------- */
  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (!parts.length) return { id: "workbench", param: null };
    if (parts[0] === "search") return { id: "search", param: null };
    if (parts[0] !== "app") return { id: "workbench", param: null };
    return { id: parts[1] || "workbench", param: parts[2] || null };
  }

  function placeholder(app) {
    const a = app || {};
    return `
      <div class="card card-pad" style="text-align:center;padding:48px 20px">
        <div style="width:72px;height:72px;border-radius:20px;background:${a.color || "#64748b"};display:grid;place-items:center;font-size:34px;margin:0 auto 16px">${a.icon || "🧩"}</div>
        <h2 style="font-size:20px;margin-bottom:6px">${esc(a.name || "应用")}</h2>
        <p style="color:var(--text-2);margin-bottom:18px">${esc(a.desc || "")}</p>
        <span class="tag tag-blue">业务系统</span>
        <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" data-act="toast" data-id="正在打开「${esc(a.name || "应用")}」">进入应用</button>
          <a class="btn btn-ghost" href="${appLink("apps")}">返回应用中心</a>
        </div>
      </div>`;
  }

  function renderRoute() {
    const { id, param } = parseRoute();
    const app = APP[id];
    state.activeId = id;
    setActiveNav(id);
    let html;
    if (id === "search") html = (APP.search && APP.search.render) ? APP.search.render() : emptyState("🔍", "无搜索结果");
    else if (!app) html = emptyState("🧩", "未找到该应用");
    else if (app.kind === "link" || !app.render) html = placeholder(app);
    else html = app.render(param);
    $("#content").innerHTML = `<div class="content-inner">${html}</div>`;
    // 聊天详情页自身高度已避开底部导航，收起内容区为普通页面预留的底部内边距，避免整页出现微量滚动
    $("#content").classList.toggle("chat-mode", id === "message" && !!param);
    window.scrollTo(0, 0);
    if (app && app.mounted) app.mounted(param);
    updateBadges();
  }

  function router() { closeDrawer(); closeSheet(); renderRoute(); }

  /* ---------------- 导航 / 角标 ---------------- */
  function renderNav() {
    $("#nav").innerHTML = `
      <div class="nav-group">应用</div>
      ${PAGE_APPS().map((a) => `
        <a class="nav-item" data-nav="${a.id}" href="${appLink(a.id)}">
          <span class="ni-ico">${a.icon}</span><span>${a.name}</span>
          ${a.badge ? `<span class="ni-badge" id="navBadge-${a.badge}" style="display:none">0</span>` : ""}
        </a>`).join("")}`;

    $("#bottomNav").innerHTML = DOCK_APPS().map((a) => `
      <a class="bn-item" data-nav="${a.id}" href="${appLink(a.id)}">
        <span class="bn-ico">${a.icon}</span><span>${a.name}</span>
        ${a.badge ? `<span class="bn-badge" id="bnBadge-${a.badge}" style="display:none">0</span>` : ""}
      </a>`).join("");
  }

  function updateBadges() {
    const t = (APP.todo && APP.todo.badgeCount) ? APP.todo.badgeCount() : 0;
    const m = (APP.message && APP.message.badgeCount) ? APP.message.badgeCount() : 0;
    const tb = $("#todoBadge"), mb = $("#msgBadge");
    if (tb) { tb.textContent = t; tb.style.display = t ? "grid" : "none"; }
    if (mb) { mb.textContent = m; mb.style.display = m ? "grid" : "none"; }
    ["navBadge-todo", "bnBadge-todo"].forEach((id) => { const e = $("#" + id); if (e) { e.textContent = t; e.style.display = t ? "grid" : "none"; } });
    ["navBadge-msg", "bnBadge-msg"].forEach((id) => { const e = $("#" + id); if (e) { e.textContent = m; e.style.display = m ? "grid" : "none"; } });
  }

  function setActiveNav(key) {
    $$("[data-nav]").forEach((e) => e.classList.toggle("active", e.getAttribute("data-nav") === key));
  }

  /* ---------------- 抽屉 / 快捷面板 ---------------- */
  function openDrawer() { $("#sidebar").classList.add("open"); $("#scrim").classList.add("show"); document.body.classList.add("drawer-open"); }
  function closeDrawer() { $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("show"); document.body.classList.remove("drawer-open"); }

  function renderSheetBody() {
    const body = $("#sheetBody");
    if (state.sheetMode === "todo") {
      const html = (APP.todo && APP.todo.sheetHTML) ? APP.todo.sheetHTML() : "";
      body.innerHTML = html || emptyState("✅", "暂无待办");
    } else {
      const html = (APP.message && APP.message.sheetHTML) ? APP.message.sheetHTML() : "";
      body.innerHTML = html || emptyState("🔔", "暂无消息");
    }
  }

  function openSheet(mode) {
    state.sheetMode = mode;
    $("#sheetTitle").textContent = mode === "todo" ? "待办" : "消息";
    renderSheetBody();
    $("#sheet").classList.add("show"); $("#scrim").classList.add("show");
  }
  function closeSheet() { $("#sheet").classList.remove("show"); if (!$("#sidebar").classList.contains("open")) $("#scrim").classList.remove("show"); }

  /* ---------------- 事件 ---------------- */
  function bindEvents() {
    $("#menuBtn").addEventListener("click", openDrawer);
    $("#closeDrawer").addEventListener("click", closeDrawer);
    $("#scrim").addEventListener("click", () => { closeDrawer(); closeSheet(); });
    $("#sheetClose").addEventListener("click", closeSheet);
    $("#todoBtn").addEventListener("click", () => openSheet("todo"));
    $("#msgBtn").addEventListener("click", () => openSheet("message"));
    $("#avatarBtn").addEventListener("click", () => { location.hash = appLink("profile"); });

    // 全局搜索
    const search = $("#globalSearch");
    search.addEventListener("input", (e) => { state.search = e.target.value; if (location.hash === "#/search" || e.target.value) location.hash = "#/search"; });
    document.addEventListener("keydown", (e) => { if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); } });

    // 内容区事件委托（派发到当前应用）
    $("#content").addEventListener("click", (e) => handleClick(e));
    // 快捷面板：点击按面板归属（todo/message 应用）派发，避免在非对应页面打开面板时失效
    $("#sheetBody").addEventListener("click", (e) => handleClick(e, state.sheetMode === "message" ? APP.message : APP.todo));

    // 聊天输入框：回车发送（交由消息应用处理）
    $("#content").addEventListener("keydown", (e) => {
      if (e.target.id === "chatInput" && e.key === "Enter") { e.preventDefault(); if (APP.message && APP.message.send) APP.message.send(); }
    });
  }

  // 事件委托：先派发给目标应用 onAction，未消费的核心行为（toast/toggle）兜底
  function handleClick(e, appOverride) {
    const actEl = e.target.closest("[data-act]");
    if (!actEl) return;
    const act = actEl.getAttribute("data-act");
    const id = actEl.getAttribute("data-id");
    const app = appOverride || APP[state.activeId];
    if (app && app.onAction) app.onAction(act, id, e);
    if (act === "toast") toast(id);
    else if (act === "toggle") actEl.classList.toggle("on");
  }

  // 数据变更后刷新：若快捷面板已打开则保留打开状态并就地刷新
  function refresh() {
    updateBadges();
    renderRoute();
    if ($("#sheet").classList.contains("show")) renderSheetBody();
  }

  /* ---------------- 启动 ---------------- */
  function start() {
    const u = data.user || {};
    const av = $("#avatarImg"); if (av) av.src = avatarURI(u.name || "?");
    renderNav();
    bindEvents();
    updateBadges();
    window.addEventListener("hashchange", router);
    if (!location.hash) location.hash = appLink("workbench");
    else router();
  }
  if (document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start);

  return {
    registerApp, registerCard, registerData, setCatalog, closeSheet,
    $, $$, esc, toast, avatarURI, appLink, refresh, emptyState,
    get state() { return state; },
    get apps() { return apps; },
    get cards() { return cards; },
    get APP() { return APP; },
    get catalog() { return catalog; },
    get data() { return data; },
  };
})();
