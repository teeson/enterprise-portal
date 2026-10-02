/* ============================================================
   统一待办 · 应用自有数据
   ============================================================ */
(function () {
  if (!window.Portal) return;

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

  Portal.registerData("todos", todos);
})();
