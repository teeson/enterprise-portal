/* ============================================================
   智汇门户 · 核心运行时 · 平台数据
   平台级数据：应用目录（导航/应用中心元数据）、用户、设置、分类
   说明：应用目录是「应用为一等公民」的单一事实来源；
        页面型应用随后在各自目录中 registerApp 增补 render / 卡片；
        链接型应用无门户内代码，走统一占位页。
   ============================================================ */
(function () {
  if (!window.Portal) { console.error("[platform-data] Portal 运行时未加载"); return; }

  /* ---------------- 应用目录（元数据，单一事实来源） ----------------
     kind: page = 门户内建页面（可路由）；link = 外部业务系统（占位）
     dock: 是否出现在移动端底部导航；starred: 是否为常用应用
     badge: 角标来源（todo/msg）
  -------------------------------------------------------- */
  const catalog = {
    // ===== 门户平台：内建页面应用 =====
    workbench: { id: "workbench", name: "工作台",   icon: "🏠", color: "#1d4ed8", cat: "门户平台", desc: "指标总览 · 待办消息 · 日程", kind: "page", dock: true },
    news:      { id: "news",      name: "新闻通知", icon: "📰", color: "#2563eb", cat: "门户平台", desc: "公司新闻 · 通知公告 · 行业动态", kind: "page", dock: true },
    apps:      { id: "apps",      name: "应用中心", icon: "🧩", color: "#7c3aed", cat: "门户平台", desc: "全部应用分类目录", kind: "page", dock: true },
    todo:      { id: "todo",      name: "待办", icon: "✅", color: "#16a34a", cat: "门户平台", desc: "跨系统待办统一处理", kind: "page", dock: true, badge: "todo" },
    message:   { id: "message",   name: "消息", icon: "💬", color: "#f59e0b", cat: "门户平台", desc: "应用 · 私聊 · 群聊", kind: "page", dock: true, badge: "msg" },
    docs:      { id: "docs",      name: "知识文库", icon: "📚", color: "#ea580c", cat: "门户平台", desc: "制度模板 · SOP · 知识沉淀", kind: "page" },
    profile:   { id: "profile",   name: "个人中心", icon: "👤", color: "#0ea5e9", cat: "门户平台", desc: "个人资料 · 偏好设置", kind: "page", dock: true },
    search:    { id: "search",    name: "搜索", icon: "🔍", color: "#64748b", cat: "门户平台", desc: "全局搜索", kind: "page" },

    // ===== 协同办公 =====
    approval:  { id: "approval",  name: "OA审批",   icon: "📝", color: "#1d4ed8", cat: "协同办公", desc: "流程审批中心", kind: "link", starred: true },
    mail:      { id: "mail",      name: "企业邮箱", icon: "📧", color: "#f59e0b", cat: "协同办公", desc: "邮件收发与归档", kind: "link", starred: true },
    im:        { id: "im",        name: "即时通讯", icon: "💬", color: "#0ea5e9", cat: "协同办公", desc: "团队沟通协作", kind: "link", starred: true },
    meeting:   { id: "meeting",   name: "日程会议", icon: "📅", color: "#7c3aed", cat: "协同办公", desc: "会议预定与管理", kind: "link" },
    cloud:     { id: "cloud",     name: "云文档", icon: "📄", color: "#0891b2", cat: "协同办公", desc: "在线协作文档", kind: "link" },
    sign:      { id: "sign",      name: "电子签章", icon: "✍️", color: "#db2777", cat: "协同办公", desc: "合同电子签署", kind: "link" },

    // ===== 人事行政 =====
    attendance: { id: "attendance", name: "考勤打卡", icon: "🕒", color: "#16a34a", cat: "人事行政", desc: "出勤与排班管理", kind: "link", starred: true },
    contacts:   { id: "contacts",   name: "通讯录", icon: "👥", color: "#dc2626", cat: "人事行政", desc: "组织架构与同事", kind: "link", starred: true },
    leave:      { id: "leave",      name: "请假出差", icon: "🏖️", color: "#65a30d", cat: "人事行政", desc: "假勤申请与审批", kind: "link" },
    salary:     { id: "salary",     name: "薪酬福利", icon: "💰", color: "#ca8a04", cat: "人事行政", desc: "工资单与福利查询", kind: "link" },
    recruit:    { id: "recruit",    name: "招聘管理", icon: "🧑‍💼", color: "#ea580c", cat: "人事行政", desc: "招聘流程跟踪", kind: "link" },
    training:   { id: "training",   name: "培训学习", icon: "🎓", color: "#2563eb", cat: "人事行政", desc: "课程学习与考试", kind: "link" },

    // ===== 财务资产 =====
    expense:  { id: "expense",  name: "费用报销", icon: "💳", color: "#16a34a", cat: "财务资产", desc: "报销单填报与跟踪", kind: "link", starred: true },
    budget:   { id: "budget",   name: "预算管理", icon: "📊", color: "#0891b2", cat: "财务资产", desc: "预算编制与执行", kind: "link" },
    asset:    { id: "asset",    name: "资产管理", icon: "🏢", color: "#7c3aed", cat: "财务资产", desc: "资产台账与盘点", kind: "link" },
    contract: { id: "contract", name: "合同管理", icon: "📜", color: "#db2777", cat: "财务资产", desc: "合同台账与到期提醒", kind: "link" },

    // ===== 业务系统 =====
    crm:     { id: "crm",     name: "CRM客户",   icon: "🤝", color: "#2563eb", cat: "业务系统", desc: "客户与商机管理", kind: "link", starred: true },
    project: { id: "project", name: "项目看板", icon: "📋", color: "#0ea5e9", cat: "业务系统", desc: "项目进度跟踪", kind: "link", starred: true },
    bi:      { id: "bi",      name: "BI报表",    icon: "📈", color: "#7c3aed", cat: "业务系统", desc: "经营分析看板", kind: "link", starred: true },
    scm:     { id: "scm",     name: "供应链管理", icon: "🔗", color: "#65a30d", cat: "业务系统", desc: "采购与物流协同", kind: "link" },
    itsm:    { id: "itsm",    name: "IT服务台",  icon: "🛠️", color: "#64748b", cat: "业务系统", desc: "报障与服务请求", kind: "link" },
  };

  const appCats = ["门户平台", "协同办公", "人事行政", "财务资产", "业务系统"];

  // 用户资料
  const user = {
    name: "张明",
    avatar: "https://i.pravatar.cc/160?img=47",
    title: "高级经理",
    dept: "战略投资部",
    company: "示例集团",
    employeeId: "EMP-00862",
    email: "zhangming@example.com",
    phone: "138****6620",
    joinDate: "2019-07-01",
    location: "总部 A 座 12F",
    manager: "李伟",
  };

  // 设置
  const settings = [
    { icon: "🔔", title: "消息推送", desc: "待办与审批实时推送至门户", on: true },
    { icon: "🌙", title: "深色模式", desc: "跟随系统或手动开启", on: false },
    { icon: "🔐", title: "账号与安全", desc: "登录设备、密码修改", on: null },
    { icon: "🌐", title: "语言", desc: "简体中文", on: null },
    { icon: "❓", title: "帮助与反馈", desc: "使用指引、问题反馈", on: null },
    { icon: "🚪", title: "退出登录", desc: "", on: null, danger: true },
  ];

  Portal.setCatalog(catalog);
  Portal.registerData("user", user);
  Portal.registerData("settings", settings);
  Portal.registerData("appCats", appCats);
})();
