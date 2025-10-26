# 使用 VitePress + GitHub Pages + Giscus 构建现代化文档网站

## 前言

在开发和学习过程中，我们经常需要记录学习内容。传统的文档管理方式往往存在以下问题：
- 静态 HTML 文件难以维护
- 缺乏搜索功能
- 无法进行评论和讨论
- 部署流程复杂

本文将介绍 **VitePress + GitHub Pages + Giscus** 构建文档网站的原理以及实现样例，实现：
- 📝 基于 Markdown 的文档编写
- 🔍 本地搜索功能
- 💬 基于 GitHub Discussions 的评论系统
- 🚀 自动化部署流程
- 📱 响应式设计

## 技术栈介绍

### VitePress
- **Vue.js** 驱动的静态站点生成器
- 基于 **Vite** 构建，开发体验极佳
- 内置搜索、多语言支持
- 丰富的主题和插件生态

### GitHub Pages
- 免费的静态网站托管服务
- 与 GitHub 仓库无缝集成
- 支持自定义域名
- 自动 HTTPS

### Giscus
- 基于 **GitHub Discussions** 的评论系统
- 无需数据库，数据存储在 GitHub
- 支持多语言
- 与 GitHub 账户集成

## 项目初始化

### 1. 创建项目结构

```bash
mkdir knowledge-notes
cd knowledge-notes
npm init -y
```

### 2. 安装依赖

```bash
# 安装 VitePress
npm install -D vitepress

# 安装评论插件
npm install vitepress-plugin-comment-with-giscus

# 安装自动侧边栏插件
npm install -D vitepress-sidebar
```

### 3. 配置 package.json

```json
{
  "name": "knowledge-notes",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview",
    "docs:dev": "vitepress dev",
    "docs:build": "vitepress build",
    "docs:preview": "vitepress preview"
  },
  "devDependencies": {
    "vitepress": "^1.0.0",
    "vitepress-sidebar": "^1.33.0"
  },
  "dependencies": {
    "vitepress-plugin-comment-with-giscus": "^1.1.15"
  }
}
```

## VitePress 配置

### 1. 基础配置文件

创建 `.vitepress/config.ts`：

```typescript
import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

export default defineConfig({
  title: 'Knowledge Notes',
  description: '随着自己做的项目，学习内容的笔记。用来记录、打磨方法论。',
  
  // GitHub Pages 部署配置
  base: '/knowledge-notes/',
  outDir: 'dist',
  
  // 多语言支持
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN'
    }
  },
  
  // 主题配置
  themeConfig: {
    siteTitle: 'Knowledge Notes',
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: 'Docker', link: '/docker/' },
      { text: 'PocketBase', link: '/pocketbase/' },
      { text: 'Traefik', link: '/traefik/' }
    ],
    
    // 自动生成侧边栏
    sidebar: generateSidebar({
      documentRootPath: '/',
      useTitleFromFileHeading: true,
      useFolderTitleFromIndexFile: true,
      useFolderLinkFromIndexFile: true,
      collapsed: false
    }),
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/你的用户名/knowledge-notes' }
    ],
    
    // 搜索功能
    search: {
      provider: 'local'
    },
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/你的用户名/knowledge-notes/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    }
  },
  
  // Markdown 配置
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
```

### 2. 主题配置

创建 `.vitepress/theme/index.ts`：

```typescript
import DefaultTheme from 'vitepress/theme';
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
import { useData, useRoute } from 'vitepress';
import { toRefs } from "vue";

export default {
    ...DefaultTheme,
    enhanceApp(ctx) {
        DefaultTheme.enhanceApp(ctx);
    },
    setup() {
        const { frontmatter } = toRefs(useData());
        const route = useRoute();
        
        // 配置 Giscus 评论系统
        giscusTalk({
            repo: '你的用户名/knowledge-notes',
            repoId: 'YOUR_REPO_ID',
            category: 'General',
            categoryId: 'YOUR_CATEGORY_ID',
            mapping: 'pathname',
            inputPosition: 'top',
            lang: 'zh-CN',
            locales: {
                'zh-Hans': 'zh-CN',
                'en-US': 'en'
            },
            homePageShowComment: true,
            lightTheme: 'light',
            darkTheme: 'transparent_dark'
        }, {
            frontmatter, route
        }, true);
    }
};
```

## 文档结构设计

### 1. 首页配置

创建 `index.md`：

```markdown
---
layout: home

hero:
  name: "Knowledge Notes"
  text: "学习笔记与项目记录"
  tagline: 随着自己做的项目，学习内容的笔记。用来记录、打磨方法论。
  actions:
    - theme: brand
      text: 开始阅读
      link: /docker/
    - theme: alt
      text: 在 GitHub 查看
      link: https://github.com/你的用户名/knowledge-notes

features:
  - icon: 🐳
    title: Docker 学习笔记
    details: Docker 容器化技术的实践与总结
    link: /docker/
  - icon: 🗄️
    title: PocketBase 学习笔记
    details: PocketBase 后端服务的开发经验
    link: /pocketbase/
  - icon: 🔀
    title: Traefik 学习笔记
    details: Traefik 反向代理的配置与使用
    link: /traefik/
---
```

### 2. 文档组织

```
knowledge-notes/
├── .vitepress/
│   ├── config.ts          # VitePress 配置
│   └── theme/
│       └── index.ts       # 主题配置
├── docker/
│   ├── index.md          # Docker 介绍
│   └── examples/
│       └── index.md      # Docker 示例
├── pocketbase/
│   ├── index.md          # PocketBase 介绍
│   └── examples/
│       └── index.md      # PocketBase 示例
├── traefik/
│   ├── index.md          # Traefik 介绍
│   └── examples/
│       └── index.md      # Traefik 示例
├── index.md              # 首页
└── README.md             # 项目说明
```

## 自动化部署

### 1. GitHub Actions 工作流

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Install dependencies
        run: npm ci

      - name: Build with VitePress
        run: npm run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. 配置 GitHub Pages

1. 进入仓库的 **Settings** 页面
2. 找到 **Pages** 部分
3. 选择 **Source** 为 **GitHub Actions**
4. 保存设置

## Giscus 评论系统配置

### 1. 启用 GitHub Discussions

1. 进入仓库的 **Settings** 页面
2. 找到 **Features** 部分
3. 勾选 **Discussions** 选项

### 2. 获取 Giscus 配置

1. 访问 [Giscus 配置页面](https://giscus.app/)
2. 选择你的仓库
3. 配置评论设置
4. 获取 `repoId` 和 `categoryId`
5. 更新 `.vitepress/theme/index.ts` 中的配置

## 项目优化

### 1. 添加 .gitignore

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# VitePress build output
.vitepress/dist/
.vitepress/cache/

# Build output
dist/

# Local env files
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### 2. 自动侧边栏的优势

使用 `vitepress-sidebar` 插件的好处：

- **自动扫描**：根据文件结构自动生成侧边栏
- **无需手动维护**：添加新文档时自动更新
- **智能排序**：支持多种排序方式
- **灵活配置**：可自定义扫描规则和显示方式

## 开发工作流

### 1. 本地开发

```bash
# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 2. 部署流程

1. 编写或修改文档
2. 本地测试：`npm run dev`
3. 提交更改：`git add . && git commit -m "更新文档"`
4. 推送到 GitHub：`git push`
5. GitHub Actions 自动构建和部署

## 功能特性

### 1. 搜索功能
- 基于 **MiniSearch** 的本地搜索
- 支持中文搜索
- 实时搜索建议

### 2. 评论系统
- 基于 GitHub Discussions
- 支持 Markdown 格式
- 实时通知
- 多语言支持

### 3. 响应式设计
- 移动端友好
- 暗色/亮色主题切换
- 自适应布局

### 4. SEO 优化
- 自动生成 sitemap
- 结构化数据
- 社交媒体预览

## 常见问题解决

### 1. 构建失败

**问题**：GitHub Actions 构建失败
**解决**：检查 `package.json` 中的依赖版本，确保所有依赖正确安装

### 2. 评论不显示

**问题**：Giscus 评论组件不显示
**解决**：
- 确认仓库已启用 Discussions
- 检查 `repoId` 和 `categoryId` 是否正确
- 确认仓库是公开的

### 3. 侧边栏不更新

**问题**：添加新文档后侧边栏没有更新
**解决**：检查文件命名和目录结构，确保符合 VitePress 规范

## 总结

通过 **VitePress + GitHub Pages + Giscus** 的组合，我们成功构建了一个功能完整的现代化文档网站：

✅ **开发体验**：基于 Vite 的快速构建
✅ **内容管理**：Markdown 驱动的文档编写
✅ **自动化部署**：GitHub Actions 一键部署
✅ **用户互动**：Giscus 评论系统
✅ **搜索功能**：本地搜索支持
✅ **响应式设计**：移动端友好

这个方案特别适合：
- 技术博客和文档网站
- 开源项目文档
- 团队知识库
- 个人学习笔记

希望这篇文章能帮助你快速搭建自己的文档网站！如果你有任何问题，欢迎在评论区讨论。

---

**相关链接：**
- [VitePress 官方文档](https://vitepress.dev/)
- [GitHub Pages 文档](https://pages.github.com/)
- [Giscus 官网](https://giscus.app/)
- [vitepress-sidebar 插件](https://github.com/valmisson/vitepress-sidebar)
