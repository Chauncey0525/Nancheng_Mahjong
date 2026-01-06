const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'emperors.db');

// 打开数据库连接
function getDB() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('数据库连接失败:', err.message);
        } else {
            console.log('已连接到SQLite数据库');
        }
    });
}

// 初始化数据库表结构
function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        db.serialize(() => {
            // 创建权重配置表
            db.run(`
                CREATE TABLE IF NOT EXISTS weights (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric TEXT UNIQUE NOT NULL,
                    weight REAL NOT NULL
                )
            `);
            
            // 创建皇帝表
            db.run(`
                CREATE TABLE IF NOT EXISTS emperors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    intro TEXT,
                    bio TEXT,
                    total_score REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // 创建别名表
            db.run(`
                CREATE TABLE IF NOT EXISTS aliases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    emperor_id INTEGER NOT NULL,
                    alias TEXT NOT NULL,
                    FOREIGN KEY (emperor_id) REFERENCES emperors(id) ON DELETE CASCADE,
                    UNIQUE(emperor_id, alias)
                )
            `);
            
            // 创建评分表
            db.run(`
                CREATE TABLE IF NOT EXISTS scores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    emperor_id INTEGER NOT NULL,
                    metric TEXT NOT NULL,
                    score REAL NOT NULL,
                    FOREIGN KEY (emperor_id) REFERENCES emperors(id) ON DELETE CASCADE,
                    UNIQUE(emperor_id, metric)
                )
            `);
            
            // 创建索引
            db.run(`CREATE INDEX IF NOT EXISTS idx_emperor_name ON emperors(name)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_alias_alias ON aliases(alias)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_alias_emperor ON aliases(emperor_id)`);
            
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

// 插入权重配置
function insertWeights(weights) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        db.serialize(() => {
            const stmt = db.prepare(`INSERT OR REPLACE INTO weights (metric, weight) VALUES (?, ?)`);
            
            for (const [metric, weight] of Object.entries(weights)) {
                stmt.run(metric, weight);
            }
            
            stmt.finalize((err) => {
                if (err) {
                    db.close();
                    reject(err);
                } else {
                    console.log('权重配置插入完成');
                    db.close((closeErr) => {
                        if (closeErr) {
                            reject(closeErr);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    });
}

// 插入皇帝数据
function insertEmperor(emperor, weights) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        // 计算总分
        let total = 0;
        for (const [key, value] of Object.entries(weights)) {
            total += (emperor.scores[key] || 0) * value;
        }
        
        db.serialize(() => {
            // 先查询是否已存在
            db.get(`SELECT id FROM emperors WHERE name = ?`, [emperor.name], (err, row) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }
                
                let emperorId;
                if (row) {
                    // 已存在，更新
                    emperorId = row.id;
                    db.run(
                        `UPDATE emperors SET intro = ?, bio = ?, total_score = ? WHERE id = ?`,
                        [emperor.intro, emperor.bio, total, emperorId],
                        function(updateErr) {
                            if (updateErr) {
                                db.close();
                                reject(updateErr);
                                return;
                            }
                            insertAliasesAndScores(emperorId);
                        }
                    );
                } else {
                    // 不存在，插入
                    db.run(
                        `INSERT INTO emperors (name, intro, bio, total_score) VALUES (?, ?, ?, ?)`,
                        [emperor.name, emperor.intro, emperor.bio, total],
                        function(insertErr) {
                            if (insertErr) {
                                db.close();
                                reject(insertErr);
                                return;
                            }
                            emperorId = this.lastID;
                            insertAliasesAndScores(emperorId);
                        }
                    );
                }
                
                function insertAliasesAndScores(id) {
                    // 先删除旧的别名和评分
                    db.run(`DELETE FROM aliases WHERE emperor_id = ?`, [id], (err) => {
                        if (err) {
                            db.close();
                            reject(err);
                            return;
                        }
                        
                        db.run(`DELETE FROM scores WHERE emperor_id = ?`, [id], (err) => {
                            if (err) {
                                db.close();
                                reject(err);
                                return;
                            }
                            
                            // 插入别名
                            if (emperor.aliases && emperor.aliases.length > 0) {
                                const aliasStmt = db.prepare(`INSERT INTO aliases (emperor_id, alias) VALUES (?, ?)`);
                                let aliasCount = 0;
                                emperor.aliases.forEach(alias => {
                                    aliasStmt.run(id, alias, (err) => {
                                        if (err && !err.message.includes('UNIQUE constraint')) {
                                            console.error(`插入别名失败: ${alias}`, err);
                                        }
                                    });
                                    aliasCount++;
                                });
                                aliasStmt.finalize((err) => {
                                    if (err) {
                                        db.close();
                                        reject(err);
                                        return;
                                    }
                                    insertScores(id);
                                });
                            } else {
                                insertScores(id);
                            }
                        });
                    });
                }
                
                function insertScores(id) {
                    // 插入评分
                    const scoreStmt = db.prepare(`INSERT INTO scores (emperor_id, metric, score) VALUES (?, ?, ?)`);
                    let scoreCount = 0;
                    const scoreEntries = Object.entries(emperor.scores);
                    
                    if (scoreEntries.length === 0) {
                        scoreStmt.finalize((err) => {
                            if (err) {
                                db.close();
                                reject(err);
                            } else {
                                db.close((closeErr) => {
                                    if (closeErr) {
                                        reject(closeErr);
                                    } else {
                                        resolve(id);
                                    }
                                });
                            }
                        });
                        return;
                    }
                    
                    scoreEntries.forEach(([metric, score]) => {
                        scoreStmt.run(id, metric, score, (err) => {
                            if (err && !err.message.includes('UNIQUE constraint')) {
                                console.error(`插入评分失败: ${metric}`, err);
                            }
                        });
                        scoreCount++;
                    });
                    
                    scoreStmt.finalize((err) => {
                        if (err) {
                            db.close();
                            reject(err);
                        } else {
                            db.close((closeErr) => {
                                if (closeErr) {
                                    reject(closeErr);
                                } else {
                                    resolve(id);
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}

// 获取所有皇帝（带排序）
function getAllEmperors() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        db.all(`
            SELECT 
                e.id,
                e.name,
                e.intro,
                e.bio,
                e.total_score as total,
                GROUP_CONCAT(DISTINCT a.alias) as aliases,
                GROUP_CONCAT(DISTINCT s.metric || ':' || s.score) as scores
            FROM emperors e
            LEFT JOIN aliases a ON e.id = a.emperor_id
            LEFT JOIN scores s ON e.id = s.emperor_id
            GROUP BY e.id
            ORDER BY e.total_score DESC
        `, [], (err, rows) => {
            db.close(); // 确保关闭数据库连接
            if (err) {
                reject(err);
            } else {
                // 处理数据格式
                const emperors = rows.map(row => {
                    const scores = {};
                    if (row.scores) {
                        row.scores.split(',').forEach(item => {
                            const [metric, score] = item.split(':');
                            if (metric && score) {
                                scores[metric] = parseFloat(score);
                            }
                        });
                    }
                    
                    return {
                        id: row.id,
                        name: row.name,
                        aliases: row.aliases ? row.aliases.split(',') : [],
                        scores: scores,
                        intro: row.intro,
                        bio: row.bio,
                        total: row.total
                    };
                });
                
                resolve(emperors);
            }
        });
    });
}

// 根据查询搜索皇帝
function searchEmperor(query) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        const searchTerm = `%${query}%`;
        
        db.all(`
            SELECT DISTINCT
                e.id,
                e.name,
                e.intro,
                e.bio,
                e.total_score as total,
                GROUP_CONCAT(DISTINCT a.alias) as aliases,
                GROUP_CONCAT(DISTINCT s.metric || ':' || s.score) as scores
            FROM emperors e
            LEFT JOIN aliases a ON e.id = a.emperor_id
            LEFT JOIN scores s ON e.id = s.emperor_id
            WHERE e.name LIKE ? OR a.alias LIKE ?
            GROUP BY e.id
            ORDER BY e.total_score DESC
        `, [searchTerm, searchTerm], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const emperors = rows.map(row => {
                    const scores = {};
                    if (row.scores) {
                        row.scores.split(',').forEach(item => {
                            const [metric, score] = item.split(':');
                            if (metric && score) {
                                scores[metric] = parseFloat(score);
                            }
                        });
                    }
                    
                    return {
                        id: row.id,
                        name: row.name,
                        aliases: row.aliases ? row.aliases.split(',') : [],
                        scores: scores,
                        intro: row.intro,
                        bio: row.bio,
                        total: row.total
                    };
                });
                
                resolve(emperors);
            }
            db.close();
        });
    });
}

// 获取权重配置
function getWeights() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        db.all(`SELECT metric, weight FROM weights`, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const weights = {};
                rows.forEach(row => {
                    weights[row.metric] = row.weight;
                });
                resolve(weights);
            }
            db.close();
        });
    });
}

module.exports = {
    getDB,
    initDatabase,
    insertWeights,
    insertEmperor,
    getAllEmperors,
    searchEmperor,
    getWeights
};
