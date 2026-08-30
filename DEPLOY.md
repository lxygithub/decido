# 部署文档 · Decido（决定吧）

本文档面向首次部署的开发者，覆盖从零开始将本站部署到 Cloudflare 的完整流程。项目是**纯前端静态站点**（Vue 3 + Vite），无后端、无数据库，所有状态存于浏览器 `localStorage`，因此部署只需托管静态文件，免费额度绰绰有余。

## 目录

- [两种部署方式怎么选](#两种部署方式怎么选)
- [前置准备](#前置准备)
- [本地构建验证](#本地构建验证)
- [路线 A：Cloudflare Workers（推荐）](#路线-acloudflare-workers推荐)
- [路线 B：Cloudflare Pages](#路线-bcloudflare-pages)
- [绑定自定义域名](#绑定自定义域名)
- [SPA 路由与缓存机制说明](#spa-路由与缓存机制说明)
- [更新与回滚](#更新与回滚)
- [常见问题 FAQ](#常见问题-faq)

---

## 两种部署方式怎么选

| | 路线 A：Workers（推荐） | 路线 B：Pages |
| --- | --- | --- |
| 适合人群 | 想要最简单、最快上线的 | 希望 push 代码自动构建的 |
| 部署方式 | CLI 一条命令 | Git 集成自动 CI，或 CLI 直传 |
| 静态资源请求 | 免费计划**免费且不限量** | 免费计划无限量带宽 |
| SPA 路由回退 | `wrangler.jsonc` 配置 | `public/_redirects` 配置 |
| 自定义域名 | 支持 | 支持 |

> 本项目两条路线的配置文件都已就位（`wrangler.jsonc`、`public/_redirects`、`public/_headers`），任选其一即可，无需额外编写配置。

## 前置准备

1. **Node.js ≥ 20**（本地构建用）：

   ```bash
   node -v   # v20+ 即可
   ```

2. **包管理器**：npm（随 Node 附带）或 bun 均可。

3. **Cloudflare 账号**：免费计划即可，注册地址 [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)。

4. **安装并登录 Wrangler**（Cloudflare 官方 CLI，路线 A 与路线 B 的 CLI 直传都需要）：

   ```bash
   npm i -g wrangler
   wrangler login          # 会打开浏览器授权；登录后 wrangler whoami 可验证
   ```

   > **无头服务器 / CI 环境**无法打开浏览器时，改用 API Token 登录：
   > 1. 打开 [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) → Create Token
   > 2. 使用模板 **"Edit Cloudflare Workers"**（部署 Pages 则再加 **Cloudflare Pages: Edit** 权限）
   > 3. 在终端导出环境变量：
   >
   >    ```bash
   >    export CLOUDFLARE_API_TOKEN=你的token
   >    export CLOUDFLARE_ACCOUNT_ID=你的账户ID   # 控制台首页右侧可见
   >    ```

## 本地构建验证

部署前先在本地完整构建一次，确认产物正常：

```bash
npm install          # 首次安装依赖（bun install 亦可）
npm run build        # 生产构建 → dist/
npm run preview      # 本地预览 dist，确认页面正常后 Ctrl+C 退出
```

构建成功后 `dist/` 目录约 1 MB 以内（含全部 11 个页面分包），`index.html` 引用的首屏 JS gzip 后约 56 KB。

---

## 路线 A：Cloudflare Workers（推荐）

Workers 静态资产托管对**免费用户完全免费，静态资源请求不计入每日 10 万次动态请求配额**，是纯前端站点的最佳归宿。

### 部署步骤

```bash
# 1. 确认已登录 wrangler（见前置准备）
wrangler whoami

# 2. 一键构建 + 部署
npm run deploy
# 等价于：vite build && wrangler deploy
```

首次部署会提示创建 Worker，输入项目名 `decido` 回车即可。完成后终端会输出访问地址：

```
https://decido.<你的子域>.workers.dev
```

打开地址即可使用，全部路由（`/wheel`、`/dice` 等 10 个工具页）均可直接访问与刷新。

### 它为什么开箱即用

仓库根目录的 `wrangler.jsonc` 已完成全部配置：

```jsonc
{
  "name": "decido",                          // Worker 名称，也是 workers.dev 子域前缀
  "compatibility_date": "2026-08-01",
  "assets": {
    "directory": "./dist",                   // 构建产物目录
    "not_found_handling": "single-page-application",  // 404 回退到 index.html（SPA 关键）
    "html_handling": "auto-trailing-slash"   // /wheel 与 /wheel/ 均可访问
  }
}
```

### 想改项目名

编辑 `wrangler.jsonc` 的 `"name"` 字段（仅限小写字母、数字、连字符），重新 `npm run deploy` 即可，地址会随之变为 `https://<新名字>.<子域>.workers.dev`。

---

## 路线 B：Cloudflare Pages

### 方式 B-1：Git 集成（push 自动构建，推荐团队协作）

1. 把源码推送到 GitHub 或 GitLab 仓库（打包内容见源码包说明，或直接使用本仓库）。
2. 登录 [dash.cloudflare.com](https://dash.cloudflare.com) → 左侧 **Workers & Pages** → **Create** → 切换到 **Pages** 标签 → **Connect to Git**。
3. 授权并选择仓库后，填写构建配置：

   | 配置项 | 值 |
   | --- | --- |
   | Project name | `decido`（决定访问子域 `decido.pages.dev`） |
   | Production branch | `main` |
   | Framework preset | `Vite`（选不到就选 None） |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

4. 展开 **Environment variables (advanced)**，添加一个变量（避免 Cloudflare 默认 Node 版本过旧导致构建失败）：

   | 变量名 | 值 |
   | --- | --- |
   | `NODE_VERSION` | `20`（或 `22`） |

5. 点击 **Save and Deploy**，约 1 分钟后即可通过 `https://decido.pages.dev` 访问。
6. 之后每次 `git push` 到 `main` 会自动构建上线，PR 也会生成独立的预览地址。

### 方式 B-2：CLI 直接上传（不经过 Git）

```bash
npm run build
npx wrangler pages deploy dist --project-name decido
```

首次执行会自动创建 `decido` Pages 项目，完成后输出 `https://xxxx.decido.pages.dev` 地址。

### Pages 模式的 SPA 与缓存

仓库已在 `public/` 内置两个文件，构建时会自动复制进 `dist/`，无需手工处理：

- **`_redirects`**：`/*    /index.html   200` —— 所有未命中的路径回退到入口，保证 `/wheel` 等路由刷新不 404。
- **`_headers`**：`/assets/*` 一年强缓存（文件名带哈希指纹，可放心长缓存）；`/index.html` 每次协商校验，保证发版后用户立刻拿到新版本；另附 `nosniff`、`Referrer-Policy` 两个安全头。

---

## 绑定自定义域名

前提：域名已接入 Cloudflare（NS 托管在 Cloudflare，免费计划即可）。

**Workers（路线 A）：**

1. 控制台 → Workers & Pages → 点击 `decido`
2. **Settings** → **Domains & Routes** → **Add** → **Custom domain**
3. 输入例如 `decido.example.com`，确认后证书自动签发（约 1–2 分钟生效）

**Pages（路线 B）：**

1. 控制台 → Workers & Pages → 点击 Pages 项目 `decido`
2. **Custom domains** → **Set up a custom domain** → 输入域名
3. 按提示自动添加 CNAME 记录，证书自动签发

两种方式都会自动处理 HTTPS 证书与续期，无需任何证书操作。

---

## 更新与回滚

| 操作 | Workers | Pages |
| --- | --- | --- |
| 发布新版本 | 改代码后重新 `npm run deploy` | Git 集成：push 即发布；CLI：重新执行 `wrangler pages deploy dist` |
| 查看历史版本 | 控制台 → 项目 → **Deployments** | 控制台 → 项目 → **Deployments** |
| 回滚 | Deployments 列表 → 旧版本 → **Rollback** | 同左 |

## 常见问题 FAQ

**Q1：部署后刷新 `/wheel` 出现 404？**
说明 SPA 回退没生效。Workers 路线确认 `wrangler.jsonc` 中 `not_found_handling` 为 `"single-page-application"`；Pages 路线确认 `dist/` 根目录下存在 `_redirects` 文件（本地构建后可 `ls dist/_redirects` 验证，该文件来自 `public/`）。

**Q2：部署了新版本，用户看到的还是旧页面？**
`index.html` 已配置协商缓存（`max-age=0, must-revalidate`），正常发版立即生效。若仍见旧版，多为浏览器本地缓存，强刷（Ctrl/Cmd + Shift + R）即可。

**Q3：默认语言想改成中文怎么办？**
编辑 `src/i18n/index.ts`，把 `loadSavedLocale()` 的兜底返回值从 `'en'` 改为 `'zh'`；同时把 `index.html` 中 `lang="en"` 与默认标题/描述换成中文版。语言包本身中英已全部就位（各 235 个键）。

**Q4：完全免费吗？会不会突然收费？**
纯静态用量下免费。Workers 免费计划：静态资产请求**免费且不限量**，动态请求 10 万次/天（本站为 0）；Pages 免费计划：带宽无限量、构建 500 次/月。本项目无数据库、无 KV、无图片转码等付费点。

**Q5：想在 Vercel / Netlify 部署可以吗？**
可以。它是标准 Vite 项目：构建命令 `npm run build`、输出目录 `dist`、SPA 回退把所有路径重写到 `/index.html` 即可（Netlify 的 `public/_redirects` 已内置，Vercel 需在项目设置中添加 rewrite 规则）。

**Q6：数据会同步到服务器吗？**
不会。站点零后端，轮盘选项、记分、掷筊历史等全部只存在浏览器 `localStorage` 中，换浏览器/清缓存即重置，服务器（Cloudflare CDN）只分发静态文件。
