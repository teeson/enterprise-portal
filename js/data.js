/* ============================================================
   智汇门户 · 数据层（Mock）
   架构原则：「应用」是一等公民
   - 所有页面功能均在应用注册表 apps 中定义
   - 工作台、新闻通知、统一待办、统一消息等内建页面同样注册为应用
   - 侧栏/底部导航/常用应用/应用中心 均由 apps 派生
   ============================================================ */
window.PortalData = (function () {

  /* ---------------- 应用注册表（一等公民） ----------------
     kind: page = 门户内建页面（可路由）；link = 外部业务系统（占位）
     dock: 是否出现在移动端底部导航；starred: 是否为常用应用
     badge: 角标来源（todo/msg）
  -------------------------------------------------------- */
  const apps = [
    // ===== 门户平台：内建页面应用 =====
    { id: "workbench", name: "工作台",   icon: "🏠", color: "#1d4ed8", cat: "门户平台", desc: "指标总览 · 待办消息 · 日程", kind: "page", dock: true },
    { id: "news",      name: "新闻通知", icon: "📰", color: "#2563eb", cat: "门户平台", desc: "公司新闻 · 通知公告 · 行业动态", kind: "page", dock: true },
    { id: "apps",      name: "应用中心", icon: "🧩", color: "#7c3aed", cat: "门户平台", desc: "全部应用分类目录", kind: "page", dock: true },
    { id: "todo",      name: "待办", icon: "✅", color: "#16a34a", cat: "门户平台", desc: "跨系统待办统一处理", kind: "page", dock: true, badge: "todo" },
    { id: "message",   name: "消息", icon: "💬", color: "#f59e0b", cat: "门户平台", desc: "应用 · 私聊 · 群聊", kind: "page", dock: true, badge: "msg" },
    { id: "docs",      name: "知识文库", icon: "📚", color: "#ea580c", cat: "门户平台", desc: "制度模板 · SOP · 知识沉淀", kind: "page" },
    { id: "profile",   name: "个人中心", icon: "👤", color: "#0ea5e9", cat: "门户平台", desc: "个人资料 · 偏好设置", kind: "page", dock: true },

    // ===== 协同办公 =====
    { id: "approval",  name: "OA审批",   icon: "📝", color: "#1d4ed8", cat: "协同办公", desc: "流程审批中心", kind: "link", starred: true },
    { id: "mail",      name: "企业邮箱", icon: "📧", color: "#f59e0b", cat: "协同办公", desc: "邮件收发与归档", kind: "link", starred: true },
    { id: "im",        name: "即时通讯", icon: "💬", color: "#0ea5e9", cat: "协同办公", desc: "团队沟通协作", kind: "link", starred: true },
    { id: "meeting",   name: "日程会议", icon: "📅", color: "#7c3aed", cat: "协同办公", desc: "会议预定与管理", kind: "link" },
    { id: "cloud",     name: "云文档",   icon: "📄", color: "#0891b2", cat: "协同办公", desc: "在线协作文档", kind: "link" },
    { id: "sign",      name: "电子签章", icon: "✍️", color: "#db2777", cat: "协同办公", desc: "合同电子签署", kind: "link" },

    // ===== 人事行政 =====
    { id: "attendance", name: "考勤打卡", icon: "🕒", color: "#16a34a", cat: "人事行政", desc: "出勤与排班管理", kind: "link", starred: true },
    { id: "contacts",   name: "通讯录",   icon: "👥", color: "#dc2626", cat: "人事行政", desc: "组织架构与同事", kind: "link", starred: true },
    { id: "leave",      name: "请假出差", icon: "🏖️", color: "#65a30d", cat: "人事行政", desc: "假勤申请与审批", kind: "link" },
    { id: "salary",     name: "薪酬福利", icon: "💰", color: "#ca8a04", cat: "人事行政", desc: "工资单与福利查询", kind: "link" },
    { id: "recruit",    name: "招聘管理", icon: "🧑‍💼", color: "#ea580c", cat: "人事行政", desc: "招聘流程跟踪", kind: "link" },
    { id: "training",   name: "培训学习", icon: "🎓", color: "#2563eb", cat: "人事行政", desc: "课程学习与考试", kind: "link" },

    // ===== 财务资产 =====
    { id: "expense",  name: "费用报销", icon: "💳", color: "#16a34a", cat: "财务资产", desc: "报销单填报与跟踪", kind: "link", starred: true },
    { id: "budget",   name: "预算管理", icon: "📊", color: "#0891b2", cat: "财务资产", desc: "预算编制与执行", kind: "link" },
    { id: "asset",    name: "资产管理", icon: "🏢", color: "#7c3aed", cat: "财务资产", desc: "资产台账与盘点", kind: "link" },
    { id: "contract", name: "合同管理", icon: "📜", color: "#db2777", cat: "财务资产", desc: "合同台账与到期提醒", kind: "link" },

    // ===== 业务系统 =====
    { id: "crm",     name: "CRM客户",   icon: "🤝", color: "#2563eb", cat: "业务系统", desc: "客户与商机管理", kind: "link", starred: true },
    { id: "project", name: "项目看板", icon: "📋", color: "#0ea5e9", cat: "业务系统", desc: "项目进度跟踪", kind: "link", starred: true },
    { id: "bi",      name: "BI报表",    icon: "📈", color: "#7c3aed", cat: "业务系统", desc: "经营分析看板", kind: "link", starred: true },
    { id: "scm",     name: "供应链管理", icon: "🔗", color: "#65a30d", cat: "业务系统", desc: "采购与物流协同", kind: "link" },
    { id: "itsm",    name: "IT服务台",  icon: "🛠️", color: "#64748b", cat: "业务系统", desc: "报障与服务请求", kind: "link" },
  ];

  // 应用分类（展示顺序）
  const appCats = ["门户平台", "协同办公", "人事行政", "财务资产", "业务系统"];

  /* ---------------- 用户资料 ---------------- */
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

  /* ---------------- 我的数据指标（展示于工作台） ----------------
     dyn: 动态值来源 todo(待办数) / msg(未读消息数)
  ------------------------------------------------------------- */
  const myStats = [
    { label: "待办事项", icon: "📋", color: "#1d4ed8", bg: "#eff4ff", unit: "项", dyn: "todo" },
    { label: "未读消息", icon: "🔔", color: "#0ea5e9", bg: "#e6f7fe", unit: "条", dyn: "msg" },
    { label: "本季审批", icon: "✍️", color: "#7c3aed", bg: "#f1e9fe", unit: "笔", value: 38, trend: "+12%", up: true },
    { label: "项目进度", icon: "📈", color: "#16a34a", bg: "#e7f6ec", unit: "%", value: 76, trend: "+5%", up: true },
    { label: "本年打卡", icon: "🕒", color: "#f59e0b", bg: "#fef3e2", unit: "天", value: 186 },
    { label: "参与项目", icon: "📁", color: "#0891b2", bg: "#e6f7fe", unit: "个", value: 12 },
  ];

  /* ---------------- 日程提醒（展示于工作台） ---------------- */
  const schedules = [
    { title: "部门周会", time: "明天 09:30", place: "会议室 3F-02", icon: "📅", color: "#f59e0b" },
    { title: "示例项目评审", time: "10-02 14:00", place: "线上会议", icon: "📝", color: "#7c3aed" },
    { title: "季度经营分析会", time: "10-05 10:00", place: "总部多功能厅", icon: "📊", color: "#1d4ed8" },
  ];

  /* ---------------- 图表数据 ---------------- */
  const chart = {
    week: {
      days: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      todo: [6, 9, 4, 11, 8, 2, 1],
      done: [5, 7, 4, 9, 7, 2, 1],
    },
  };

  /* ---------------- 新闻通知 ---------------- */
  const news = [
    { id: 1, cat: "通知公告", icon: "📢", img: "assets/news/news1.png", title: "关于2026年国庆中秋假期安排及值班工作的通知", source: "行政管理部", date: "2026-09-29", views: 1284, hot: true,
      summary: "根据国务院办公厅放假安排，结合公司实际，现将2026年国庆、中秋双节假期及值班工作有关事项通知如下……",
      body: [
        "各部门、各子公司：\n根据国务院办公厅关于2026年部分节假日安排的通知，结合公司生产经营实际，现将国庆、中秋双节假期安排及值班工作有关事项通知如下。",
        "一、放假时间：10月1日（周四）至10月8日（周四）放假调休，共8天。9月27日（周日）、10月10日（周六）正常上班。",
        "二、值班要求：各部门须安排专人值班，遇重大突发事件须第一时间上报带班领导，确保信息畅通、响应及时。",
        "三、安全管理：放假前请做好办公区域断电、锁门、防火防盗等安全检查，离岗前关闭非必要设备。",
        "四、请各部门于9月30日17:00前将值班表报送行政管理部备案。",
      ] },
    { id: 2, cat: "公司新闻", icon: "🏢", img: "assets/news/news2.png", title: "示例集团成功中标某核心商务区综合开发项目", source: "战略投资部", date: "2026-09-26", views: 962, hot: true,
      summary: "公司联合体以综合评分第一中标某核心商务区重点地块，总投资额约48亿元，打造产城融合新标杆。",
      body: [
        "9月26日，某核心商务区管委会公布土地出让结果，由我司牵头、联合两家头部产业运营商组成的联合体，以综合评分第一成功竞得该重点地块。",
        "该项目占地面积约6.2万平方米，规划总建筑面积约38万平方米，总投资额约48亿元，定位为集总部办公、产业孵化、国际交流于一体的产城融合综合体。",
        "项目预计2027年一季度开工，2029年投入运营，建成后将成为公司在区域市场的标杆性资产，进一步夯实区域布局。",
      ] },
    { id: 3, cat: "公司新闻", icon: "🏆", img: "assets/news/news3.png", title: "公司荣获“2026年度中国产业园区运营标杆企业”称号", source: "品牌公关部", date: "2026-09-22", views: 731, hot: false,
      summary: "在2026中国产业地产论坛暨年度评选中，公司凭借出色的园区运营能力与招商成效获此殊荣。",
      body: [
        "近日，在2026中国产业地产论坛暨年度评选颁奖典礼上，公司凭借在产业园区运营、产业服务生态构建方面的突出表现，荣获“2026年度中国产业园区运营标杆企业”称号。",
        "评委会认为，公司在轻重资产结合、数字化运营、产业生态赋能等维度形成了可复制的标杆模式。",
      ] },
    { id: 4, cat: "行业动态", icon: "🌐", img: "assets/news/news4.png", title: "《某重点区域发展规划纲要》新一轮配套政策解读", source: "战略研究部", date: "2026-09-18", views: 540, hot: false,
      summary: "近期多部门联合发布该区域跨境要素流动便利化新政，对投资、人才、资金往来将产生深远影响。",
      body: [
        "近期，国家有关部委联合发布该重点区域跨境要素流动便利化系列新政，涵盖人员往来、资金融通、数据流动等多个领域。",
        "本文从投资视角解读新政对公司跨境投融资业务、境外资产管理的具体影响，并给出三条行动建议。",
      ] },
    { id: 5, cat: "通知公告", icon: "🔧", img: "assets/news/news5.png", title: "关于OA系统升级及国庆期间停机维护的通知", source: "信息技术部", date: "2026-09-15", views: 488, hot: false,
      summary: "为提升系统性能，IT部将于9月30日22:00至10月1日02:00对OA及审批系统进行升级维护，期间相关功能暂停使用。",
      body: [
        "为提升OA及统一审批平台的稳定性与性能，信息技术部将于2026年9月30日22:00至10月1日02:00进行系统升级维护。",
        "维护期间，审批提交、消息推送等功能将短暂不可用，请提前安排相关业务处理。给您带来不便敬请谅解。",
      ] },
    { id: 6, cat: "公司新闻", icon: "🤝", img: "assets/news/news6.png", title: "公司与某头部新能源企业签署战略合作协议", source: "战略投资部", date: "2026-09-10", views: 612, hot: false,
      summary: "双方将在园区绿电供应、储能示范、零碳运营等方面展开深度合作，共建绿色产业生态。",
      body: [
        "9月10日，公司与某头部新能源企业签署战略合作协议。双方将围绕园区绿电直供、分布式储能示范、零碳园区运营等方向展开全面合作。",
        "此次合作是公司践行绿色低碳战略的重要落子，预计可显著降低园区运营碳排放强度。",
      ] },
  ];

  /* ---------------- 统一待办 ---------------- */
  const todos = [
    { id: "T001", appId: "approval", title: "审批：示例项目合资协议用印申请", source: "OA审批", priority: "高", due: "今天 18:00", status: "pending", owner: "李伟" },
    { id: "T002", appId: "bi", title: "复核：三季度经营分析报告（财务合并口径）", source: "财务管理", priority: "高", due: "明天 12:00", status: "pending", owner: "王芳" },
    { id: "T003", appId: "project", title: "确认：总部展厅装修方案第三版", source: "运营管理", priority: "中", due: "10-03 前", status: "pending", owner: "张磊" },
    { id: "T004", appId: "attendance", title: "阅知：国庆假期值班安排通知", source: "行政管理", priority: "中", due: "09-30 前", status: "pending", owner: "行政管理部" },
    { id: "T005", appId: "recruit", title: "填写：Q3个人绩效考核自评", source: "人力行政", priority: "低", due: "10-08 前", status: "pending", owner: "张明" },
    { id: "T006", appId: "scm", title: "转交：供应商入库资质审查", source: "采购管理", priority: "中", due: "09-28 已逾期", status: "pending", owner: "刘强" },
    { id: "T007", appId: "expense", title: "审批：差旅费报销单 #BX20260921", source: "财务管理", priority: "低", due: "已完成", status: "done", owner: "张明" },
    { id: "T008", appId: "meeting", title: "处理：会议室预定冲突协调", source: "运营管理", priority: "中", due: "已完成", status: "done", owner: "张磊" },
    { id: "T009", appId: "recruit", title: "审批：实习生转正申请（2人）", source: "人力行政", priority: "中", due: "已完成", status: "done", owner: "王芳" },
  ];

  /* ---------------- 消息（会话模型，微信式） ----------------
     kind: app=应用消息（标题带"应用"标签） / private=私人消息 / group=群聊消息
     unread: 未读条数；msgs: 气泡对话，me=true 表示本人发出（右侧） */
  // ts：距当前的时间（分钟，数值越小越新），用于按最新消息时间倒序排列（不再分区，仅以类型标签区分）
  const conversations = [
    { id: "c_approval", kind: "app", name: "审批中心", icon: "✍️", color: "#1d4ed8", time: "10分钟前", ts: 10, unread: 2, last: "《示例项目合资协议用印申请》待您审批",
      msgs: [
        { me: false, text: "李伟 提交了《示例项目合资协议用印申请》，金额 ¥0（用印类），请您审批。", time: "10:02" },
        { me: true, text: "好的，我看一下，今天内处理。", time: "10:05" },
        { me: false, text: "提醒：该申请将于今天 18:00 超时，请尽快审批，谢谢～", time: "10:08" },
      ] },
    { id: "c_proj", kind: "group", name: "示例项目群", icon: "👥", color: "#ea580c", time: "18分钟前", ts: 18, unread: 3, last: "王芳：明天上午 10 点项目例会",
      msgs: [
        { me: false, text: "李伟：示例项目合资协议今天要定稿，大家把意见汇总给我。", time: "17:30" },
        { me: false, text: "王芳：好的，我这边法律风险点已标注在文档第 3 页。", time: "17:42" },
        { me: false, text: "王芳：另外提醒，明天上午 10 点项目例会，会议室 A302。", time: "17:43" },
        { me: true, text: "收到，我整理待办清单同步到群里。", time: "17:50" },
      ] },
    { id: "c_crm", kind: "app", name: "CRM 客户", icon: "🤝", color: "#2563eb", time: "32分钟前", ts: 32, unread: 1, last: "今日新增意向客户 3 家",
      msgs: [
        { me: false, text: "今日招商线索池新增 3 条高意向客户，分布在 A 区、B 区片区。", time: "09:40" },
        { me: false, text: "其中 1 家为战略客户，建议优先跟进，已为您标记。", time: "09:41" },
      ] },
    { id: "c_system", kind: "app", name: "系统通知", icon: "🔧", color: "#64748b", time: "1小时前", ts: 60, unread: 0, last: "OA 系统将于今晚 22:00 维护",
      msgs: [
        { me: false, text: "OA 系统将于 9 月 30 日 22:00 进行例行维护，期间审批功能暂停约 30 分钟。", time: "08:30" },
        { me: false, text: "请提前安排相关审批，给您带来不便敬请谅解。", time: "08:30" },
      ] },
    { id: "c_zhang", kind: "private", name: "张磊", icon: "💬", color: "#0ea5e9", time: "2小时前", ts: 120, unread: 1, last: "总部展厅方案第三版发你邮箱了",
      msgs: [
        { me: false, text: "张明，总部展厅方案第三版发你邮箱了，方便时看下～", time: "13:20" },
        { me: true, text: "收到，我下午仔细过一遍，有问题同步你。", time: "13:35" },
        { me: false, text: "好的，主要是动线和中庭灯光，这块我们再对一下。", time: "13:36" },
      ] },
    { id: "c_dept", kind: "group", name: "部门通知群", icon: "🏢", color: "#0891b2", time: "昨天 18:00", ts: 840, unread: 0, last: "行政：国庆假期值班表已发布",
      msgs: [
        { me: false, text: "行政：国庆假期值班表已发布，请各位查收并确认。", time: "昨天 18:00" },
        { me: false, text: "行政：值班期间保持手机畅通，遇紧急情况联系带班领导。", time: "昨天 18:01" },
      ] },
    { id: "c_wang", kind: "private", name: "王芳", icon: "👩", color: "#7c3aed", time: "昨天 17:20", ts: 880, unread: 0, last: "Q3 经营分析报告已提交复核",
      msgs: [
        { me: false, text: "《Q3 经营分析报告（合并口径）》已提交，麻烦您复核确认。", time: "昨天 17:20" },
        { me: true, text: "辛苦了，我明天上午看。", time: "昨天 19:02" },
      ] },
    { id: "c_liu", kind: "private", name: "刘强", icon: "🧑", color: "#db2777", time: "昨天 15:10", ts: 1020, unread: 2, last: "供应商入库资质审查资料已发",
      msgs: [
        { me: false, text: "供应商入库资质审查资料已发你，请查收并转交采购部。", time: "昨天 15:10" },
        { me: false, text: "这批有三家，其中一家需要补充安全生产许可证。", time: "昨天 15:11" },
      ] },
    { id: "c_bi", kind: "app", name: "BI 报表", icon: "📈", color: "#16a34a", time: "昨天 09:00", ts: 1380, unread: 0, last: "《区域在管资产月度看板》已生成",
      msgs: [
        { me: false, text: "《区域在管资产月度看板》2026 年 9 月版已就绪，可在报表中心查看。", time: "昨天 09:00" },
        { me: true, text: "收到，我同步给投资部同事。", time: "昨天 09:12" },
      ] },
  ];

  /* ---------------- 设置 ---------------- */
  const settings = [
    { icon: "🔔", title: "消息推送", desc: "待办与审批实时推送至门户", on: true },
    { icon: "🌙", title: "深色模式", desc: "跟随系统或手动开启", on: false },
    { icon: "🔐", title: "账号与安全", desc: "登录设备、密码修改", on: null },
    { icon: "🌐", title: "语言", desc: "简体中文", on: null },
    { icon: "❓", title: "帮助与反馈", desc: "使用指引、问题反馈", on: null },
    { icon: "🚪", title: "退出登录", desc: "", on: null, danger: true },
  ];

  return { apps, appCats, user, myStats, schedules, chart, news, todos, conversations, settings };
})();
