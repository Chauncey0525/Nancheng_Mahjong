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

#### 方式1：使用启动脚本（推荐）

**Windows系统**：
```bash
# 双击运行或在命令行执行
start-game-enhanced.bat
```

**Git Bash（Linux/Mac）**：
```bash
bash start-game.sh
```

启动脚本会自动：
- ✅ 检查Node.js和npm是否安装
- ✅ 检查并安装依赖（如果未安装）
- ✅ 启动后端服务器（新窗口，端口3001）
- ✅ 启动前端开发服务器（新窗口，端口5173）
- ✅ 自动打开浏览器

#### 方式2：手动启动

**第一步：启动后端服务器**
```bash
cd backend
npm install  # 首次运行需要安装依赖
npm start
```

**第二步：启动前端服务器**（新开一个终端窗口）
```bash
cd frontend
npm install  # 首次运行需要安装依赖
npm run dev
```

### 访问应用

- 前端：http://localhost:5173
- 后端API：http://localhost:3001


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

#### 注册账号
- **接口**: `POST /api/players/register`
- **请求体**:
  ```json
  {
    "username": "玩家用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "注册成功",
    "data": {
      "id": 1,
      "username": "玩家用户名",
      "coins": 1000,
      "gems": 100,
      "level": 1,
      "exp": 0,
      "pvpRank": 0,
      "pvpPoints": 1000
    }
  }
  ```
- **验证规则**:
  - 用户名：3-20个字符，只能包含字母、数字、下划线和中文
  - 密码：6-50个字符

#### 登录
- **接口**: `POST /api/players/login`
- **请求体**:
  ```json
  {
    "username": "玩家用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "id": 1,
      "username": "玩家用户名",
      "coins": 1000,
      "gems": 100,
      "level": 1,
      "exp": 0,
      "pvpRank": 0,
      "pvpPoints": 1000
    }
  }
  ```

#### 其他接口
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
- `players` - 玩家账户（包含用户名、加密密码、金币、宝石、等级等）
- `player_heroes` - 玩家拥有的英雄
- `battles` - 战斗记录
- `skills` - 技能定义
- `hero_skills` - 英雄技能关联

### 玩家账号系统

- **密码加密**: 使用bcrypt进行密码哈希加密（salt rounds = 10）
- **账号存储**: 玩家账号信息存储在`players`表中
- **登录验证**: 通过验证数据库中的用户名和加密密码进行登录
- **安全特性**:
  - 密码使用bcrypt加密存储，不会明文保存
  - 用户名唯一性验证
  - 输入格式验证（用户名长度、字符限制等）

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
