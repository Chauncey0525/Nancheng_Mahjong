# 古代皇帝评分排名系统

一个基于多维度指标评价古代皇帝的综合排名系统，包含美观的Web前端界面和Node.js后端API。

## 功能特点

- 🏆 **综合评分系统**：基于11个维度的加权评分
- 🔍 **智能搜索**：支持皇帝姓名、庙号、年号、谥号搜索，带自动补全建议
- 📊 **详细展示**：显示每项评分、权重和总分
- 📜 **历史信息**：提供皇帝简介和生平事迹
- 🎨 **现代UI**：美观的渐变设计和响应式布局
- 📄 **分页浏览**：支持分页查看所有皇帝排名
- 💾 **数据库存储**：使用SQLite数据库，便于数据管理和扩展

## 评分指标及权重

| 指标 | 权重 |
|------|------|
| 德 | 20% |
| 智 | 15% |
| 体 | 2% |
| 美 | 1% |
| 劳 | 1% |
| 国力 | 20% |
| 民心 | 15% |
| 雄心 | 3% |
| 人事管理 | 10% |
| 心胸气量 | 3% |
| 后世影响 | 10% |

## 快速开始

### 前置要求

- Node.js (v14 或更高版本)
- npm (通常随 Node.js 一起安装)

### 安装步骤

#### 1. 安装 Node.js（如果尚未安装）

如果遇到 `npm : 无法将"npm"项识别为 cmdlet、函数、脚本文件或可运行程序的名称` 错误，说明需要安装 Node.js。

**方法1：从官网安装（推荐）**

1. 访问 Node.js 官网：https://nodejs.org/
2. 下载 LTS（长期支持版本）
3. 运行安装程序，确保勾选 "Add to PATH" 选项
4. 重新打开 PowerShell，验证安装：
   ```powershell
   node --version
   npm --version
   ```

**方法2：使用包管理器**

- Chocolatey: `choco install nodejs`
- Winget: `winget install OpenJS.NodeJS.LTS`

#### 2. 安装项目依赖

```bash
cd History
npm install
```

#### 3. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动

#### 4. 访问应用

在浏览器中打开 `http://localhost:3000`

**注意**：数据库文件 `emperors.db` 已包含所有数据（193个皇帝），无需初始化。

## 使用方法

### 搜索皇帝

在搜索框输入皇帝姓名、庙号、年号或谥号，例如：
- 姓名：`李世民`、`刘邦`、`爱新觉罗·玄烨`
- 庙号：`唐太宗`、`清圣祖`
- 年号：`康熙`、`乾隆`
- 谥号：`文皇帝`、`高皇帝`

### 查看排行榜

- 默认显示 TOP 10 皇帝
- 使用分页按钮浏览所有皇帝（每页10个）
- 点击任意皇帝查看详细信息

### 查看详情

点击排行榜中的皇帝或搜索后，可以查看：
- 综合排名和总分
- 各项指标评分详情
- 皇帝简介和生平事迹

## 项目结构

### 前端文件

- `index.html` - 主页面结构
- `style.css` - 样式文件
- `app.js` - 前端交互逻辑和功能实现
- `data-api.js` - 前端API数据获取模块

### 后端文件

- `server.js` - Express后端服务器和API
- `database.js` - 数据库操作模块
- `package.json` - Node.js项目配置
- `emperors.db` - SQLite数据库文件（已包含193个皇帝数据）

### 辅助文件

- `start-server.bat` - Windows批处理启动脚本
- `start-server.ps1` - PowerShell启动脚本
- `add-nodejs-to-path.ps1` - Node.js PATH配置脚本

## API端点

- `GET /api/emperors` - 获取所有皇帝（已按总分排序）
- `GET /api/emperors/search?q=关键词` - 搜索皇帝
- `GET /api/weights` - 获取权重配置

## 数据库结构

### weights 表
- `id` - 主键
- `metric` - 指标名称（如"德"、"智"等）
- `weight` - 权重值

### emperors 表
- `id` - 主键
- `name` - 皇帝姓名
- `intro` - 简介
- `bio` - 生平事迹
- `total_score` - 总分（已计算）
- `created_at` - 创建时间

### aliases 表
- `id` - 主键
- `emperor_id` - 外键，关联emperors表
- `alias` - 别名（庙号、年号、谥号等）

### scores 表
- `id` - 主键
- `emperor_id` - 外键，关联emperors表
- `metric` - 指标名称
- `score` - 分数

## 开发模式

使用nodemon自动重启服务器：

```bash
npm run dev
```

## 技术栈

### 前端
- HTML5
- CSS3 (渐变、动画、响应式设计)
- 原生JavaScript (ES6+)

### 后端
- Node.js
- Express.js
- SQLite3

## 常见问题

### 问题1：npm 命令无法识别

**解决方案**：
1. 确保已安装 Node.js（见上方安装步骤）
2. 关闭并重新打开 PowerShell
3. 检查 PATH 环境变量是否包含 Node.js 路径：
   ```powershell
   $env:PATH -split ';' | Select-String -Pattern 'node'
   ```

### 问题2：端口3000已被占用

**解决方案**：
- 修改 `server.js` 中的端口号，或
- 关闭占用3000端口的其他程序

### 问题3：数据库文件缺失

**解决方案**：
- 数据库文件 `emperors.db` 应该已包含在项目中
- 如果缺失，请从备份或Git历史中恢复

## 注意事项

1. **数据库文件**：`emperors.db`文件包含所有数据（193个皇帝），建议定期备份
2. **CORS**：服务器已配置CORS，允许跨域请求
3. **静态文件**：服务器同时提供静态文件服务，可以直接访问HTML文件
4. **数据来源**：数据已从JavaScript文件迁移到数据库，提供更好的数据管理和扩展性

## 项目优势

1. **数据管理**：使用SQL查询，便于数据管理和维护
2. **性能优化**：数据库索引提高查询速度
3. **可扩展性**：易于添加新功能（如数据统计、筛选等）
4. **数据持久化**：数据存储在数据库中，便于备份和恢复
5. **API接口**：可以轻松扩展为多端应用（Web、移动端等）

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge等）

## 许可证

MIT
