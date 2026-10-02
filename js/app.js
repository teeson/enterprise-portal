/* ============================================================
   智汇门户 · 应用核心
   架构：「应用」为一等公民，路由 = #/app/{应用ID}
   侧栏 / 底部导航 / 常用应用 / 应用中心 均由应用注册表派生
   ============================================================ */
(function () {
  const D = window.PortalData;

  // 生成离线可用的 SVG 头像（首字母），避免依赖外部图片
  function avatarURI(name) {
    const ch = (name || "?").slice(0, 1);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1e3a8a'/><stop offset='1' stop-color='#0ea5e9'/></linearGradient></defs><rect width='80' height='80' rx='40' fill='url(#g)'/><text x='40' y='42' font-size='34' fill='#fff' text-anchor='middle' dominant-baseline='central' font-family='sans-serif'>${ch}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  const AVATAR = avatarURI(D.user.name);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // 应用索引 & 派生集合
  const APP = D.apps.reduce((m, a) => ((m[a.id] = a), m), {});
  const PAGE_APPS = D.apps.filter((a) => a.kind === "page");   // 侧栏：内建页面应用
  const DOCK_APPS = D.apps.filter((a) => a.dock);              // 移动端底部导航
  const STAR_APPS = D.apps.filter((a) => a.starred);           // 工作台常用应用

  // 可变状态（待办 / 消息可交互）
  const state = {
    todos: D.todos.map((t) => ({ ...t })),
    conversations: D.conversations.map((c) => ({ ...c, msgs: c.msgs.map((m) => ({ ...m })) })),
    search: "",
    todoTab: "all",
    todoFilter: "all",
    sheetMode: null,
    activeConv: null,
  };

  const pendingTodos = () => state.todos.filter((t) => t.status === "pending");
  const unreadCount = () => state.conversations.reduce((n, c) => n + (c.unread || 0), 0);
  const unreadConvs = () => state.conversations.filter((c) => c.unread > 0);
  const findConv = (id) => state.conversations.find((c) => c.id === id);

  /* ---------------- 工具 ---------------- */
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 1800);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  const appLink = (id) => "#/app/" + id;

  /* ---------------- 导航渲染（由应用注册表派生） ---------------- */
  function renderNav() {
    $("#nav").innerHTML = `
      <div class="nav-group">应用</div>
      ${PAGE_APPS.map((a) => `
        <a class="nav-item" data-nav="${a.id}" href="${appLink(a.id)}">
          <span class="ni-ico">${a.icon}</span><span>${a.name}</span>
          ${a.badge ? `<span class="ni-badge" id="navBadge-${a.badge}" style="display:none">0</span>` : ""}
        </a>`).join("")}`;

    $("#bottomNav").innerHTML = DOCK_APPS.map((a) => `
      <a class="bn-item" data-nav="${a.id}" href="${appLink(a.id)}">
        <span class="bn-ico">${a.icon}</span><span>${a.name}</span>
        ${a.badge ? `<span class="bn-badge" id="bnBadge-${a.badge}" style="display:none">0</span>` : ""}
      </a>`).join("");
  }

  function updateBadges() {
    const t = pendingTodos().length, m = unreadCount();
    const tb = $("#todoBadge"), mb = $("#msgBadge");
    tb.textContent = t; tb.style.display = t ? "grid" : "none";
    mb.textContent = m; mb.style.display = m ? "grid" : "none";
    ["navBadge-todo", "bnBadge-todo"].forEach((id) => { const e = $("#" + id); if (e) { e.textContent = t; e.style.display = t ? "grid" : "none"; } });
    ["navBadge-msg", "bnBadge-msg"].forEach((id) => { const e = $("#" + id); if (e) { e.textContent = m; e.style.display = m ? "grid" : "none"; } });
  }

  function setActiveNav(key) {
    $$("[data-nav]").forEach((e) => e.classList.toggle("active", e.getAttribute("data-nav") === key));
  }

  /* ---------------- 路由 ---------------- */
  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (!parts.length) return { id: "workbench", param: null };
    if (parts[0] === "search") return { id: "search", param: null };
    if (parts[0] !== "app") return { id: "workbench", param: null };
    return { id: parts[1] || "workbench", param: parts[2] || null };
  }

  // 纯渲染（不含面板开合）
  function renderRoute() {
    const { id, param } = parseRoute();
    setActiveNav(id);
    let html;
    if (id === "search") html = pageSearch();
    else if (!APP[id]) html = emptyState("🧩", "未找到该应用");
    else switch (id) {
      case "workbench": html = pageWorkbench(); break;
      case "news": html = param ? pageNewsDetail(param) : pageNews(); break;
      case "todo": html = pageTodo(); break;
      case "message": html = param ? pageMessageDetail(param) : pageMessage(); break;
      case "docs": html = pageDocs(); break;
      case "apps": html = pageApps(); break;
      case "profile": html = pageProfile(); break;
      default: html = pageAppPlaceholder(APP[id]);
    }
    $("#content").innerHTML = `<div class="content-inner">${html}</div>`;
    // 聊天详情页自身高度已避开底部导航，收起内容区为普通页面预留的底部内边距，避免整页出现微量滚动
    $("#content").classList.toggle("chat-mode", id === "message" && !!param);
    window.scrollTo(0, 0);
    if (id === "workbench") initCharts();
  }

  // 路由变更：必须一并关闭抽屉与快捷面板，避免面板遮挡底部导航导致点击失效
  function router() {
    closeDrawer();
    closeSheet();
    renderRoute();
  }

  /* ---------------- 工作台（也是一个应用） ---------------- */
  function statValue(s) {
    if (s.dyn === "todo") return pendingTodos().length;
    if (s.dyn === "msg") return unreadCount();
    return s.value;
  }

  function pageWorkbench() {
    const u = D.user;
    const hour = new Date().getHours();
    const greet = hour < 11 ? "早上好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好";
    const pTodos = pendingTodos().slice(0, 4);
    const pMsgs = sortedConvs().slice(0, 4);

    return `
      <section class="hero">
        <h1>${greet}，${u.name} 👋</h1>
        <p>${u.company} · ${u.dept} · ${u.title} · 今天有 ${pendingTodos().length} 项待办待处理</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${appLink("todo")}">查看待办 (${pendingTodos().length})</a>
          <a class="btn btn-ghost" href="${appLink("apps")}">打开应用中心</a>
        </div>
      </section>

      <div class="app-head">
        <h2>🏠 工作台</h2><span class="app-desc">数据与日程总览，待办消息一站处理</span>
      </div>

      <section class="section">
        <div class="grid stat-cards">
          ${D.myStats.map((s) => `
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

      <div class="grid home-grid">
        <section class="section">
          <div class="card card-pad">
            <div class="section-head">
              <h2>📊 工作概览</h2>
              <span class="sub">近 7 日待办与完成趋势</span>
              <span class="more">完成率 ${(function () { const w = D.chart.week; const d = w.done.reduce((a, b) => a + b, 0), t = w.todo.reduce((a, b) => a + b, 0); return Math.round(d / t * 100); })()}%</span>
            </div>
            <div id="chartWeek" style="height:240px"></div>
          </div>
          <div class="card card-pad" style="margin-top:16px">
            <div class="section-head"><h2>⭐ 常用应用</h2><a class="more" href="${appLink("apps")}">全部 ›</a></div>
            <div class="quick-apps">
              ${STAR_APPS.map((a) => `
                <a class="quick-app" ${a.kind === "page" ? `href="${appLink(a.id)}"` : `data-act="toast" data-id="正在打开「${a.name}」" style="cursor:pointer"`}>
                  <div class="qa-ico" style="background:${a.color}">${a.icon}</div><div class="qa-name">${a.name}</div>
                </a>`).join("")}
            </div>
          </div>
        </section>

        <section class="section">
          <div class="card card-pad" style="margin-bottom:16px">
            <div class="section-head"><h2>🗓️ 日程提醒</h2><a class="more" href="${appLink("todo")}">查看待办 ›</a></div>
            ${D.schedules.length ? `<div class="list">${D.schedules.map((s) => `
              <div class="list-row">
                <div class="lr-ico" style="background:${s.color}">${s.icon}</div>
                <div class="lr-main">
                  <div class="lr-title">${esc(s.title)}</div>
                  <div class="lr-meta"><span>🕒 ${esc(s.time)}</span><span>📍 ${esc(s.place)}</span></div>
                </div>
              </div>`).join("")}</div>` : emptyState("🗓️", "近期暂无日程")}
          </div>
          <div class="card card-pad" style="margin-bottom:16px">
            <div class="section-head"><h2>✅ 待办速览</h2><a class="more" href="${appLink("todo")}">更多 ›</a></div>
            ${pTodos.length ? `<div class="list">${pTodos.map(todoRow).join("")}</div>` : emptyState("✅", "暂无待办")}
          </div>
          <div class="card card-pad">
            <div class="section-head"><h2>🔔 最新消息</h2><a class="more" href="${appLink("message")}">更多 ›</a></div>
            ${pMsgs.length ? `<div class="list">${pMsgs.map(convRow).join("")}</div>` : emptyState("🔔", "暂无新消息")}
          </div>
        </section>
      </div>`;
  }

  /* ---------------- 应用占位（外部业务系统） ---------------- */
  function pageAppPlaceholder(app) {
    return `
      <div class="card card-pad" style="text-align:center;padding:48px 20px">
        <div style="width:72px;height:72px;border-radius:20px;background:${app.color};display:grid;place-items:center;font-size:34px;margin:0 auto 16px">${app.icon}</div>
        <h2 style="font-size:20px;margin-bottom:6px">${esc(app.name)}</h2>
        <p style="color:var(--text-2);margin-bottom:18px">${esc(app.desc || "")}</p>
        <span class="tag tag-blue">业务系统</span>
        <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" data-act="toast" data-id="正在打开「${app.name}」">进入应用</button>
          <a class="btn btn-ghost" href="${appLink("apps")}">返回应用中心</a>
        </div>
      </div>`;
  }

  /* ---------------- 统一待办 ---------------- */
  // 待办来源应用（图标/名称取自应用注册表）
  function todoApp(t) { return APP[t.appId] || { icon: "📋", color: "#64748b", name: "待办" }; }

  function todoRow(t) {
    const pc = { "高": "tag-red", "中": "tag-amber", "低": "tag-gray" }[t.priority] || "tag-gray";
    const overdue = t.due.includes("逾期");
    const app = todoApp(t);
    return `
      <div class="list-row" data-act="open-todo" data-id="${t.appId}" style="cursor:pointer">
        <div class="lr-ico" style="background:${app.color}">${app.icon}</div>
        <div class="lr-main">
          <div class="lr-title">${esc(t.title)}</div>
          <div class="lr-desc">来源：${esc(app.name)} · 发起人：${esc(t.owner)}</div>
          <div class="lr-meta">
            <span class="tag ${pc}">${t.priority}优先级</span>
            <span style="color:${overdue ? "var(--danger)" : "var(--text-3)"}">⏰ ${esc(t.due)}</span>
          </div>
        </div>
        ${t.status === "pending"
          ? `<div class="lr-actions"><button class="btn btn-primary btn-sm" data-act="done-todo" data-id="${t.id}">完成</button></div>`
          : `<div class="lr-actions"><span class="todo-stamp">已完成</span></div>`}
      </div>`;
  }

  function pageTodo() {
    const srcs = ["all", ...new Set(state.todos.map((t) => t.source))];
    const counts = {
      pending: pendingTodos().length,
      done: state.todos.filter((t) => t.status === "done").length,
      all: state.todos.length,
      overdue: state.todos.filter((t) => t.due.includes("逾期")).length,
    };
    const cards = [
      { key: "pending", label: "待处理", color: "var(--danger)", val: counts.pending },
      { key: "done", label: "已处理", color: "var(--success)", val: counts.done },
      { key: "all", label: "总计", color: "var(--text-1)", val: counts.all },
      { key: "overdue", label: "已逾期", color: "var(--warning)", val: counts.overdue },
    ];
    let list = state.todos;
    if (state.todoTab === "pending") list = list.filter((t) => t.status === "pending");
    else if (state.todoTab === "done") list = list.filter((t) => t.status === "done");
    else if (state.todoTab === "overdue") list = list.filter((t) => t.due.includes("逾期"));
    if (state.todoFilter !== "all") list = list.filter((t) => t.source === state.todoFilter);

    return `
      ${appHeader("todo")}
      <div class="todo-stats">
        ${cards.map((c) => `
          <div class="todo-stat ${state.todoTab === c.key && c.key !== "all" ? "active" : ""}" data-act="todo-card" data-id="${c.key}" style="cursor:pointer">
            <div class="ts-val" style="color:${c.color}">${c.val}</div>
            <div class="ts-label">${c.label}</div>
          </div>`).join("")}
      </div>
      <div class="filter-bar">
        ${srcs.map((s) => `<button class="chip ${state.todoFilter === s ? "active" : ""}" data-act="todo-filter" data-id="${s}">${s === "all" ? "全部来源" : s}</button>`).join("")}
      </div>
      <div class="card card-pad">
        ${list.length ? `<div class="list">${list.map(todoRow).join("")}</div>` : emptyState("✅", "该分类下暂无待办")}
      </div>`;
  }

  /* ---------------- 消息（微信式会话列表 + 对话详情） ---------------- */
  // 会话列表行：左图标，右两行（上一行标题+类型标签+时间，下一行预览），右上角未读红点
  // 不再按应用/私聊/群聊分区分组，仅用类型标签区分；列表整体按最新消息时间倒序排列
  function convRow(c) {
    const tag = { app: "应用", private: "私聊", group: "群聊" }[c.kind] || "";
    return `
      <div class="conv-row" data-act="open-conv" data-id="${c.id}" style="cursor:pointer">
        <div class="conv-avatar" style="background:${c.color}">${c.icon}${c.unread ? `<span class="conv-badge">${c.unread}</span>` : ""}</div>
        <div class="conv-main">
          <div class="conv-top">
            <span class="conv-name">${esc(c.name)}</span><span class="conv-tag">${tag}</span>
            <span class="conv-time">${esc(c.time)}</span>
          </div>
          <div class="conv-preview">${esc(c.last)}</div>
        </div>
      </div>`;
  }

  // 按最新消息时间倒序（ts 越小越新）
  const sortedConvs = () => state.conversations.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));

  function pageMessage() {
    const list = sortedConvs();
    return `
      ${appHeader("message")}
      ${list.length ? `<div class="list">${list.map(convRow).join("")}</div>` : emptyState("💬", "暂无消息")}
      ${unreadCount() ? `<div class="conv-foot"><button class="btn btn-ghost btn-sm" data-act="mark-all-read">全部标为已读</button></div>` : ""}`;
  }

  function bubbleRow(m, c) {
    return `
      <div class="bubble-row ${m.me ? "me" : "them"}">
        ${!m.me ? `<div class="bub-avatar" style="background:${c.color}">${c.icon}</div>` : ""}
        <div class="bubble">${esc(m.text)}</div>
        ${m.me ? `<div class="bub-avatar me" style="background:var(--primary)">${D.user.name.slice(0, 1)}</div>` : ""}
      </div>`;
  }

  function pageMessageDetail(id) {
    const c = findConv(id);
    if (!c) return emptyState("💬", "会话不存在");
    state.activeConv = id;
    const bubbles = c.msgs.map((m) => bubbleRow(m, c)).join("");
    const subLabel = { app: "应用", private: "私聊", group: "群聊" }[c.kind] || "";
    return `
      <div class="chat-page" data-conv="${c.id}">
        <div class="chat-head">
          <a class="chat-back" href="${appLink("message")}">‹</a>
          <div class="chat-title">${esc(c.name)}<span class="chat-sub">${subLabel}</span></div>
          <span style="width:32px"></span>
        </div>
        <div class="chat-body">${bubbles}</div>
        <div class="chat-input">
          <input id="chatInput" type="text" placeholder="发送消息…" autocomplete="off" />
          <button class="btn btn-primary btn-sm" data-act="send-msg">发送</button>
        </div>
      </div>`;
  }

  // 当前时间（HH:MM），用于气泡与“刚刚”时间戳
  function nowHM() { return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }); }

  // 渲染当前会话气泡并滚动到底部
  function renderChatBody(c) {
    const page = $(".chat-page");
    if (!page || page.getAttribute("data-conv") !== c.id) return;
    const body = $(".chat-body", page);
    if (!body) return;
    body.innerHTML = c.msgs.map((m) => bubbleRow(m, c)).join("");
    body.scrollTop = body.scrollHeight;
  }

  // 发送消息：追加到对话、更新预览与排序位置（置顶）、清空输入框
  function sendMessage() {
    const page = $(".chat-page");
    if (!page) return;
    const c = findConv(page.getAttribute("data-conv"));
    const input = $("#chatInput", page);
    if (!c || !input) return;
    const text = input.value.trim();
    if (!text) return;
    c.msgs.push({ me: true, text, time: nowHM() });
    c.last = text; c.time = "刚刚"; c.ts = 0; c.unread = 0;
    input.value = "";
    renderChatBody(c);
    updateBadges();
    scheduleReply(c);
  }

  // 轻量自动回复，让对话可双向（演示用；离开会话则不再推送）
  function scheduleReply(c) {
    setTimeout(() => {
      if (state.activeConv !== c.id) return;
      const pool = {
        app: ["【系统已收到】您的消息已记录，相关同事会尽快为您处理。", "已为您转交负责同事，请稍候。"],
        private: ["收到～我看看。", "好的，没问题。", "稍后回复你。", "明白了，谢谢！"],
        group: ["收到。", "+1", "好的，我来跟进。", "同意，按计划推进。"],
      };
      const arr = pool[c.kind] || ["收到。"];
      const text = arr[Math.floor(Math.random() * arr.length)];
      c.msgs.push({ me: false, text, time: nowHM() });
      c.last = text; c.time = "刚刚"; c.ts = 0;
      renderChatBody(c);
    }, 900);
  }

  /* ---------------- 新闻通知（也是一个应用） ---------------- */
  function pageNews() {
    const cats = ["全部", ...new Set(D.news.map((n) => n.cat))];
    return `
      ${appHeader("news")}
      <div class="filter-bar" id="newsCats">
        ${cats.map((c, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-act="news-cat" data-id="${esc(c)}">${esc(c)}</button>`).join("")}
      </div>
      <div class="news-layout">
        <div>
          ${D.news.map((n) => `
            <a class="news-card" href="${appLink("news")}/${n.id}">
              <img class="news-thumb" src="${n.img}" alt="${esc(n.title)}" loading="lazy" />
              <div style="flex:1;min-width:0">
                <div class="nc-title">${n.hot ? "🔥 " : ""}${esc(n.title)}</div>
                <div class="nc-desc">${esc(n.summary)}</div>
                <div class="nc-meta"><span class="tag tag-blue">${esc(n.cat)}</span><span>🏢 ${esc(n.source)}</span><span>📅 ${n.date}</span><span>👁 ${n.views}</span></div>
              </div>
            </a>`).join("")}
        </div>
        <aside>
          <div class="card card-pad" style="margin-bottom:16px">
            <div class="section-head"><h2>📌 热点公告</h2></div>
            ${D.news.filter((n) => n.hot).map((n) => `<a href="${appLink("news")}/${n.id}" style="display:block;padding:10px 0;border-bottom:1px solid var(--border);font-weight:600;font-size:13.5px">· ${esc(n.title)}</a>`).join("")}
          </div>
          <div class="card card-pad">
            <div class="section-head"><h2>🗂️ 栏目分布</h2></div>
            ${cats.slice(1).map((c) => {
              const cnt = D.news.filter((n) => n.cat === c).length;
              const meta = { "通知公告": ["📢", "#1d4ed8"], "公司新闻": ["🏢", "#16a34a"], "行业动态": ["🌐", "#f59e0b"] }[c] || ["📄", "#64748b"];
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

  function pageNewsDetail(id) {
    const n = D.news.find((x) => x.id == id);
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

  /* ---------------- 知识文库 ---------------- */
  function pageDocs() {
    const docs = [
      { t: "2026 新员工入职指南", c: "人力行政", icon: "📘" },
      { t: "示例项目投决报告模板", c: "战略投资", icon: "📗" },
      { t: "财务报销制度 V3.2", c: "财务管理", icon: "📙" },
      { t: "信息安全与合规手册", c: "风控合规", icon: "📕" },
      { t: "园区运营 SOP 合集", c: "运营管理", icon: "📔" },
      { t: "品牌视觉规范 VI", c: "品牌公关", icon: "📒" },
    ];
    return `
      ${appHeader("docs")}
      <div class="grid cols-3">
        ${docs.map((d) => `<a class="card card-pad" data-act="toast" data-id="正在打开文档「${d.t}」" style="display:flex;gap:14px;align-items:center;cursor:pointer">
          <div style="width:46px;height:46px;border-radius:12px;background:var(--primary-50);display:grid;place-items:center;font-size:22px;flex:none">${d.icon}</div>
          <div style="min-width:0"><div style="font-weight:700">${d.t}</div><div style="color:var(--text-3);font-size:12px;margin-top:2px">${d.c}</div></div>
        </a>`).join("")}
      </div>`;
  }

  /* ---------------- 应用中心 ---------------- */
  function pageApps() {
    return `
      ${appHeader("apps")}
      ${D.appCats.map((cat) => {
        const list = D.apps.filter((a) => a.cat === cat);
        if (!list.length) return "";
        return `
        <div class="app-cat">
          <div class="section-head"><h2 style="font-size:15px">${esc(cat)}</h2><span class="sub">${list.length} 个应用</span></div>
          <div class="app-grid">
            ${list.map((a) => {
              const inner = `
                <div class="qa-ico" style="background:${a.color}">${a.icon}</div>
                <div class="qa-name">${a.name}</div>`;
              return a.kind === "page"
                ? `<a class="quick-app" href="${appLink(a.id)}">${inner}</a>`
                : `<div class="quick-app" data-act="toast" data-id="正在打开「${a.name}」" style="cursor:pointer">${inner}</div>`;
            }).join("")}
          </div>
        </div>`;
      }).join("")}`;
  }

  /* ---------------- 个人中心 ---------------- */
  function pageProfile() {
    const u = D.user;
    const fields = [
      ["工号", u.employeeId], ["入职日期", u.joinDate],
      ["办公地点", u.location], ["直属上级", u.manager],
      ["企业邮箱", u.email], ["手机号码", u.phone],
    ];
    return `
      ${appHeader("profile")}
      <div class="card">
        <div class="profile-head">
          <img src="${AVATAR}" alt="头像" />
          <div style="flex:1;min-width:0">
            <div class="ph-name">${u.name} <span class="tag tag-purple" style="vertical-align:middle">${u.title}</span></div>
            <div class="ph-role">${u.company} · ${u.dept}</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="toast" data-id="编辑资料功能开发中">编辑资料</button>
        </div>
        <div class="profile-grid">
          ${fields.map(([k, v]) => `
            <div class="pf-item"><span class="pf-label">${k}</span><span class="pf-val">${esc(v)}</span></div>`).join("")}
        </div>
      </div>

      <div class="card card-pad" style="margin-top:16px">
        <div class="section-head"><h2>⚙️ 偏好设置</h2></div>
        ${D.settings.map((s) => `
          <div class="setting-row">
            <div class="sr-ico">${s.icon}</div>
            <div class="sr-main"><div class="sr-title" style="${s.danger ? "color:var(--danger)" : ""}">${s.title}</div>${s.desc ? `<div class="sr-desc">${s.desc}</div>` : ""}</div>
            ${s.on === null ? `<span style="color:var(--text-3);font-size:18px">›</span>` : `<div class="switch ${s.on ? "on" : ""}" data-act="toggle"></div>`}
          </div>`).join("")}
      </div>`;
  }

  // 应用页统一定位头（体现"应用是一等公民"）
  function appHeader(id) {
    const a = APP[id];
    if (!a) return "";
    return `
      <div class="app-head">
        <h2>${a.icon} ${a.name}</h2><span class="app-desc">${esc(a.desc || "")}</span>
        <span class="app-crumb">应用 · ${esc(a.cat)}</span>
      </div>`;
  }

  /* ---------------- 搜索 ---------------- */
  function pageSearch() {
    const q = state.search.trim().toLowerCase();
    const appHits = D.apps.filter((a) => (a.name + a.desc).toLowerCase().includes(q));
    if (!q) return emptyState("🔍", "输入关键词搜索应用、资讯、待办");
    const news = D.news.filter((n) => (n.title + n.summary + n.cat).toLowerCase().includes(q));
    const todos = state.todos.filter((t) => t.title.toLowerCase().includes(q));
    return `
      <div class="app-head"><h2>🔍 搜索结果</h2><span class="app-desc">“${esc(state.search)}”</span></div>
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
        ${todos.length ? todos.map(todoRow).join("") : emptyState("", "无匹配待办")}
      </div>`;
  }

  function emptyState(ico, text) {
    return `<div class="empty"><div class="em-ico">${ico}</div><div class="em-text">${text}</div></div>`;
  }

  /* ---------------- 图表（纯 SVG，离线可用） ---------------- */
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
    if (el) el.innerHTML = barChartSVG(D.chart.week);
  }

  /* ---------------- 抽屉 / 面板 ---------------- */
  function openDrawer() { $("#sidebar").classList.add("open"); $("#scrim").classList.add("show"); document.body.classList.add("drawer-open"); }
  function closeDrawer() { $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("show"); document.body.classList.remove("drawer-open"); }

  // 面板内容渲染（可复用：打开时 / 在面板内操作后就地刷新）
  function renderSheetBody() {
    const body = $("#sheetBody");
    if (state.sheetMode === "todo") {
      const list = pendingTodos().slice(0, 8);
      body.innerHTML = list.length ? list.map(todoRow).join("") : emptyState("✅", "暂无待办");
    } else {
      const base = unreadConvs().length ? unreadConvs() : state.conversations;
      const list = sortedConvs().filter((c) => base.includes(c)).slice(0, 12);
      body.innerHTML = list.length ? list.map(convRow).join("") : emptyState("🔔", "暂无消息");
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
    $("#avatarBtn").addEventListener("click", () => location.hash = appLink("profile"));

    // 全局搜索
    const search = $("#globalSearch");
    search.addEventListener("input", (e) => { state.search = e.target.value; if (location.hash === "#/search" || e.target.value) location.hash = "#/search"; });
    document.addEventListener("keydown", (e) => { if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); } });

    // 内容区事件委托
    $("#content").addEventListener("click", onContentClick);
    $("#sheetBody").addEventListener("click", onContentClick);

    // 聊天输入框：回车发送
    $("#content").addEventListener("keydown", (e) => {
      if (e.target.id === "chatInput" && e.key === "Enter") { e.preventDefault(); sendMessage(); }
    });
  }

  function onContentClick(e) {
    const actEl = e.target.closest("[data-act]");
    if (actEl) {
      const act = actEl.getAttribute("data-act");
      const id = actEl.getAttribute("data-id");
      switch (act) {
        case "done-todo": {
          e.stopPropagation();
          const t = state.todos.find((x) => x.id === id);
          if (t) { t.status = "done"; t.due = "已完成"; toast("已标记为完成 ✓"); refresh(); }
          break;
        }
        // 跳转到待办对应的来源应用页面进行处理（若 hash 未变则不触发 router，故显式关闭面板）
        case "open-todo": { closeSheet(); const app = APP[id]; location.hash = appLink(app ? id : "todo"); break; }
        // 打开会话：自动标记已读（去掉“标为已读”按钮），跳转至对话详情
        case "open-conv": {
          e.stopPropagation();
          const c = state.conversations.find((x) => x.id === id);
          if (c && c.unread) { c.unread = 0; updateBadges(); }
          closeSheet();
          location.hash = appLink("message") + "/" + id;
          break;
        }
        case "todo-tab": state.todoTab = id; router(); break;
        case "todo-card": state.todoTab = (state.todoTab === id ? "all" : id); router(); break;
        case "todo-filter": state.todoFilter = id; router(); break;
        case "mark-all-read": state.conversations.forEach((c) => (c.unread = 0)); toast("全部已读 ✓"); refresh(); break;
        case "send-msg": e.stopPropagation(); sendMessage(); break;
        case "news-cat": {
          const cat = id;
          $$("#newsCats .chip").forEach((c) => c.classList.toggle("active", c.getAttribute("data-id") === cat));
          const filtered = cat === "全部" ? D.news : D.news.filter((n) => n.cat === cat);
          const wrap = $(".news-layout > div");
          if (wrap) wrap.innerHTML = filtered.map((n) => `
            <a class="news-card" href="${appLink("news")}/${n.id}"><img class="news-thumb" src="${n.img}" alt="${esc(n.title)}" loading="lazy" />
            <div style="flex:1;min-width:0"><div class="nc-title">${n.hot ? "🔥 " : ""}${esc(n.title)}</div>
            <div class="nc-desc">${esc(n.summary)}</div>
            <div class="nc-meta"><span class="tag tag-blue">${esc(n.cat)}</span><span>🏢 ${esc(n.source)}</span><span>📅 ${n.date}</span></div></div></a>`).join("");
          break;
        }
        case "toggle": actEl.classList.toggle("on"); break;
        case "toast": toast(id); break;
      }
    }
  }

  // 数据变更后刷新：若快捷面板已打开则保留打开状态并就地刷新，避免突兀关闭
  function refresh() {
    updateBadges();
    renderRoute();
    if ($("#sheet").classList.contains("show")) renderSheetBody();
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    $("#avatarImg").src = AVATAR;
    renderNav();
    bindEvents();
    updateBadges();
    window.addEventListener("hashchange", router);
    if (!location.hash) location.hash = appLink("workbench");
    else router();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
