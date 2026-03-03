# Infinite Canvas Whiteboard (无限画布白板)

一款基于 B/S 架构开发的轻量级在线白板软件。支持无限画布、矢量级无损缩放，并提供了具有真实压感特征的多种笔触效果。项目专门针对移动端（如安卓平板浏览器）进行了手势和交互适配，支持作品的云端保存与本地下载。

## ✨ 核心特性

- ♾️ **无限画布与矢量缩放**：采用全局摄像机模型，支持使用鼠标滚轮（Ctrl+滚轮）或触控板双指自由平移和无损缩放。
- 🎨 **真实的笔触引擎**：基于 `perfect-freehand` 算法渲染：
  - ✏️ **铅笔**：硬朗、等宽、带有微弱透明石墨质感，真实反映手部微小抖动。
  - ✒️ **钢笔**：边缘顺滑无锯齿，带有跟随手速的粗细动态变化。
  - 🖌️ **水墨**：强烈的粗细压感变化，起笔收笔带有明显的笔锋与晕开效果。
- 📱 **完美的移动端适配**：统一使用 Pointer Events，智能区分单指/触控笔绘制与双指手势（平移/缩放），支持防误触。
- 💾 **本地与云端双向管理**：
  - 支持将项目以无损 JSON 格式安全地持久化保存到服务端（支持自定义项目命名）。
  - 支持随时打开悬浮项目列表无缝切换历史画板。
  - 支持一键导出并下载 JSON 数据到本地设备。

## 🛠 技术栈

- **前端**: React 18 + Vite, Zustand/State 管理, Lucide-React (图标)
- **后端**: Node.js + Express
- **存储**: 本地文件系统 (持久化保存为 JSON 文件)
- **容器化**: Docker 多阶段构建支持

## 🚀 快速启动

你可以选择使用原生环境运行，或者使用 Docker 一键部署。

### 方式一：本地开发环境运行

**前置要求**: 需安装 Node.js (建议 v18+)

1. **启动后端服务**
   ```bash
   cd server
   npm install
   node index.js
   ```
   *后端服务将运行在 `http://localhost:3001`*

2. **启动前端服务**（打开新的终端窗口）
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *前端服务将运行在 `http://localhost:5173`，打开浏览器访问即可体验。*

> **提示（Windows/Linux 快捷启动）**: 
> 根目录下提供了 `start.bat` (Windows) 和 `start.sh` (Mac/Linux) 脚本，双击或运行即可自动启动前后端两个服务，并支持自定义端口。

### 方式二：docker部署

```bash
docker run -di \
  -p 3456:3001 \
  -v ./projects:/app/projects \
  --restart always \
  --name whiteboard \
  heydaoyi/my-whiteboard:v1.0
```


### 方式三：自己构建和部署docker

项目内包含了优化过的多阶段 `Dockerfile`，会将前端静态页面打包并由 Node.js 后端统一代理提供服务，单端口即可运行。

1. **构建镜像**
   ```bash
   docker build -t my-whiteboard:latest .
   ```

2. **运行容器**
   > 为了防止容器重启或销毁导致画板数据丢失，建议通过 `-v` 挂载本地目录到容器内部的 `/app/projects` 文件夹。
   ```bash
   docker run -d \
     -p 3001:3001 \
     -v $(pwd)/projects:/app/projects \
     --name whiteboard-app \
     --restart always \
     my-whiteboard:latest
   ```

3. **访问**
   在浏览器中打开 `http://localhost:3001` 即可使用。

## 📁 目录结构说明

```text
├── client/           # React 前端源码
│   ├── src/
│   │   ├── components/  # 白板、工具栏、项目列表等组件
│   │   ├── App.jsx      # 主应用逻辑与状态维护
│   │   └── ...
├── server/           # Node.js 后端源码
│   └── index.js      # RESTful API 及前端静态文件代理
├── projects/         # 白板数据 JSON 文件默认存储目录（自动创建）
├── Dockerfile        # Docker 镜像构建文件
├── start.bat         # Windows 一键启动脚本
└── start.sh          # Linux/Mac 一键启动脚本
```

## 🤝 贡献与反馈

欢迎提交 Issue 和 Pull Request 来帮助完善这个项目！如果你有更好的笔触算法、性能优化方案或 UI 建议，期待你的加入。

## 📄 许可证

ISC License
