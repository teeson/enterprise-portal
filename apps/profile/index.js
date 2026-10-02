/* ============================================================
   个人中心 · 应用模块（读取用户与设置）
   ============================================================ */
(function () {
  if (!window.Portal) return;
  const P = Portal;
  const { esc, avatarURI, emptyState } = P;

  function render() {
    const u = P.data.user || {};
    const fields = [
      ["工号", u.employeeId], ["入职日期", u.joinDate],
      ["办公地点", u.location], ["直属上级", u.manager],
      ["企业邮箱", u.email], ["手机号码", u.phone],
    ];
    const settings = P.data.settings || [];
    return `
      <div class="app-head">
        <h2>👤 个人中心</h2><span class="app-desc">个人资料 · 偏好设置</span>
        <span class="app-crumb">应用 · 门户平台</span>
      </div>
      <div class="card">
        <div class="profile-head">
          <img src="${avatarURI(u.name)}" alt="头像" />
          <div style="flex:1;min-width:0">
            <div class="ph-name">${esc(u.name)} <span class="tag tag-purple" style="vertical-align:middle">${esc(u.title)}</span></div>
            <div class="ph-role">${esc(u.company)} · ${esc(u.dept)}</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="toast" data-id="编辑资料功能开发中">编辑资料</button>
        </div>
        <div class="profile-grid">
          ${fields.map(([k, v]) => `<div class="pf-item"><span class="pf-label">${k}</span><span class="pf-val">${esc(v)}</span></div>`).join("")}
        </div>
      </div>

      <div class="card card-pad" style="margin-top:16px">
        <div class="section-head"><h2>⚙️ 偏好设置</h2></div>
        ${settings.length ? settings.map((s) => `
          <div class="setting-row">
            <div class="sr-ico">${s.icon}</div>
            <div class="sr-main"><div class="sr-title" style="${s.danger ? "color:var(--danger)" : ""}">${esc(s.title)}</div>${s.desc ? `<div class="sr-desc">${esc(s.desc)}</div>` : ""}</div>
            ${s.on === null ? `<span style="color:var(--text-3);font-size:18px">›</span>` : `<div class="switch ${s.on ? "on" : ""}" data-act="toggle"></div>`}
          </div>`).join("") : emptyState("", "暂无设置项")}
      </div>`;
  }

  P.registerApp({ id: "profile", render });
})();
