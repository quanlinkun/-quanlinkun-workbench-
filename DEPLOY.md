# 全麟坤的工作台 · 部署指南

本项目是一个纯静态 PWA（HTML/CSS/JS），可直接托管到 GitHub Pages，无需构建步骤。

## 方式一：GitHub Pages（推荐）

1. 在 <https://github.com/new> 创建一个仓库（例如 `quanlinkun-workbench`），**不要**勾选 README。
2. 在本目录执行（替换 `<你的用户名>`）：
   ```bash
   git remote add origin https://github.com/<quanlinkun>/quanlinkun-workbench.git
   git branch -M main
   git push -u origin main
   ```

3. 打开仓库 **Settings → Pages**，Source 选择 `Deploy from a branch`，Branch 选 `main`、目录 `/(root)`，保存。
4. 等待 1-2 分钟，访问：`https://<你的用户名>.github.io/quanlinkun-workbench/`

> 若已安装 GitHub CLI：`gh repo create quanlinkun-workbench --public --source=. --push` 可一步完成。

## 方式二：CloudStudio（秒级公开 URL，无需 GitHub 账号）

若暂时没有 GitHub 账号，可使用 WorkBuddy 内置的「CloudStudio 部署」技能，一键生成可公开访问的链接。

## 功能说明

- 📱 PWA：浏览器访问后，手机端「添加到主屏幕」即可像 App 全屏打开，离线可访问已加载页面。
- 🗞️ 新闻 RSS：通过公共代理 `api.rss2json.com` / `api.allorigins.win` 解决 CORS，并缓存到本地，离线可看最近一次结果。
- 💾 数据（收藏/日历/小说/灵感/待办）全部存于浏览器本地，可用「设置 → 导出/导入 JSON」备份与迁移。

## 目录结构

```
index.html              应用入口
assets/css/style.css   金黄主题样式
assets/js/data.js      全部静态学习内容（雅思/数学/音乐/预设数据）
assets/js/news.js      RSS 加载与缓存
assets/js/app.js       路由、各板块逻辑、搜索、设置、PWA
manifest.webmanifest   PWA 配置
sw.js                  Service Worker（离线缓存）
assets/icons/          应用图标
```
