const express = require('express');
const router = express.Router();
const playerService = require('../services/playerService');

// 注册
router.post('/register', async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('[路由] 收到注册请求:', JSON.stringify(req.body));
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('[路由] 请求参数不完整');
            return res.status(400).json({ 
                success: false,
                error: '用户名和密码不能为空' 
            });
        }
        
        console.log('[路由] 开始调用playerService.register，用户名:', username);
        const player = await playerService.register(username, password);
        const duration = Date.now() - startTime;
        console.log(`[路由] 注册成功，用户ID: ${player.id}，耗时: ${duration}ms`);
        
        res.status(201).json({
            success: true,
            message: '注册成功',
            data: player
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[路由] 注册失败，耗时: ${duration}ms`);
        console.error('[路由] 错误信息:', error.message);
        console.error('[路由] 错误堆栈:', error.stack);
        
        // 如果是用户名已存在等业务错误，返回400；其他错误返回500
        const statusCode = error.message.includes('已存在') || error.message.includes('长度') || error.message.includes('格式') ? 400 : 500;
        res.status(statusCode).json({ 
            success: false,
            error: error.message || '注册失败' 
        });
    }
});

// 登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: '用户名和密码不能为空' 
            });
        }
        const player = await playerService.login(username, password);
        if (!player) {
            return res.status(401).json({ 
                success: false,
                error: '用户名或密码错误' 
            });
        }
        res.json({
            success: true,
            message: '登录成功',
            data: player
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || '登录失败' 
        });
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
