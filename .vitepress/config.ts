import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'
import simpleGit from 'simple-git'

// --- 配置 ---
/**
 * 部署站点的基础路径。
 * 必须以 / 开头和结尾。
 * 这必须与 `defineConfig` 中的 `base` 属性匹配。
 * 
 * 注意：因为仓库名是 tajuren.github.io (用户级GitHub Pages)，
 * 会部署到根路径，所以 base 设置为 '/'
 */
const BASE_PATH = '/'

// --- 类型定义 ---
interface DocDirectory {
  name: string;            // 目录名 (e.g., 'docker')
  capitalizedName: string; // 首字母大写的名称 (e.g., 'Docker')
  path: string;            // 完整的 URL 路径 (e.g., '/knowledge-notes/docker/')
  icon: string;            // 图标
  lastModified: Date;      // 最后修改时间
  documentRoot: string;    // 文档根路径 (e.g., 'docker')
}

// --- 核心扫描函数 (单一数据源) ---

/**
 * 扫描项目根目录以查找所有有效的文档目录。
 * 一个目录如果包含 index.md 并且不是隐藏文件或构建目录，则被视为有效。
 * @returns {DocDirectory[]} 所有有效文档目录的信息数组
 */
function getDocumentDirectories(): DocDirectory[] {
  const rootDir = process.cwd()
  const iconMap: Record<string, string> = {
    'docker': '🐳',
    'pocketbase': '🗄️',
    'traefik': '🔀',
    'github blog': '📝',
    'react': '⚛️',
    'vue': '💚',
    'node': '🟢',
    'python': '🐍',
    'typescript': '🔷',
    'javascript': '🟨'
  }

  const docDirs = fs.readdirSync(rootDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => 
      !dirent.name.startsWith('.') && 
      dirent.name !== 'node_modules' && 
      dirent.name !== 'dist' && 
      dirent.name !== '.vitepress'
    )
    .map(dirent => {
      const dirName = dirent.name
      const indexPath = path.join(rootDir, dirName, 'index.md')

      if (fs.existsSync(indexPath)) {
        const stats = fs.statSync(indexPath)
        return {
          name: dirName,
          capitalizedName: dirName.charAt(0).toUpperCase() + dirName.slice(1),
          path: `${BASE_PATH}${dirName}/`,
          icon: iconMap[dirName.toLowerCase()] || '📄',
          lastModified: stats.mtime,
          documentRoot: dirName
        }
      }
      return null
    })
    .filter(Boolean) as DocDirectory[]
  
  return docDirs
}

// --- 启动时执行一次扫描 ---
const allDocs = getDocumentDirectories()

// --- 预计算导航项 ---
async function precomputeNavItems(): Promise<Array<{text: string, link: string}>> {
  const git = simpleGit()
  
  try {
    const docsWithCommitTime = await Promise.all(allDocs.map(async (doc) => {
      try {
        const log = await git.log({ 
          file: `${doc.name}/index.md`,
          maxCount: 1 
        })
        const lastCommit = log.latest
        return {
          ...doc,
          lastCommitTime: lastCommit ? new Date(lastCommit.date) : new Date(0)
        }
      } catch (error) {
        console.warn(`无法获取 ${doc.name} 的 Git 提交时间，使用文件修改时间`)
        return {
          ...doc,
          lastCommitTime: doc.lastModified
        }
      }
    }))

    return docsWithCommitTime
      .sort((a, b) => b.lastCommitTime.getTime() - a.lastCommitTime.getTime())
      .slice(0, 3)
      .map(doc => ({
        text: doc.capitalizedName,
        link: doc.path.replace(BASE_PATH, '/')
      }))
  } catch (error) {
    console.warn('Git 操作失败，使用文件修改时间排序')
    return allDocs
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, 3)
      .map(doc => ({
        text: doc.capitalizedName,
        link: doc.path.replace(BASE_PATH, '/')
      }))
  }
}

// 预计算导航项
const latestNavItems = await precomputeNavItems()

// --- 派生函数 ---

/**
 * 使用 VitePress 原生方式生成侧边栏配置。
 */
function generateNativeSidebar(): Record<string, any> {
  // 为开发环境生成不带 BASE_PATH 的链接
  const devSidebarItems = allDocs.map(doc => {
    const devPath = doc.path.replace(BASE_PATH, '/')
    return {
      text: `${doc.icon} ${doc.capitalizedName}`,
      link: devPath,
      items: [
        {
          text: '概述',
          link: devPath
        },
        {
          text: '示例',
          link: `${devPath}examples/`
        }
      ]
    }
  })

  // 为生产环境生成带 BASE_PATH 的链接
  const prodSidebarItems = allDocs.map(doc => ({
    text: `${doc.icon} ${doc.capitalizedName}`,
    link: doc.path,
    items: [
      {
        text: '概述',
        link: doc.path
      },
      {
        text: '示例',
        link: `${doc.path}examples/`
      }
    ]
  }))

  return {
    '/': devSidebarItems,
    [BASE_PATH]: prodSidebarItems
  }
}

// --- VitePress 配置 ---

export default defineConfig({
  title: 'tajuren',
  description: '组内工作产出的笔记，记录学籍过程，供大家参考',
  
  // GitHub Pages 部署配置
  base: BASE_PATH, // 使用常量
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
    // 网站标题
    siteTitle: 'tajuren',
    
    // 导航栏 - 使用预计算的导航项（基于 Git 提交时间）
    nav: [
      { text: '首页', link: '/' },
      ...latestNavItems
    ],
    
    // 使用原生侧边栏配置
    sidebar: generateNativeSidebar(), 
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/tajuren/tajuren.github.io' }
    ],
    
    // 页脚
    footer: {
      message: '基于 VitePress 构建',
      copyright: 'Copyright © 2024 Knowledge Notes'
    },
    
    // 搜索
    search: {
      provider: 'local'
    },
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/tajuren/tajuren.github.io/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
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