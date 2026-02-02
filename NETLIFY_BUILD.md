# Netlify 构建配置指南

## 问题分析

本地运行正常，但部署到 Netlify 后出现 "Failed to resolve module specifier 'vue'" 错误。

## 解决方案

### 1. 已修复的配置

- **vite.config.js**：已添加 `base: './'` 配置，使用相对路径
- **index.html**：已修复 favicon 引用路径，改为相对路径
- **构建配置**：已确保所有模块都被正确打包到 vendor.js 文件中

### 2. Netlify 构建设置

在 Netlify 管理面板中，确保以下设置正确：

1. **构建命令**：`npm run build`
2. **发布目录**：`dist`
3. **环境变量**：无需特殊配置

### 3. 验证步骤

1. 本地运行 `npm run build` 确保构建成功
2. 检查 `dist` 目录是否生成，包含以下文件：
   - `index.html`
   - `assets/` 目录及相关 JS/CSS 文件
3. 将代码推送到 GitHub
4. Netlify 会自动构建并部署

### 4. 常见问题排查

- **构建失败**：检查是否安装了所有依赖（运行 `npm install`）
- **部署后空白页**：检查浏览器控制台错误，确保所有资源路径正确
- **模块引用错误**：确保所有模块引用都是相对路径，而非绝对路径

## 技术说明

- 使用 Vue 3 + Vite 构建
- 所有模块已打包到 vendor.js 文件中
- 所有资源引用使用相对路径
- 支持本地存储数据持久化
