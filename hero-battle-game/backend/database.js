const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'game.db');

function getDB() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('数据库连接失败:', err.message);
        }
    });
}

function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        db.serialize(() => {
            // 英雄基础信息表（从History项目的emperors表扩展）
            db.run(`
                CREATE TABLE IF NOT EXISTS heroes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    dynasty TEXT,
                    temple_name TEXT,
                    posthumous_name TEXT,
                    era_name TEXT,
                    bio TEXT,
                    birth_year TEXT,
                    death_year TEXT,
                    element TEXT NOT NULL DEFAULT '金',
                    star INTEGER NOT NULL DEFAULT 1,
                    base_hp INTEGER NOT NULL DEFAULT 100,
                    base_atk INTEGER NOT NULL DEFAULT 50,
                    base_def INTEGER NOT NULL DEFAULT 30,
                    base_spd INTEGER NOT NULL DEFAULT 40,
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

            // 玩家拥有的英雄表
            db.run(`
                CREATE TABLE IF NOT EXISTS player_heroes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id INTEGER NOT NULL,
                    hero_id INTEGER NOT NULL,
                    level INTEGER NOT NULL DEFAULT 1,
                    exp INTEGER NOT NULL DEFAULT 0,
                    hp INTEGER NOT NULL,
                    atk INTEGER NOT NULL,
                    def INTEGER NOT NULL,
                    spd INTEGER NOT NULL,
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                    FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE,
                    UNIQUE(player_id, hero_id)
                )
            `);

            // 技能表
            db.run(`
                CREATE TABLE IF NOT EXISTS skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    skill_type TEXT NOT NULL DEFAULT 'active',
                    damage_multiplier REAL NOT NULL DEFAULT 1.0,
                    cooldown INTEGER NOT NULL DEFAULT 0,
                    cost INTEGER NOT NULL DEFAULT 0,
                    effect_type TEXT,
                    effect_value REAL
                )
            `);

            // 英雄技能关联表
            db.run(`
                CREATE TABLE IF NOT EXISTS hero_skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    hero_id INTEGER NOT NULL,
                    skill_id INTEGER NOT NULL,
                    skill_level INTEGER NOT NULL DEFAULT 1,
                    FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE,
                    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
                    UNIQUE(hero_id, skill_id)
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

            // 装备表（预留）
            db.run(`
                CREATE TABLE IF NOT EXISTS equipment (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    hp_bonus INTEGER NOT NULL DEFAULT 0,
                    atk_bonus INTEGER NOT NULL DEFAULT 0,
                    def_bonus INTEGER NOT NULL DEFAULT 0,
                    spd_bonus INTEGER NOT NULL DEFAULT 0,
                    description TEXT
                )
            `);

            // 玩家装备表（预留）
            db.run(`
                CREATE TABLE IF NOT EXISTS player_equipment (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id INTEGER NOT NULL,
                    equipment_id INTEGER NOT NULL,
                    player_hero_id INTEGER,
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
                    FOREIGN KEY (player_hero_id) REFERENCES player_heroes(id) ON DELETE CASCADE
                )
            `);

            // PVE关卡表
            db.run(`
                CREATE TABLE IF NOT EXISTS pve_stages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    stage_number INTEGER NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    description TEXT,
                    enemy_team TEXT NOT NULL,
                    reward_coins INTEGER NOT NULL DEFAULT 0,
                    reward_exp INTEGER NOT NULL DEFAULT 0
                )
            `);

            // 玩家PVE进度表
            db.run(`
                CREATE TABLE IF NOT EXISTS player_pve_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id INTEGER NOT NULL,
                    stage_id INTEGER NOT NULL,
                    completed BOOLEAN NOT NULL DEFAULT 0,
                    stars INTEGER NOT NULL DEFAULT 0,
                    best_time INTEGER,
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
                    FOREIGN KEY (stage_id) REFERENCES pve_stages(id) ON DELETE CASCADE,
                    UNIQUE(player_id, stage_id)
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
