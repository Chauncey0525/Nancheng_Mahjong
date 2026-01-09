/**
 * 更新英雄数据库结构
 * 将旧的属性系统改为宝可梦风格
 * 
 * 使用方法：
 * node scripts/updateHeroSchema.js
 */

const { getDB } = require('../database');

function updateSchema() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        console.log('==========================================');
        console.log('  更新英雄数据库结构');
        console.log('==========================================');
        console.log('');
        
        db.serialize(() => {
            // 1. 创建新表
            console.log('1. 创建新的英雄表...');
            db.run(`
                CREATE TABLE IF NOT EXISTS heroes_new (
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
            `, (err) => {
                if (err) {
                    console.error('❌ 创建新表失败:', err.message);
                    db.close();
                    reject(err);
                    return;
                }
                console.log('✅ 新表创建成功');
                
                // 2. 迁移数据（如果旧表存在）
                console.log('');
                console.log('2. 检查是否需要迁移数据...');
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='heroes'", (err, row) => {
                    if (err) {
                        console.error('❌ 检查旧表失败:', err.message);
                        db.close();
                        reject(err);
                        return;
                    }
                    
                    if (row) {
                        console.log('   发现旧表，开始迁移数据...');
                        // 迁移逻辑：将旧属性转换为新属性
                        db.all('SELECT * FROM heroes', [], (err, oldHeroes) => {
                            if (err) {
                                console.error('❌ 读取旧数据失败:', err.message);
                                db.close();
                                reject(err);
                                return;
                            }
                            
                            if (oldHeroes.length === 0) {
                                console.log('   旧表为空，无需迁移');
                                finishMigration();
                                return;
                            }
                            
                            let migrated = 0;
                            oldHeroes.forEach((hero, index) => {
                                // 转换属性：旧属性平均分配到物攻和法攻，物抗和法抗
                                const totalAtk = hero.base_atk || 50;
                                const totalDef = hero.base_def || 30;
                                
                                // 根据角色类型分配（这里先简单处理，后续导入脚本会重新设置）
                                const physAtk = Math.floor(totalAtk * 0.6);
                                const magicAtk = Math.floor(totalAtk * 0.4);
                                const physDef = Math.floor(totalDef * 0.6);
                                const magicDef = Math.floor(totalDef * 0.4);
                                
                                // 尝试从旧字段中提取称号，优先使用posthumous_name，其次temple_name，最后era_name
                                let title = null;
                                if (hero.posthumous_name) {
                                    title = hero.posthumous_name;
                                } else if (hero.temple_name) {
                                    title = hero.temple_name;
                                } else if (hero.era_name) {
                                    title = hero.era_name;
                                }
                                
                                db.run(`
                                    INSERT INTO heroes_new (
                                        name, dynasty, title, bio, element, role,
                                        base_hp, base_phys_atk, base_magic_atk,
                                        base_phys_def, base_magic_def, base_speed
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `, [
                                    hero.name,
                                    hero.dynasty,
                                    title,
                                    hero.bio,
                                    hero.element || '普通',
                                    '战士', // 默认角色
                                    hero.base_hp || 100,
                                    physAtk,
                                    magicAtk,
                                    physDef,
                                    magicDef,
                                    hero.base_spd || 40
                                ], (insertErr) => {
                                    if (insertErr) {
                                        console.error(`❌ 迁移 "${hero.name}" 失败:`, insertErr.message);
                                    } else {
                                        migrated++;
                                    }
                                    
                                    if (index === oldHeroes.length - 1) {
                                        console.log(`✅ 迁移完成: ${migrated}/${oldHeroes.length} 个英雄`);
                                        finishMigration();
                                    }
                                });
                            });
                        });
                    } else {
                        console.log('   未发现旧表，跳过迁移');
                        finishMigration();
                    }
                });
            });
        });
        
        function finishMigration() {
            // 3. 检查新表是否存在
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='heroes_new'", (err, row) => {
                if (err || !row) {
                    console.log('   新表不存在，跳过重命名');
                    db.close();
                    resolve();
                    return;
                }
                
                // 4. 备份旧表并重命名
                console.log('');
                console.log('3. 备份旧表...');
                db.run('ALTER TABLE heroes RENAME TO heroes_old_backup', (err) => {
                    if (err && !err.message.includes('no such table')) {
                        console.log('   旧表不存在或已备份');
                    } else if (!err) {
                        console.log('✅ 旧表已备份为 heroes_old_backup');
                    }
                    
                    // 5. 重命名新表
                    console.log('');
                    console.log('4. 重命名新表...');
                    db.run('ALTER TABLE heroes_new RENAME TO heroes', (err) => {
                        if (err) {
                            console.error('❌ 重命名失败:', err.message);
                            db.close();
                            reject(err);
                            return;
                        }
                        
                        console.log('✅ 新表重命名成功');
                        db.close();
                        
                        console.log('');
                        console.log('==========================================');
                        console.log('✅ 数据库结构更新完成！');
                        console.log('==========================================');
                        console.log('');
                        console.log('新的属性字段：');
                        console.log('  - base_hp: 生命值');
                        console.log('  - base_phys_atk: 物理攻击');
                        console.log('  - base_magic_atk: 魔法攻击');
                        console.log('  - base_phys_def: 物理防御');
                        console.log('  - base_magic_def: 魔法防御');
                        console.log('  - base_speed: 速度');
                        console.log('  - role: 角色定位（战士、刺客、法师、治疗、坦克、射手、辅助）');
                        console.log('');
                        
                        resolve();
                    });
                });
            });
        }
    });
}

// 执行更新
if (require.main === module) {
    updateSchema()
        .then(() => {
            console.log('✅ 更新完成！');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ 更新失败:', err);
            process.exit(1);
        });
}

module.exports = { updateSchema };
