const express = require('express');
const router = express.Router();
const playerService = require('../services/playerService');

// 注册
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }
        const player = await playerService.register(username, password);
        res.json(player);
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({ error: error.message || '注册失败' });
    }
});

// 登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }
        const player = await playerService.login(username, password);
        if (!player) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }
        res.json(player);
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ error: '登录失败' });
    }
});

// 获取玩家信息
router.get('/:id', async (req, res) => {
    try {
        const player = await playerService.getPlayerById(req.params.id);
        if (!player) {
            return res.status(404).json({ error: '玩家不存在' });
        }
        res.json(player);
    } catch (error) {
        console.error('获取玩家信息失败:', error);
        res.status(500).json({ error: '获取玩家信息失败' });
    }
});

// 获取玩家的英雄列表
router.get('/:id/heroes', async (req, res) => {
    try {
        const heroes = await playerService.getPlayerHeroes(req.params.id);
        res.json(heroes);
    } catch (error) {
        console.error('获取玩家英雄列表失败:', error);
        res.status(500).json({ error: '获取玩家英雄列表失败' });
    }
});

module.exports = router;
