# 春节抽奖应用

一个基于Vue 3的春节主题抽奖应用，使用CDN方式加载依赖，支持音效播放。

## 功能特性

- 🎉 春节主题UI设计，喜庆氛围
- 🎁 多奖项等级设置
- 🔄 实时抽奖动画效果
- 🏆 中奖榜单展示
- 📱 响应式设计，支持移动端
- 🔊 音效系统，包括《好运来》背景音乐
- 📋 完整的管理面板
- 📤 批量导入参与者功能

## 技术栈

- Vue 3 + Composition API
- Vue Router
- LocalStorage 数据持久化
- CDN 依赖管理

## 快速开始

### 本地运行

1. 直接在浏览器中打开 `lottery-cdn-full.html` 文件
2. 确保 `sounds` 文件夹中有以下音效文件：
   - `goodluck.m4a` - 《好运来》音乐
   - `click.mp3` - 点击音效
   - `win.mp3` - 中奖音效

### 部署到Netlify

1. **初始化Git仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到GitHub**
   - 创建GitHub仓库
   - 推送代码到GitHub

3. **部署到Netlify**
   - 登录Netlify
   - 导入GitHub仓库
   - 使用默认配置部署

## 项目结构

```
.
├── lottery-cdn-full.html    # 主应用文件
├── netlify.toml             # Netlify配置文件
├── README.md                # 项目说明
└── sounds/                  # 音效文件夹
    ├── goodluck.m4a         # 《好运来》音乐
    ├── click.mp3            # 点击音效
    └── win.mp3              # 中奖音效
```

## 使用说明

1. **添加参与者**：进入管理面板，手动添加或批量导入参与者
2. **设置奖项**：添加不同等级的奖项和奖品
3. **开始抽奖**：选择奖项等级和奖品，点击开始抽奖
4. **查看结果**：中奖结果会实时显示在右侧榜单

## 音效控制

- 点击"开始抽奖" - 播放《好运来》音乐
- 点击"停止抽奖" - 停止播放音乐并显示中奖结果
- 选择奖项/奖品 - 播放点击音效
- 中奖时 - 播放中奖音效

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+