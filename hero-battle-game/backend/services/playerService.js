const { getDB } = require('../database');
const bcrypt = require('bcrypt');
const heroService = require('./heroService');

/**
 * 验证用户名格式
 */
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: '用户名不能为空' };
    }
    if (username.length < 3 || username.length > 20) {
        return { valid: false, error: '用户名长度必须在3-20个字符之间' };
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
        return { valid: false, error: '用户名只能包含字母、数字、下划线和中文' };
    }
    return { valid: true };
}

/**
 * 验证密码格式
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: '密码不能为空' };
    }
    if (password.length < 6 || password.length > 50) {
        return { valid: false, error: '密码长度必须在6-50个字符之间' };
    }
    return { valid: true };
}

/**
 * 注册新玩家
 */
async function register(username, password) {
    return new Promise(async (resolve, reject) => {
        console.log('[playerService] 开始注册流程，用户名:', username);
        
        // 验证用户名
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            console.log('[playerService] 用户名验证失败:', usernameValidation.error);
            return reject(new Error(usernameValidation.error));
        }
        
        // 验证密码
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            console.log('[playerService] 密码验证失败:', passwordValidation.error);
            return reject(new Error(passwordValidation.error));
        }
        
        const db = getDB();
        console.log('[playerService] 数据库连接已建立');
        
        try {
            // 检查用户名是否已存在
            console.log('[playerService] 检查用户名是否已存在...');
            const existingUser = await new Promise((resolveQuery, rejectQuery) => {
                db.get('SELECT id FROM players WHERE username = ?', [username], (err, row) => {
                    if (err) {
                        console.error('[playerService] 查询用户名失败:', err);
                        rejectQuery(err);
                    } else {
                        console.log('[playerService] 用户名查询完成，结果:', row ? '已存在' : '不存在');
                        resolveQuery(row);
                    }
                });
            });
            
            if (existingUser) {
                console.log('[playerService] 用户名已存在，关闭数据库连接');
                db.close();
                return reject(new Error('用户名已存在'));
            }
            
            // 使用bcrypt加密密码（salt rounds = 10）
            console.log('[playerService] 开始加密密码...');
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('[playerService] 密码加密完成');
            
            // 创建玩家
            console.log('[playerService] 开始插入新用户...');
            const insertResult = await new Promise((resolveInsert, rejectInsert) => {
                db.run(
                    'INSERT INTO players (username, password) VALUES (?, ?)',
                    [username, hashedPassword],
                    function(insertErr) {
                        if (insertErr) {
                            console.error('[playerService] 插入用户失败:', insertErr);
                            rejectInsert(insertErr);
                        } else {
                            console.log('[playerService] 用户插入成功，ID:', this.lastID);
                            resolveInsert(this.lastID);
                        }
                    }
                );
            });
            
            // 获取新创建的玩家信息
            console.log('[playerService] 获取新用户信息，ID:', insertResult);
            const player = await new Promise((resolveSelect, rejectSelect) => {
                db.get('SELECT id, username, coins, gems, level, exp, pvp_rank, pvp_points FROM players WHERE id = ?', 
                    [insertResult], (selectErr, row) => {
                    if (selectErr) {
                        console.error('[playerService] 获取用户信息失败:', selectErr);
                        rejectSelect(selectErr);
                    } else {
                        console.log('[playerService] 用户信息获取成功');
                        resolveSelect(row);
                    }
                });
            });
            
            console.log('[playerService] 注册流程完成，关闭数据库连接');
            db.close();
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
        } catch (err) {
            console.error('[playerService] 注册过程中发生错误:', err);
            console.error('[playerService] 错误堆栈:', err.stack);
            db.close();
            reject(err);
        }
    });
}

/**
 * 玩家登录
 */
async function login(username, password) {
    return new Promise(async (resolve, reject) => {
        // 基本验证
        if (!username || !password) {
            return reject(new Error('用户名和密码不能为空'));
        }
        
        const db = getDB();
        
        try {
            // 先查找用户
            const row = await new Promise((resolveQuery, rejectQuery) => {
                db.get(
                    'SELECT id, username, password, coins, gems, level, exp, pvp_rank, pvp_points FROM players WHERE username = ?',
                    [username],
                    (err, row) => {
                        if (err) {
                            rejectQuery(err);
                        } else {
                            resolveQuery(row);
                        }
                    }
                );
            });
            
            if (!row) {
                db.close();
                return resolve(null); // 用户名不存在
            }
            
            // 使用bcrypt验证密码
            const passwordMatch = await bcrypt.compare(password, row.password);
            
            if (!passwordMatch) {
                db.close();
                return resolve(null); // 密码错误
            }
            
            // 更新最后登录时间
            await new Promise((resolveUpdate, rejectUpdate) => {
                db.run('UPDATE players SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [row.id], (err) => {
                    if (err) {
                        rejectUpdate(err);
                    } else {
                        resolveUpdate();
                    }
                });
            });
            
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
        } catch (err) {
            db.close();
            reject(err);
        }
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
    addHeroToPlayer,
    validateUsername,
    validatePassword
};
