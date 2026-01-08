# 历史英雄养成游戏

一个基于历史名人的养成类回合制PVP+PVE游戏，玩家可以收集和培养历史名人（皇帝、名将、科学家等）作为"英雄"，进行战斗和养成。

## 技术栈

- **前端**: React + Vite + React Router
- **后端**: Node.js + Express
- **数据库**: SQLite

## 项目结构

```
hero-battle-game/
├── frontend/          # React前端应用
│   ├── src/
│   │   ├── components/    # UI组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   └── utils/         # 工具函数
│   └── package.json
├── backend/           # Node.js后端
│   ├── routes/        # API路由
│   ├── services/      # 业务逻辑
│   ├── database.js    # 数据库操作
│   └── server.js      # 服务器入口
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

#### 后端

```bash
cd backend
npm install
```

#### 前端

```bash
cd frontend
npm install
```

### 启动项目

#### 方式1：使用批处理文件（Windows）

**启动后端**：
```bash
cd backend
start.bat
```

**启动前端**（新终端窗口）：
```bash
cd frontend
start.bat
```

#### 方式2：使用npm命令

**启动后端**：
```bash
cd backend
npm start
```

**启动前端**（新终端窗口）：
```bash
cd frontend
npm run dev
```

### 访问应用

- 前端：http://localhost:5173
- 后端API：http://localhost:3001

## GitHub Packages 配置（可选）

如果需要使用GitHub Packages来发布或安装私有包，需要配置认证：

### 1. 创建GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`read:packages` 和 `write:packages`
4. 生成并复制token

### 2. 设置环境变量

**Windows PowerShell**:
```powershell
$env:GITHUB_TOKEN="your_token_here"
```

**Windows CMD**:
```cmd
set GITHUB_TOKEN=your_token_here
```

**永久设置（用户级别）**:
```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "your_token_here", "User")
```

### 3. 使用GitHub Packages

项目根目录的 `.npmrc` 文件已配置好，使用环境变量 `GITHUB_TOKEN` 进行认证。

如果需要发布包到GitHub Packages，在 `package.json` 中添加：

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

## 功能特性

### 核心系统

- **英雄系统**: 英雄拥有基础属性（HP、ATK、DEF、SPD）、元素属性（五行相克）、星级系统
- **战斗系统**: 回合制战斗，属性相克，技能系统，状态效果
- **玩家系统**: 注册、登录、资源管理（金币、宝石）
- **抽卡系统**: 单抽和十连抽，不同星级的概率分布

### 游戏模式

- **PVE剧情模式**: 关卡制，逐步解锁剧情（开发中）
- **PVE竞技场**: AI对手，每日挑战（开发中）
- **PVP排位赛**: 匹配系统，段位制（计划中）
- **PVP好友对战**: 邀请好友进行对战（计划中）

## API接口

### 英雄相关
- `GET /api/heroes` - 获取所有英雄
- `GET /api/heroes/:id` - 获取英雄详情
- `GET /api/heroes/search/:query` - 搜索英雄

### 玩家相关
- `POST /api/players/register` - 注册
- `POST /api/players/login` - 登录
- `GET /api/players/:id` - 获取玩家信息
- `GET /api/players/:id/heroes` - 获取玩家的英雄列表

### 战斗相关
- `POST /api/battles/start` - 开始战斗
- `POST /api/battles/turn` - 执行战斗回合
- `GET /api/battles/history/:playerId` - 获取战斗记录

### 抽卡相关
- `POST /api/gacha/single` - 单抽
- `POST /api/gacha/multi` - 十连抽

## 数据库结构

主要数据表：
- `heroes` - 英雄基础信息
- `players` - 玩家账户
- `player_heroes` - 玩家拥有的英雄
- `battles` - 战斗记录
- `skills` - 技能定义
- `hero_skills` - 英雄技能关联

## 开发计划

- [x] 项目基础搭建
- [x] 数据库设计
- [x] 后端API开发
- [x] 战斗引擎
- [x] 前端基础页面
- [ ] PVE剧情模式
- [ ] PVE竞技场
- [ ] PVP匹配系统
- [ ] 技能系统完善
- [ ] UI/UX优化

## 许可证

MIT
