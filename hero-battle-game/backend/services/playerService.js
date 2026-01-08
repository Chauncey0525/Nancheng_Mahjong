const { getDB } = require('../database');
const crypto = require('crypto');
const heroService = require('./heroService');

/**
 * 注册新玩家
 */
async function register(username, password) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        // 检查用户名是否已存在
        db.get('SELECT id FROM players WHERE username = ?', [username], (err, row) => {
            if (err) {
                db.close();
                return reject(err);
            }
            
            if (row) {
                db.close();
                return reject(new Error('用户名已存在'));
            }
            
            // 加密密码（简单哈希，生产环境应使用bcrypt）
            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
            
            // 创建玩家
            db.run(
                'INSERT INTO players (username, password) VALUES (?, ?)',
                [username, hashedPassword],
                function(insertErr) {
                    if (insertErr) {
                        db.close();
                        return reject(insertErr);
                    }
                    
                    const playerId = this.lastID;
                    db.get('SELECT id, username, coins, gems, level, exp, pvp_rank, pvp_points FROM players WHERE id = ?', 
                        [playerId], (selectErr, player) => {
                        db.close();
                        if (selectErr) {
                            reject(selectErr);
                        } else {
                            resolve({
                                id: player.id,
                                username: player.username,
                                coins: player.coins,
                                gems: player.gems,
                                level: player.level,
                                exp: player.exp,
                                pvpRank: player.pvp_rank,
                                pvpPoints: player.pvp_points
                            });
                        }
                    });
                }
            );
        });
    });
}

/**
 * 玩家登录
 */
async function login(username, password) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        
        db.get(
            'SELECT id, username, coins, gems, level, exp, pvp_rank, pvp_points FROM players WHERE username = ? AND password = ?',
            [username, hashedPassword],
            (err, row) => {
                if (err) {
                    db.close();
                    return reject(err);
                }
                
                if (!row) {
                    db.close();
                    return resolve(null);
                }
                
                // 更新最后登录时间
                db.run('UPDATE players SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [row.id], () => {
                    db.close();
                    resolve({
                        id: row.id,
                        username: row.username,
                        coins: row.coins,
                        gems: row.gems,
                        level: row.level,
                        exp: row.exp,
                        pvpRank: row.pvp_rank,
                        pvpPoints: row.pvp_points
                    });
                });
            }
        );
    });
}

/**
 * 根据ID获取玩家信息
 */
async function getPlayerById(playerId) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.get(
            'SELECT id, username, coins, gems, level, exp, pvp_rank, pvp_points, created_at, last_login FROM players WHERE id = ?',
            [playerId],
            (err, row) => {
                db.close();
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(null);
                } else {
                    resolve({
                        id: row.id,
                        username: row.username,
                        coins: row.coins,
                        gems: row.gems,
                        level: row.level,
                        exp: row.exp,
                        pvpRank: row.pvp_rank,
                        pvpPoints: row.pvp_points,
                        createdAt: row.created_at,
                        lastLogin: row.last_login
                    });
                }
            }
        );
    });
}

/**
 * 获取玩家拥有的英雄列表
 */
async function getPlayerHeroes(playerId) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.all(`
            SELECT 
                ph.id,
                ph.player_id as playerId,
                ph.hero_id as heroId,
                ph.level,
                ph.exp,
                ph.hp,
                ph.atk,
                ph.def,
                ph.spd,
                h.name,
                h.element,
                h.star,
                h.dynasty,
                h.temple_name as templeName,
                h.posthumous_name as posthumousName,
                h.era_name as eraName,
                h.bio
            FROM player_heroes ph
            JOIN heroes h ON ph.hero_id = h.id
            WHERE ph.player_id = ?
            ORDER BY ph.level DESC, h.star DESC
        `, [playerId], (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                const heroes = rows.map(row => ({
                    id: row.id,
                    playerId: row.playerId,
                    heroId: row.heroId,
                    level: row.level,
                    exp: row.exp,
                    stats: {
                        hp: row.hp,
                        atk: row.atk,
                        def: row.def,
                        spd: row.spd
                    },
                    hero: {
                        id: row.heroId,
                        name: row.name,
                        element: row.element,
                        star: row.star,
                        dynasty: row.dynasty,
                        templeName: row.templeName,
                        posthumousName: row.posthumousName,
                        eraName: row.eraName,
                        bio: row.bio
                    }
                }));
                resolve(heroes);
            }
        });
    });
}

/**
 * 给玩家添加英雄
 */
async function addHeroToPlayer(playerId, heroId, level = 1) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        // 获取英雄基础信息
        heroService.getHeroById(heroId).then(hero => {
            if (!hero) {
                db.close();
                return reject(new Error('英雄不存在'));
            }
            
            // 计算属性值
            const stats = heroService.calculateHeroStats(hero, level);
            
            // 检查玩家是否已拥有该英雄
            db.get('SELECT id FROM player_heroes WHERE player_id = ? AND hero_id = ?', 
                [playerId, heroId], (err, existing) => {
                if (err) {
                    db.close();
                    return reject(err);
                }
                
                if (existing) {
                    db.close();
                    return reject(new Error('玩家已拥有该英雄'));
                }
                
                // 添加英雄
                db.run(
                    `INSERT INTO player_heroes (player_id, hero_id, level, exp, hp, atk, def, spd) 
                     VALUES (?, ?, ?, 0, ?, ?, ?, ?)`,
                    [playerId, heroId, level, stats.hp, stats.atk, stats.def, stats.spd],
                    function(insertErr) {
                        db.close();
                        if (insertErr) {
                            reject(insertErr);
                        } else {
                            resolve(this.lastID);
                        }
                    }
                );
            });
        }).catch(reject);
    });
}

module.exports = {
    register,
    login,
    getPlayerById,
    getPlayerHeroes,
    addHeroToPlayer
};
