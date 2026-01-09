const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log(`[请求] 完整URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.log(`[请求] 查询参数:`, req.query);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('[请求] 请求体:', JSON.stringify(req.body));
    }
    next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('[服务器] 未处理的错误:', err);
    console.error('[服务器] 错误堆栈:', err.stack);
    res.status(500).json({ 
        success: false,
        error: '服务器内部错误' 
    });
});

// 导入路由
const heroRoutes = require('./routes/heroes');
const playerRoutes = require('./routes/players');
const battleRoutes = require('./routes/battles');
const gachaRoutes = require('./routes/gacha');

// 健康检查（放在路由之前，避免被404处理捕获）
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
});

// 使用路由
app.use('/api/heroes', heroRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/gacha', gachaRoutes);

// 404处理 - 捕获所有未匹配的API路由（放在所有路由之后）
app.use('/api/*', (req, res) => {
    console.log(`[404] 未匹配的路由: ${req.method} ${req.originalUrl}`);
    console.log(`[404] 请求路径: ${req.path}`);
    res.status(404).json({ 
        success: false,
        error: `API端点不存在: ${req.method} ${req.originalUrl}` 
    });
});

// 初始化数据库并启动服务器
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`游戏服务器运行在 http://localhost:${PORT}`);
        console.log(`API端点:`);
        console.log(`  GET /api/health - 健康检查`);
        console.log(`  /api/heroes - 英雄相关API`);
        console.log(`  /api/players - 玩家相关API`);
        console.log(`  /api/battles - 战斗相关API`);
        console.log(`  /api/gacha - 抽卡相关API`);
    });
}).catch(err => {
    console.error('数据库初始化失败:', err);
    process.exit(1);
});
