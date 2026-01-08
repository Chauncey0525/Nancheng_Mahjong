const express = require('express');
const router = express.Router();
const battleService = require('../services/battleService');

// 开始战斗
router.post('/start', async (req, res) => {
    try {
        const { playerId, playerTeam, opponentType, opponentId, opponentTeam } = req.body;
        const battle = await battleService.startBattle({
            playerId,
            playerTeam,
            opponentType,
            opponentId,
            opponentTeam
        });
        res.json(battle);
    } catch (error) {
        console.error('开始战斗失败:', error);
        res.status(500).json({ error: error.message || '开始战斗失败' });
    }
});

// 执行战斗回合
router.post('/turn', async (req, res) => {
    try {
        const { battleId, action } = req.body;
        const result = await battleService.executeTurn(battleId, action);
        res.json(result);
    } catch (error) {
        console.error('执行战斗回合失败:', error);
        res.status(500).json({ error: error.message || '执行战斗回合失败' });
    }
});

// 获取战斗记录
router.get('/history/:playerId', async (req, res) => {
    try {
        const battles = await battleService.getBattleHistory(req.params.playerId);
        res.json(battles);
    } catch (error) {
        console.error('获取战斗记录失败:', error);
        res.status(500).json({ error: '获取战斗记录失败' });
    }
});

module.exports = router;
