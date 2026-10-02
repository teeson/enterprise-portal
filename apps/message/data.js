/* ============================================================
   统一消息 · 应用自有数据（微信式会话模型）
   ============================================================ */
(function () {
  if (!window.Portal) return;

  // kind: app=应用消息 / private=私人消息 / group=群聊消息
  // ts：距当前时间（分钟，越小越新），按最新消息时间倒序排列（不分区，仅以类型标签区分）
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

  Portal.registerData("conversations", conversations);
})();
