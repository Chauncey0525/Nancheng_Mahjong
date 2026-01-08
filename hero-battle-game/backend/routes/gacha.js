const express = require('express');
const router = express.Router();
const gachaService = require('../services/gachaService');

// 单抽
router.post('/single', async (req, res) => {
    try {
        const { playerId, useGems } = req.body;
        const result = await gachaService.singlePull(playerId, useGems !== false);
        res.json(result);
    } catch (error) {
        console.error('单抽失败:', error);
        res.status(500).json({ error: error.message || '单抽失败' });
    }
});

// 十连抽
router.post('/multi', async (req, res) => {
    try {
        const { playerId, useGems } = req.body;
        const result = await gachaService.multiPull(playerId, useGems !== false);
        res.json(result);
    } catch (error) {
        console.error('十连抽失败:', error);
        res.status(500).json({ error: error.message || '十连抽失败' });
    }
});

module.exports = router;
