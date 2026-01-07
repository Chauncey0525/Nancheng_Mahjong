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
                    dynasty TEXT,
                    temple_name TEXT,
                    posthumous_name TEXT,
                    era_name TEXT,
                    bio TEXT,
                    birth_year TEXT,
                    death_year TEXT,
                    total_score REAL,
                    rank INTEGER,
                    dynasty_rank INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // 别名表已移除，改用emperors表的temple_name, posthumous_name, era_name字段
            
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
            db.run(`CREATE INDEX IF NOT EXISTS idx_temple_name ON emperors(temple_name)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_posthumous_name ON emperors(posthumous_name)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_era_name ON emperors(era_name)`);
            
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
                        `UPDATE emperors SET dynasty = ?, temple_name = ?, posthumous_name = ?, era_name = ?, bio = ?, total_score = ? WHERE id = ?`,
                        [emperor.dynasty || null, emperor.templeName || null, emperor.posthumousName || null, emperor.eraName || null, emperor.bio, total, emperorId],
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
                        `INSERT INTO emperors (name, dynasty, temple_name, posthumous_name, era_name, bio, total_score) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [emperor.name, emperor.dynasty || null, emperor.templeName || null, emperor.posthumousName || null, emperor.eraName || null, emperor.bio, total],
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
function getAllEmperors(dynasty = null) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        // 先获取所有皇帝，使用数据库中的rank字段作为总排名，dynasty_rank字段作为当朝排名
        let sql = `
            SELECT 
                e.id,
                e.name,
                e.dynasty,
                e.temple_name as templeName,
                e.posthumous_name as posthumousName,
                e.era_name as eraName,
                e.bio,
                e.total_score as total,
                e.rank as globalRank,
                e.dynasty_rank as dynastyRank,
                GROUP_CONCAT(DISTINCT s.metric || ':' || s.score) as scores
            FROM emperors e
            LEFT JOIN scores s ON e.id = s.emperor_id
            GROUP BY e.id
            ORDER BY e.total_score DESC
        `;
        
        db.all(sql, [], (err, allRows) => {
            if (err) {
                db.close();
                reject(err);
                return;
            }
            
            // 处理数据格式
            const allEmperors = allRows.map(row => {
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
                    dynasty: row.dynasty || '',
                    templeName: row.templeName || null,
                    posthumousName: row.posthumousName || null,
                    eraName: row.eraName || null,
                    scores: scores,
                    bio: row.bio,
                    total: row.total,
                    globalRank: row.globalRank !== null && row.globalRank !== undefined ? parseInt(row.globalRank) : null,  // 直接使用数据库中的rank字段，确保是整数
                    dynastyRank: row.dynastyRank !== null && row.dynastyRank !== undefined ? parseInt(row.dynastyRank) : null  // 直接使用数据库中的dynasty_rank字段，确保是整数
                };
            });
            
            // 如果指定了朝代，则筛选（但排名已经基于所有皇帝计算好了）
            let emperors = allEmperors;
            if (dynasty) {
                emperors = allEmperors.filter(emp => emp.dynasty === dynasty);
            }
            
            db.close();
            resolve(emperors);
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
                e.dynasty,
                e.temple_name as templeName,
                e.posthumous_name as posthumousName,
                e.era_name as eraName,
                e.bio,
                e.total_score as total,
                e.rank as globalRank,
                e.dynasty_rank as dynastyRank,
                GROUP_CONCAT(DISTINCT s.metric || ':' || s.score) as scores
            FROM emperors e
            LEFT JOIN scores s ON e.id = s.emperor_id
            WHERE e.name LIKE ? OR e.temple_name LIKE ? OR e.posthumous_name LIKE ? OR e.era_name LIKE ?
            GROUP BY e.id
            ORDER BY e.total_score DESC
        `, [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
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
                        dynasty: row.dynasty || '',
                        templeName: row.templeName || null,
                        posthumousName: row.posthumousName || null,
                        eraName: row.eraName || null,
                        scores: scores,
                        intro: row.intro,
                        bio: row.bio,
                        total: row.total,
                        globalRank: row.globalRank !== null && row.globalRank !== undefined ? parseInt(row.globalRank) : null,
                        dynastyRank: row.dynastyRank !== null && row.dynastyRank !== undefined ? parseInt(row.dynastyRank) : null
                    };
                });
                
                resolve(emperors);
            }
            db.close();
        });
    });
}

// 获取所有朝代列表（包含平均分和排名）
function getAllDynasties() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        db.all(`
            SELECT 
                dynasty,
                COUNT(*) as count,
                AVG(total_score) as avg_score
            FROM emperors
            WHERE dynasty IS NOT NULL AND dynasty != ''
            GROUP BY dynasty
            ORDER BY avg_score DESC
        `, [], (err, rows) => {
            if (err) {
                db.close();
                return reject(err);
            }
            
            // 计算排名
            const dynasties = rows.map((row, index) => {
                // 确保 avg_score 是数字并格式化
                let avgScore = 0;
                if (row.avg_score !== null && row.avg_score !== undefined) {
                    avgScore = parseFloat(row.avg_score);
                    // 处理浮点数精度问题，保留2位小数
                    avgScore = Math.round(avgScore * 100) / 100;
                }
                return {
                    name: row.dynasty,
                    count: row.count,
                    avgScore: avgScore,
                    rank: index + 1
                };
            });
            
            db.close();
            resolve(dynasties);
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

// 更新皇帝信息
function updateEmperor(emperorId, updates) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        // 更新基本信息
        if (updates.name || updates.intro || updates.bio !== undefined) {
            const fields = [];
            const values = [];
            
            if (updates.name) {
                fields.push('name = ?');
                values.push(updates.name);
            }
            if (updates.intro !== undefined) {
                fields.push('intro = ?');
                values.push(updates.intro);
            }
            if (updates.bio !== undefined) {
                fields.push('bio = ?');
                values.push(updates.bio);
            }
            
            if (fields.length > 0) {
                values.push(emperorId);
                db.run(
                    `UPDATE emperors SET ${fields.join(', ')} WHERE id = ?`,
                    values,
                    (err) => {
                        if (err) {
                            db.close();
                            return reject(err);
                        }
                    }
                );
            }
        }
        
        // 更新评分
        if (updates.scores) {
            const stmt = db.prepare('UPDATE scores SET score = ? WHERE emperor_id = ? AND metric = ?');
            let updateCount = 0;
            const totalUpdates = Object.keys(updates.scores).length;
            
            if (totalUpdates === 0) {
                if (updates.name || updates.intro || updates.bio !== undefined) {
                    recalculateTotalAndClose(emperorId, db, resolve, reject);
                } else {
                    db.close();
                    resolve(emperorId);
                }
                return;
            }
            
            for (const [metric, score] of Object.entries(updates.scores)) {
                stmt.run(score, emperorId, metric, (err) => {
                    if (err) {
                        console.error(`更新评分失败 ${metric}:`, err.message);
                    }
                    updateCount++;
                    if (updateCount === totalUpdates) {
                        stmt.finalize(() => {
                            recalculateTotalAndClose(emperorId, db, resolve, reject);
                        });
                    }
                });
            }
        } else {
            if (updates.name || updates.intro || updates.bio !== undefined) {
                recalculateTotalAndClose(emperorId, db, resolve, reject);
            } else {
                db.close();
                resolve(emperorId);
            }
        }
    });
}

// 重新计算总分并关闭数据库
function recalculateTotalAndClose(emperorId, db, resolve, reject) {
    db.all('SELECT metric, weight FROM weights', [], (err, weightRows) => {
        if (err) {
            db.close();
            return reject(err);
        }
        
        const weights = {};
        weightRows.forEach(row => {
            weights[row.metric] = row.weight;
        });
        
        db.all('SELECT metric, score FROM scores WHERE emperor_id = ?', [emperorId], (err, scoreRows) => {
            if (err) {
                db.close();
                return reject(err);
            }
            
            let total = 0;
            scoreRows.forEach(row => {
                total += (row.score || 0) * (weights[row.metric] || 0);
            });
            
            db.run('UPDATE emperors SET total_score = ? WHERE id = ?', [total, emperorId], (err) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(emperorId);
                }
            });
        });
    });
}

// 根据ID获取皇帝
function getEmperorById(id) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        db.get(`
            SELECT 
                e.id,
                e.name,
                e.temple_name as templeName,
                e.posthumous_name as posthumousName,
                e.era_name as eraName,
                e.bio,
                e.total_score as total,
                GROUP_CONCAT(DISTINCT s.metric || ':' || s.score) as scores
            FROM emperors e
            LEFT JOIN scores s ON e.id = s.emperor_id
            WHERE e.id = ?
            GROUP BY e.id
        `, [id], (err, row) => {
            db.close();
            if (err) {
                reject(err);
            } else if (!row) {
                reject(new Error('未找到皇帝'));
            } else {
                const scores = {};
                if (row.scores) {
                    row.scores.split(',').forEach(item => {
                        const [metric, score] = item.split(':');
                        if (metric && score) {
                            scores[metric] = parseFloat(score);
                        }
                    });
                }
                
                resolve({
                    id: row.id,
                    name: row.name,
                    templeName: row.templeName || null,
                    posthumousName: row.posthumousName || null,
                    eraName: row.eraName || null,
                    scores: scores,
                    bio: row.bio,
                    total: row.total
                });
            }
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
        getWeights,
        getAllDynasties,
        updateEmperor,
        getEmperorById
    };
