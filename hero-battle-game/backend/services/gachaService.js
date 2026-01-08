const { getDB } = require('../database');
const playerService = require('./playerService');

// 抽卡概率配置（按星级）
const GACHA_RATES = {
    5: 0.01,  // 1% 五星
    4: 0.09,  // 9% 四星
    3: 0.30,  // 30% 三星
    2: 0.40,  // 40% 二星
    1: 0.20   // 20% 一星
};

// 单抽消耗
const SINGLE_PULL_COST_COINS = 100;
const SINGLE_PULL_COST_GEMS = 10;

// 十连抽消耗（有折扣）
const MULTI_PULL_COST_COINS = 900;
const MULTI_PULL_COST_GEMS = 90;

/**
 * 根据概率抽取星级
 */
function rollStar() {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [star, rate] of Object.entries(GACHA_RATES).sort((a, b) => b[0] - a[0])) {
        cumulative += rate;
        if (rand <= cumulative) {
            return parseInt(star);
        }
    }
    
    return 1; // 默认一星
}

/**
 * 根据星级随机选择英雄
 */
async function getRandomHeroByStar(star) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.all(
            'SELECT id FROM heroes WHERE star = ? ORDER BY RANDOM() LIMIT 1',
            [star],
            (err, rows) => {
                db.close();
                if (err) {
                    reject(err);
                } else if (rows.length === 0) {
                    // 如果没有该星级的英雄，降级查找
                    db.all(
                        'SELECT id FROM heroes WHERE star <= ? ORDER BY star DESC, RANDOM() LIMIT 1',
                        [star],
                        (err2, rows2) => {
                            if (err2 || rows2.length === 0) {
                                reject(new Error('卡池中没有可用英雄'));
                            } else {
                                resolve(rows2[0].id);
                            }
                        }
                    );
                } else {
                    resolve(rows[0].id);
                }
            }
        );
    });
}

/**
 * 单抽
 */
async function singlePull(playerId, useGems = false) {
    return new Promise(async (resolve, reject) => {
        const db = getDB();
        
        try {
            // 检查玩家资源
            const player = await playerService.getPlayerById(playerId);
            if (!player) {
                return reject(new Error('玩家不存在'));
            }
            
            const cost = useGems ? SINGLE_PULL_COST_GEMS : SINGLE_PULL_COST_COINS;
            const resource = useGems ? 'gems' : 'coins';
            
            if (player[resource] < cost) {
                return reject(new Error(`资源不足，需要${cost}${useGems ? '宝石' : '金币'}`));
            }
            
            // 扣除资源
            db.run(
                `UPDATE players SET ${resource} = ${resource} - ? WHERE id = ?`,
                [cost, playerId],
                async (err) => {
                    if (err) {
                        db.close();
                        return reject(err);
                    }
                    
                    // 抽取英雄
                    const star = rollStar();
                    const heroId = await getRandomHeroByStar(star);
                    
                    // 添加到玩家英雄列表
                    try {
                        await playerService.addHeroToPlayer(playerId, heroId, 1);
                        
                        db.close();
                        resolve({
                            success: true,
                            heroId: heroId,
                            star: star,
                            cost: cost,
                            resource: resource
                        });
                    } catch (addErr) {
                        // 如果添加失败，可能是已拥有，返回英雄信息但不添加
                        db.close();
                        resolve({
                            success: true,
                            heroId: heroId,
                            star: star,
                            cost: cost,
                            resource: resource,
                            alreadyOwned: true
                        });
                    }
                }
            );
        } catch (error) {
            db.close();
            reject(error);
        }
    });
}

/**
 * 十连抽
 */
async function multiPull(playerId, useGems = false) {
    return new Promise(async (resolve, reject) => {
        const db = getDB();
        
        try {
            // 检查玩家资源
            const player = await playerService.getPlayerById(playerId);
            if (!player) {
                return reject(new Error('玩家不存在'));
            }
            
            const cost = useGems ? MULTI_PULL_COST_GEMS : MULTI_PULL_COST_COINS;
            const resource = useGems ? 'gems' : 'coins';
            
            if (player[resource] < cost) {
                return reject(new Error(`资源不足，需要${cost}${useGems ? '宝石' : '金币'}`));
            }
            
            // 扣除资源
            db.run(
                `UPDATE players SET ${resource} = ${resource} - ? WHERE id = ?`,
                [cost, playerId],
                async (err) => {
                    if (err) {
                        db.close();
                        return reject(err);
                    }
                    
                    // 抽取10个英雄
                    const results = [];
                    for (let i = 0; i < 10; i++) {
                        const star = rollStar();
                        const heroId = await getRandomHeroByStar(star);
                        
                        try {
                            await playerService.addHeroToPlayer(playerId, heroId, 1);
                            results.push({
                                heroId: heroId,
                                star: star,
                                alreadyOwned: false
                            });
                        } catch (addErr) {
                            results.push({
                                heroId: heroId,
                                star: star,
                                alreadyOwned: true
                            });
                        }
                    }
                    
                    db.close();
                    resolve({
                        success: true,
                        results: results,
                        cost: cost,
                        resource: resource
                    });
                }
            );
        } catch (error) {
            db.close();
            reject(error);
        }
    });
}

module.exports = {
    singlePull,
    multiPull
};
