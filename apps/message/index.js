/* ============================================================
   统一消息 · 应用模块
   会话列表（扁平倒序 + 类型标签）+ 对话详情（气泡，本人右对齐）+ 发送 + 自动回复
   导出卡片：最新消息（供工作台使用）
   ============================================================ */
(function () {
  if (!window.Portal) return;
  const P = Portal;
  const { $, esc, appLink, emptyState } = P;

  // 可变状态（消息可交互）
  let conversations = (P.data.conversations || []).map((c) => ({ ...c, msgs: c.msgs.map((m) => ({ ...m })) }));

  const findConv = (id) => conversations.find((c) => c.id === id);
  const unreadCount = () => conversations.reduce((n, c) => n + (c.unread || 0), 0);
  // 按最新消息时间倒序（ts 越小越新）
  const sortedConvs = () => conversations.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));

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

  function bubbleRow(m, c) {
    return `
      <div class="bubble-row ${m.me ? "me" : "them"}">
        ${!m.me ? `<div class="bub-avatar" style="background:${c.color}">${c.icon}</div>` : ""}
        <div class="bubble">${esc(m.text)}</div>
        ${m.me ? `<div class="bub-avatar me" style="background:var(--primary)">${esc((P.data.user ? P.data.user.name : "我").slice(0, 1))}</div>` : ""}
      </div>`;
  }

  function nowHM() { return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }); }

  function renderChatBody(c) {
    const page = $(".chat-page");
    if (!page || page.getAttribute("data-conv") !== c.id) return;
    const body = $(".chat-body", page);
    if (!body) return;
    body.innerHTML = c.msgs.map((m) => bubbleRow(m, c)).join("");
    body.scrollTop = body.scrollHeight;
  }

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
    P.refresh();          // 更新角标
    scheduleReply(c);
  }

  function scheduleReply(c) {
    setTimeout(() => {
      if (P.state.activeConv !== c.id) return;
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

  function render(param) {
    if (param) return detail(param);
    const list = sortedConvs();
    return `
      <div class="app-head">
        <h2>💬 消息</h2><span class="app-desc">应用 · 私聊 · 群聊</span>
        <span class="app-crumb">应用 · 门户平台</span>
      </div>
      ${list.length ? `<div class="list">${list.map(convRow).join("")}</div>` : emptyState("💬", "暂无消息")}
      ${unreadCount() ? `<div class="conv-foot"><button class="btn btn-ghost btn-sm" data-act="mark-all-read">全部标为已读</button></div>` : ""}`;
  }

  function detail(id) {
    const c = findConv(id);
    if (!c) return emptyState("💬", "会话不存在");
    P.state.activeConv = id;
    const subLabel = { app: "应用", private: "私聊", group: "群聊" }[c.kind] || "";
    return `
      <div class="chat-page" data-conv="${c.id}">
        <div class="chat-head">
          <a class="chat-back" href="${appLink("message")}">‹</a>
          <div class="chat-title">${esc(c.name)}<span class="chat-sub">${subLabel}</span></div>
          <span style="width:32px"></span>
        </div>
        <div class="chat-body">${c.msgs.map((m) => bubbleRow(m, c)).join("")}</div>
        <div class="chat-input">
          <input id="chatInput" type="text" placeholder="发送消息…" autocomplete="off" />
          <button class="btn btn-primary btn-sm" data-act="send-msg">发送</button>
        </div>
      </div>`;
  }

  function onAction(act, id, e) {
    if (act === "open-conv") {
      e.stopPropagation();
      const c = findConv(id);
      if (c && c.unread) c.unread = 0;
      P.closeSheet();
      location.hash = appLink("message") + "/" + id;
    } else if (act === "send-msg") {
      e.stopPropagation();
      sendMessage();
    } else if (act === "mark-all-read") {
      conversations.forEach((c) => (c.unread = 0));
      P.toast("全部已读 ✓");
      P.refresh();
    }
  }

  function badgeCount() { return unreadCount(); }
  function sheetHTML() {
    const base = conversations.some((c) => c.unread) ? conversations.filter((c) => c.unread) : conversations;
    const list = sortedConvs().filter((c) => base.includes(c)).slice(0, 12);
    return list.length ? `<div class="list">${list.map(convRow).join("")}</div>` : "";
  }

  // 导出卡片：最新消息（供工作台编排）
  const cards = [{
    id: "msg-preview", appId: "message", title: "最新消息", icon: "🔔",
    render() {
      const p = sortedConvs().slice(0, 4);
      return `
        <div style="display:flex;justify-content:flex-end;margin-bottom:8px"><a class="more" href="${appLink("message")}">更多 ›</a></div>
        ${p.length ? `<div class="list">${p.map(convRow).join("")}</div>` : emptyState("🔔", "暂无新消息")}`;
    },
  }];

  P.registerApp({ id: "message", render, onAction, badgeCount, sheetHTML, cards, send: sendMessage });
})();
