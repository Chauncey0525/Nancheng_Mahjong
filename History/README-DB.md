# 数据库迁移说明

## 概述

项目已从JavaScript数据文件迁移到SQLite数据库，提供更好的数据管理和可扩展性。

## 文件结构

- `database.js` - 数据库操作模块
- `server.js` - Express后端服务器和API
- `init-db.js` - 数据库初始化脚本（将data.js中的数据导入数据库）
- `data-api.js` - 前端API数据获取模块（替代原来的data.js）
- `package.json` - Node.js项目配置
- `emperors.db` - SQLite数据库文件（运行init-db.js后生成）

## 安装步骤

### 1. 安装依赖

```bash
cd History
npm install
```

### 2. 初始化数据库

```bash
npm run init-db
```

这将：
- 创建数据库表结构
- 从`data.js`读取数据并导入到数据库
- 生成`emperors.db`文件

### 3. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动

### 4. 访问应用

在浏览器中打开 `http://localhost:3000`

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

## 注意事项

1. **数据备份**：`data.js`文件已保留作为备份，但前端不再直接使用它
2. **数据库文件**：`emperors.db`文件包含所有数据，建议加入版本控制或定期备份
3. **CORS**：服务器已配置CORS，允许跨域请求
4. **静态文件**：服务器同时提供静态文件服务，可以直接访问HTML文件

## 迁移优势

1. **数据管理**：使用SQL查询，便于数据管理和维护
2. **性能优化**：数据库索引提高查询速度
3. **可扩展性**：易于添加新功能（如数据统计、筛选等）
4. **数据持久化**：数据存储在数据库中，便于备份和恢复
5. **API接口**：可以轻松扩展为多端应用（Web、移动端等）
