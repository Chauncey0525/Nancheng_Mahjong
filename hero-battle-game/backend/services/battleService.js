const { getDB } = require('../database');
const battleEngine = require('./battleEngine');

// 内存中存储进行中的战斗（生产环境应使用Redis等）
const activeBattles = new Map();

/**
 * 开始战斗
 */
async function startBattle({ playerId, playerTeam, opponentType, opponentId, opponentTeam }) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        // 创建战斗实例
        const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const battle = {
            id: battleId,
            playerId,
            playerTeam: playerTeam || [],
            opponentType, // 'player' | 'ai' | 'pve'
            opponentId,
            opponentTeam: opponentTeam || [],
            turn: 0,
            status: 'active',
            battleLog: []
        };
        
        // 初始化战斗状态
        battleEngine.initializeBattle(battle);
        
        // 存储到内存
        activeBattles.set(battleId, battle);
        
        // 保存到数据库
        db.run(
            `INSERT INTO battles (player_id, battle_type, opponent_type, opponent_id, player_team, opponent_team, result, battle_log)
             VALUES (?, ?, ?, ?, ?, ?, 'ongoing', ?)`,
            [
                playerId,
                opponentType === 'pve' ? 'pve' : opponentType === 'ai' ? 'pve_arena' : 'pvp',
                opponentType,
                opponentId,
                JSON.stringify(playerTeam),
                JSON.stringify(opponentTeam),
                JSON.stringify(battle.battleLog)
            ],
            function(err) {
                if (err) {
                    activeBattles.delete(battleId);
                    db.close();
                    return reject(err);
                }
                
                battle.dbId = this.lastID;
                db.close();
                resolve(battle);
            }
        );
    });
}

/**
 * 执行战斗回合
 */
async function executeTurn(battleId, action) {
    const battle = activeBattles.get(battleId);
    if (!battle) {
        throw new Error('战斗不存在或已结束');
    }
    
    if (battle.status !== 'active') {
        throw new Error('战斗已结束');
    }
    
    // 执行战斗逻辑
    const result = battleEngine.executeTurn(battle, action);
    
    // 如果战斗结束，更新数据库
    if (result.status === 'finished') {
        const db = getDB();
        db.run(
            `UPDATE battles SET result = ?, battle_log = ? WHERE id = ?`,
            [result.winner, JSON.stringify(result.battleLog), battle.dbId],
            () => {
                db.close();
                activeBattles.delete(battleId);
            }
        );
    } else {
        // 更新内存中的战斗状态
        activeBattles.set(battleId, battle);
    }
    
    return result;
}

/**
 * 获取战斗历史记录
 */
async function getBattleHistory(playerId) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.all(`
            SELECT id, battle_type, opponent_type, result, created_at
            FROM battles
            WHERE player_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        `, [playerId], (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => ({
                    id: row.id,
                    battleType: row.battle_type,
                    opponentType: row.opponent_type,
                    result: row.result,
                    createdAt: row.created_at
                })));
            }
        });
    });
}

module.exports = {
    startBattle,
    executeTurn,
    getBattleHistory
};
