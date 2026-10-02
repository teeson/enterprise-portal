/* ============================================================
   统一待办 · 应用模块
   页面 + 完成处理 + 来源图标 + 已完成印戳 + 4 卡可点筛选
   导出卡片：待办速览（供工作台使用）
   ============================================================ */
(function () {
  if (!window.Portal) return;
  const P = Portal;
  const { esc, appLink, emptyState } = P;

  // 可变状态（待办可交互）
  let todos = (P.data.todos || []).map((t) => ({ ...t }));

  const todoApp = (t) => P.APP[t.appId] || { icon: "📋", color: "#64748b", name: "待办" };
  const pendingTodos = () => todos.filter((t) => t.status === "pending");
  const overdueTodos = () => todos.filter((t) => t.due.includes("逾期"));
  const unreadCount = () => todos.filter((t) => t.status === "pending").length; // 与 badge 一致

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

  function render() {
    const counts = {
      pending: pendingTodos().length,
      done: todos.filter((t) => t.status === "done").length,
      all: todos.length,
      overdue: overdueTodos().length,
    };
    const cards = [
      { key: "pending", label: "待处理", color: "var(--danger)", val: counts.pending },
      { key: "done", label: "已处理", color: "var(--success)", val: counts.done },
      { key: "all", label: "总计", color: "var(--text-1)", val: counts.all },
      { key: "overdue", label: "已逾期", color: "var(--warning)", val: counts.overdue },
    ];
    const srcs = ["all", ...new Set(todos.map((t) => t.source))];

    let list = todos;
    if (P.state.todoTab === "pending") list = list.filter((t) => t.status === "pending");
    else if (P.state.todoTab === "done") list = list.filter((t) => t.status === "done");
    else if (P.state.todoTab === "overdue") list = list.filter((t) => t.due.includes("逾期"));
    if (P.state.todoFilter !== "all") list = list.filter((t) => t.source === P.state.todoFilter);

    return `
      <div class="app-head">
        <h2>✅ 待办</h2><span class="app-desc">跨系统待办统一处理</span>
        <span class="app-crumb">应用 · 门户平台</span>
      </div>
      <div class="todo-stats">
        ${cards.map((c) => `
          <div class="todo-stat ${P.state.todoTab === c.key && c.key !== "all" ? "active" : ""}" data-act="todo-card" data-id="${c.key}" style="cursor:pointer">
            <div class="ts-val" style="color:${c.color}">${c.val}</div>
            <div class="ts-label">${c.label}</div>
          </div>`).join("")}
      </div>
      <div class="filter-bar">
        ${srcs.map((s) => `<button class="chip ${P.state.todoFilter === s ? "active" : ""}" data-act="todo-filter" data-id="${s}">${s === "all" ? "全部来源" : s}</button>`).join("")}
      </div>
      <div class="card card-pad">
        ${list.length ? `<div class="list">${list.map(todoRow).join("")}</div>` : emptyState("✅", "该分类下暂无待办")}
      </div>`;
  }

  function onAction(act, id, e) {
    if (act === "done-todo") {
      e.stopPropagation();
      const t = todos.find((x) => x.id === id);
      if (t) { t.status = "done"; t.due = "已完成"; P.toast("已标记为完成 ✓"); P.refresh(); }
    } else if (act === "open-todo") {
      P.closeSheet();
      const app = P.APP[id];
      location.hash = appLink(app ? id : "todo");
    } else if (act === "todo-card") {
      P.state.todoTab = (P.state.todoTab === id ? "all" : id);
      P.refresh();
    } else if (act === "todo-filter") {
      P.state.todoFilter = id;
      P.refresh();
    }
  }

  function badgeCount() { return pendingTodos().length; }
  function sheetHTML() {
    const list = pendingTodos().slice(0, 8);
    return list.length ? `<div class="list">${list.map(todoRow).join("")}</div>` : "";
  }

  // 导出卡片：待办速览（供工作台编排）
  const cards = [{
    id: "todo-preview", appId: "todo", title: "待办速览", icon: "✅",
    render() {
      const p = pendingTodos().slice(0, 4);
      return `
        <div style="display:flex;justify-content:flex-end;margin-bottom:8px"><a class="more" href="${appLink("todo")}">更多 ›</a></div>
        ${p.length ? `<div class="list">${p.map(todoRow).join("")}</div>` : emptyState("✅", "暂无待办")}`;
    },
  }];

  P.registerApp({ id: "todo", render, onAction, badgeCount, sheetHTML, cards, row: todoRow });
})();
