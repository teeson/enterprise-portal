# 智汇门户 · 企业统一工作平台

> 一个面向企业内部的统一门户示例项目：PC 与移动端响应式，集新闻通知、应用中心、工作台、消息、待办、知识文库、个人中心于一体。

## 功能特性

- **响应式布局**：PC 端侧边栏导航、移动端抽屉 + 底部标签栏，按运行环境自动切换，不同时在屏。
- **应用一等公民 + 模块化架构**：公共代码与样式沉淀于「核心运行时」（`core/`），每个业务应用独立目录（`apps/<id>/`）自管源码与数据，可独立开发演进。
- **卡片注册机制**：应用通过 `Portal.registerCard()`（或 `registerApp({ cards })`）导出卡片，工作台只负责编排组合，新增卡片即自动上墙，无需改动工作台代码。
- **工作台**：指标概览、工作趋势图（手绘 SVG，离线可用）、常用应用、日程提醒、待办速览、最新消息（后三者由对应应用注册卡片提供）。
- **新闻通知**：分类浏览与检索，列表配图 + 详情头图。
- **消息（微信式）**：会话列表按最新消息时间倒序，区分应用 / 私聊 / 群聊类型；对话气泡式界面，本人消息右对齐，支持发送消息与轻量自动回复。
- **待办**：指标卡片可点击筛选；待办图标取自来源应用，点击跳转对应应用页面处理；已完成项显示绿色「已完成」印戳。
- **零构建**：纯原生 HTML / CSS / JavaScript，双击 `index.html` 即可运行，无打包依赖、不依赖外部 CDN。

## 技术栈

- 原生 HTML5 / CSS3（CSS 变量 + 媒体查询响应式）/ 原生 ES JavaScript（经典脚本注册，非 ES Module）
- 核心运行时 `Portal`：应用 / 卡片 / 数据注册表 + 基于 `location.hash` 的路由 + 事件委托（按当前应用派发 `onAction`）
- 图表与头像全部使用内联 SVG，完全离线可用

## 架构与目录结构

```
.
├── index.html              # 入口：先加载核心运行时，再按序加载各应用
├── core/                   # 核心运行时（公共代码 + 样式）
│   ├── core.css            # 公共设计系统（设计变量 + 全部共享组件样式）
│   ├── runtime.js          # Portal 框架：registerApp/Card/Data、路由、事件委托、工具
│   └── platform-data.js    # 平台数据：应用目录（导航/应用中心元数据）、用户、设置
├── apps/                   # 每个应用独立目录，自管源码与数据
│   ├── workbench/          # 工作台：编排面 + 注册 工作概览/常用应用/日程提醒 卡片
│   │   ├── data.js         #   应用自有数据（指标/日程/图表）
│   │   └── index.js        #   行为：render / mounted / 卡片
│   ├── news/               # 新闻：列表 + 详情 + 分类筛选
│   ├── todo/               # 待办：页面 + 完成处理 + 导出「待办速览」卡片
│   ├── message/            # 消息：列表 + 对话 + 发送 + 导出「最新消息」卡片
│   ├── apps-center/        # 应用中心（读目录）
│   ├── docs/               # 知识文库
│   ├── profile/            # 个人中心
│   └── search/             # 全局搜索
├── assets/news/            # 新闻示例配图（news1-6.png）
├── preview-pc.png          # PC 端预览截图
└── preview-mobile.png      # 移动端预览截图
```

### 核心机制

- **注册**：`core/platform-data.js` 注入应用目录元数据；页面型应用在自身 `index.js` 调用 `Portal.registerApp({ id, render, onAction, mounted, cards })` 增补行为；`data.js` 调用 `Portal.registerData(key, val)` 注入自有数据。
- **路由**：`#/app/{id}/{param}`，由核心运行时统一解析并调用 `APP[id].render(param)`。
- **事件**：内容区委托给当前应用 `onAction(act, id, e)`；核心兜底 `toast` / `toggle`。
- **卡片**：应用导出的卡片经 `Portal.cards` 汇聚，工作台渲染时遍历上墙。

## 快速开始

无需安装任何依赖，直接用浏览器打开 `index.html` 即可：

```bash
# 任选其一
open index.html                # macOS
xdg-open index.html            # Linux
# 或启动一个静态服务器
python3 -m http.server 8080    # 然后访问 http://localhost:8080
```

## 发布说明

- **GitHub Pages（源码即站点）**：https://teeson.github.io/enterprise-portal/
- **GitHub 仓库**：https://github.com/teeson/enterprise-portal
- 早期「发布为应用」托管示例：https://a0b251e9e13bd1638.app.workbuddy.host

> 注：项目内的公司名、人名、数据均为示例（脱敏）内容，可按需替换为真实数据。

## 许可证

本项目基于 [MIT License](./LICENSE) 开源。
