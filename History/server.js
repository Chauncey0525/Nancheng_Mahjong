const express = require('express');
const cors = require('cors');
const path = require('path');
const { getAllEmperors, searchEmperor, getWeights, getAllDynasties } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API路由

// 获取所有皇帝（已排序）
app.get('/api/emperors', async (req, res) => {
    try {
        const dynasty = req.query.dynasty || null;
        const emperors = await getAllEmperors(dynasty);
        res.json(emperors);
    } catch (error) {
        console.error('获取皇帝列表失败:', error);
        res.status(500).json({ error: '获取皇帝列表失败' });
    }
});

// 获取所有朝代列表
app.get('/api/dynasties', async (req, res) => {
    try {
        const dynasties = await getAllDynasties();
        res.json(dynasties);
    } catch (error) {
        console.error('获取朝代列表失败:', error);
        res.status(500).json({ error: '获取朝代列表失败' });
    }
});

// 搜索皇帝
app.get('/api/emperors/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query) {
            return res.json([]);
        }
        const emperors = await searchEmperor(query);
        res.json(emperors);
    } catch (error) {
        console.error('搜索皇帝失败:', error);
        res.status(500).json({ error: '搜索失败' });
    }
});

// 获取权重配置
app.get('/api/weights', async (req, res) => {
    try {
        const weights = await getWeights();
        res.json(weights);
    } catch (error) {
        console.error('获取权重配置失败:', error);
        res.status(500).json({ error: '获取权重配置失败' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API端点:`);
    console.log(`  GET /api/emperors - 获取所有皇帝`);
    console.log(`  GET /api/emperors?dynasty=朝代名 - 按朝代筛选皇帝`);
    console.log(`  GET /api/dynasties - 获取所有朝代列表`);
    console.log(`  GET /api/emperors/search?q=关键词 - 搜索皇帝`);
    console.log(`  GET /api/weights - 获取权重配置`);
});
