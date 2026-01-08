const express = require('express');
const router = express.Router();
const { getDB } = require('../database');
const heroService = require('../services/heroService');

// 获取所有英雄
router.get('/', async (req, res) => {
    try {
        const heroes = await heroService.getAllHeroes();
        res.json(heroes);
    } catch (error) {
        console.error('获取英雄列表失败:', error);
        res.status(500).json({ error: '获取英雄列表失败' });
    }
});

// 获取单个英雄详情
router.get('/:id', async (req, res) => {
    try {
        const hero = await heroService.getHeroById(req.params.id);
        if (!hero) {
            return res.status(404).json({ error: '英雄不存在' });
        }
        res.json(hero);
    } catch (error) {
        console.error('获取英雄详情失败:', error);
        res.status(500).json({ error: '获取英雄详情失败' });
    }
});

// 搜索英雄
router.get('/search/:query', async (req, res) => {
    try {
        const heroes = await heroService.searchHeroes(req.params.query);
        res.json(heroes);
    } catch (error) {
        console.error('搜索英雄失败:', error);
        res.status(500).json({ error: '搜索失败' });
    }
});

module.exports = router;
