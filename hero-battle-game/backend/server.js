const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 导入路由
const heroRoutes = require('./routes/heroes');
const playerRoutes = require('./routes/players');
const battleRoutes = require('./routes/battles');
const gachaRoutes = require('./routes/gacha');

// 使用路由
app.use('/api/heroes', heroRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/gacha', gachaRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
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
