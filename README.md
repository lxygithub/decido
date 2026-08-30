# 决定吧 · 选择困难症自救工具箱

**Decido · Decision Tools for the Indecisive**

> 别再纠结了，让运气替你做决定。

一个帮助「选择困难症人群」快速做决定的纯前端工具站，内置 10 个精心打磨的决策小工具。
基于 **Vue 3 + Vite + TypeScript** 构建，零后端、零数据库，可一键免费部署到 **Cloudflare Workers / Pages**。

## ✨ 功能总览

| 工具 | 说明 |
| --- | --- |
| 幸运轮盘 | Canvas 转盘，自定义选项，减速旋转 + 指针音效 + 彩带庆祝，支持"抽中后自动移除" |
| 掷骰子 | 1–6 颗 CSS 3D 立方体骰子，落定带随机倾斜，自动求和 |
| 随机数 | 指定范围 / 数量，支持不重复抽取（抽奖模式） |
| 抛硬币 | 3D 抛掷动画，正反面统计与占比条 |
| 随机排序 | 清单一键洗牌，FLIP 平滑重排动画，可复制结果 |
| 抽签 | 抽 1–5 个幸运儿，减速滚动揭晓，支持抽中移出名单 |
| 掷筊问神 | 传统筊杯：圣筊 / 阴筊 / 笑筊，三圣筊大吉彩带庆祝 |
| 决断计时 | 环形倒计时，预设 + 自定义，最后 10 秒变红警告，铃声催你做决定 |
| 静心时钟 | 大字号时钟 + 日期 + 时段问候，秒进度条 |
| 记分板 | 多队记分、±1/±5、撤销、清零，领先者自动高亮 |

**通用特性**

- **中英双语**：默认英文，Header 一键切换，语言偏好持久化，全站文案（含 canvas 内文字）即时响应
- **纯前端 + 隐私安全**：所有随机基于 `crypto.getRandomValues`（加密级均匀分布），所有数据仅存 `localStorage`
- **合成音效**：Web Audio 实时生成，无音频文件，可一键静音
- **深色模式**：跟随系统 + 手动切换，偏好持久化
- **响应式**：移动端到桌面端全适配，支持安全区域
- **极致轻量**：路由级代码分包，首屏 JS gzip 后仅约 56 KB，零运行时依赖（除 Vue / Vue Router）

## 🚀 本地开发

```bash
bun install        # 或 npm install
bun run dev        # 开发服务器 http://localhost:3000
bun run build      # 生产构建 → dist/
bun run typecheck  # TypeScript 类型检查
```

## ☁️ 部署到 Cloudflare（免费）

> 详细的分步指引、自定义域名绑定与常见问题排查，请看 **[DEPLOY.md](./DEPLOY.md)**。以下为速览。

### 方式一：Cloudflare Workers（推荐）

Workers 静态资源托管对**免费用户完全免费且不限请求量**，是纯前端站点的最佳归宿。

```bash
npm i -g wrangler          # 首次需要登录：wrangler login
npm run deploy             # = vite build + wrangler deploy
```

仓库已包含 `wrangler.jsonc` 配置：

```jsonc
{
  "name": "decido",
  "compatibility_date": "2026-08-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application" // SPA 路由回退
  }
}
```

部署完成后会得到 `https://decido.<你的子域>.workers.dev` 地址。

### 方式二：Cloudflare Pages

**Git 集成（推荐，自动 CI）：**

1. 代码推送到 GitHub / GitLab
2. Cloudflare 控制台 → Workers & Pages → Create → Pages → 连接仓库
3. 构建配置：
   - 框架预设：`Vite`
   - 构建命令：`npm run build`
   - 输出目录：`dist`
4. 保存即部署，后续 push 自动构建

**CLI 直接部署：**

```bash
npm run build
npx wrangler pages deploy dist --project-name decido
```

仓库已在 `public/` 内置 Pages 所需文件：

- `_redirects`：`/* /index.html 200`（SPA 回退）
- `_headers`：静态资源一年强缓存 + HTML 协商缓存 + 安全响应头

### 免费额度说明

| 资源 | 免费额度 | 本站消耗 |
| --- | --- | --- |
| Workers 静态资源请求 | **无限量、全免费** | 全部页面流量 |
| Workers 动态请求 | 10 万次/天 | 0（纯静态） |
| Pages 带宽 | 无限量 | 全部页面流量 |
| Pages 构建次数 | 500 次/月 | 每次 push 1 次 |

> 纯前端架构下，一个每日万级访问的工具站可以 0 成本运行。

## 📁 目录结构

```
├── public/               # 静态资源（favicon、_redirects、_headers）
├── src/
│   ├── components/       # AppHeader / PageHead / ToolCard / ResultModal / ToastHost 等
│   ├── composables/      # useLocalStorage / useAppSettings / useToast
│   ├── i18n/             # 中英双语言包 + 取词函数（en 为键源，zh 类型强制对齐）
│   ├── router/           # vue-router（路由级懒加载）
│   ├── styles/           # 设计系统（CSS 变量 / 亮暗主题 / 通用组件类）
│   ├── utils/            # crypto 随机 / WebAudio 音效 / Canvas 彩带
│   ├── views/            # 首页 + 10 个工具页面
│   ├── tools.ts          # 工具注册表（名称 / 图标 / 语言键）
│   └── main.ts
├── DEPLOY.md             # 部署文档（Workers / Pages 双路线）
├── wrangler.jsonc        # Cloudflare Workers 配置
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ 技术要点

- **公平性**：`utils/random.ts` 基于拒绝采样实现无偏差整数随机，洗牌用 Fisher–Yates
- **轮盘旋转**：先加密随机选出赢家，再反推终点角度，动画用 easeOutQuart 缓动（rAF 驱动），途经格边界时触发滴答音
- **3D 骰子**：CSS `preserve-3d` 立方体，落定姿态附带 ±7° 随机倾斜模拟真实骰子
- **掷筊**：每筊独立 50/50 落面，一平一凸=圣筊，两凸=阴筊，两平=笑筊（与民俗一致）
- **音效**：全部由振荡器合成（tick / whoosh / clack / alarm / win 琶音），零资源文件
