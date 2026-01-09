const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'game.db');

function getDB() {
    console.log('[数据库] 创建数据库连接，路径:', DB_PATH);
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('[数据库] 连接失败:', err.message);
            console.error('[数据库] 错误详情:', err);
        } else {
            console.log('[数据库] 连接成功');
        }
    });
    return db;
}

function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        db.serialize(() => {
            // 英雄基础信息表（宝可梦风格属性系统）
            db.run(`
                CREATE TABLE IF NOT EXISTS heroes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    dynasty TEXT,
                    title TEXT,
                    bio TEXT,
                    gender TEXT NOT NULL DEFAULT '男',
                    element TEXT NOT NULL DEFAULT '普通',
                    role TEXT NOT NULL DEFAULT '战士',
                    base_hp INTEGER NOT NULL DEFAULT 100,
                    base_phys_atk INTEGER NOT NULL DEFAULT 50,
                    base_magic_atk INTEGER NOT NULL DEFAULT 50,
                    base_phys_def INTEGER NOT NULL DEFAULT 50,
                    base_magic_def INTEGER NOT NULL DEFAULT 50,
                    base_speed INTEGER NOT NULL DEFAULT 50,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 玩家表
            db.run(`
                CREATE TABLE IF NOT EXISTS players (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    coins INTEGER NOT NULL DEFAULT 1000,
                    gems INTEGER NOT NULL DEFAULT 100,
                    level INTEGER NOT NULL DEFAULT 1,
                    exp INTEGER NOT NULL DEFAULT 0,
                    pvp_rank INTEGER NOT NULL DEFAULT 0,
                    pvp_points INTEGER NOT NULL DEFAULT 1000,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME
                )
            `);

            // 玩家拥有的英雄表（宝可梦风格属性）
            db.run(`
                CREATE TABLE IF NOT EXISTS player_heroes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id INTEGER NOT NULL,
                    hero_id INTEGER NOT NULL,
                    level INTEGER NOT NULL DEFAULT 1,
                    exp INTEGER NOT NULL DEFAULT 0,
                    hp INTEGER NOT NULL,
                    phys_atk INTEGER NOT NULL,
                    magic_atk INTEGER NOT NULL,
                    phys_def INTEGER NOT NULL,
                    magic_def INTEGER NOT NULL,
                    speed INTEGER NOT NULL,
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                    FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE,
                    UNIQUE(player_id, hero_id)
                )
            `);

            // 战斗记录表
            db.run(`
                CREATE TABLE IF NOT EXISTS battles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id INTEGER,
                    battle_type TEXT NOT NULL,
                    opponent_type TEXT NOT NULL,
                    opponent_id INTEGER,
                    result TEXT NOT NULL,
                    player_team TEXT NOT NULL,
                    opponent_team TEXT NOT NULL,
                    battle_log TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
                )
            `);


            // 创建索引
            db.run(`CREATE INDEX IF NOT EXISTS idx_player_username ON players(username)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_player_heroes_player ON player_heroes(player_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_player_heroes_hero ON player_heroes(hero_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_battles_player ON battles(player_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_heroes_element ON heroes(element)`);
            
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('数据库表结构初始化完成');
                    resolve();
                }
            });
        });
    });
}

module.exports = {
    getDB,
    initDatabase
};
