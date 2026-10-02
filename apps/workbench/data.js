/* ============================================================
   工作台 · 应用自有数据
   说明：应用在自己的目录中组织源码与资源数据，注册到 Portal.data
   ============================================================ */
(function () {
  if (!window.Portal) return;

  // 我的数据指标（展示于工作台）
  const myStats = [
    { label: "待办事项", icon: "📋", color: "#1d4ed8", bg: "#eff4ff", unit: "项", dyn: "todo" },
    { label: "未读消息", icon: "🔔", color: "#0ea5e9", bg: "#e6f7fe", unit: "条", dyn: "msg" },
    { label: "本季审批", icon: "✍️", color: "#7c3aed", bg: "#f1e9fe", unit: "笔", value: 38, trend: "+12%", up: true },
    { label: "项目进度", icon: "📈", color: "#16a34a", bg: "#e7f6ec", unit: "%", value: 76, trend: "+5%", up: true },
    { label: "本年打卡", icon: "🕒", color: "#f59e0b", bg: "#fef3e2", unit: "天", value: 186 },
    { label: "参与项目", icon: "📁", color: "#0891b2", bg: "#e6f7fe", unit: "个", value: 12 },
  ];

  // 日程提醒
  const schedules = [
    { title: "部门周会", time: "明天 09:30", place: "会议室 3F-02", icon: "📅", color: "#f59e0b" },
    { title: "示例项目评审", time: "10-02 14:00", place: "线上会议", icon: "📝", color: "#7c3aed" },
    { title: "季度经营分析会", time: "10-05 10:00", place: "总部多功能厅", icon: "📊", color: "#1d4ed8" },
  ];

  // 图表数据
  const chart = {
    week: {
      days: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      todo: [6, 9, 4, 11, 8, 2, 1],
      done: [5, 7, 4, 9, 7, 2, 1],
    },
  };

  Portal.registerData("workbench", { myStats, schedules, chart });
})();
