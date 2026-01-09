/**
 * 修复所有英雄数据：添加性别字段并更新角色定位
 * 使用方法：node scripts/fixAllHeroes.js
 */

const { getDB } = require('../database');

function fixAllHeroes() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        console.log('==========================================');
        console.log('  修复所有英雄数据');
        console.log('==========================================');
        console.log('');
        
        db.serialize(() => {
            // 1. 添加gender字段（如果不存在）
            db.all("PRAGMA table_info(heroes)", [], (err, columns) => {
                if (err) {
                    console.error('❌ 获取表结构失败:', err.message);
                    db.close();
                    reject(err);
                    return;
                }
                
                const hasGender = columns.some(col => col.name === 'gender');
                
                if (!hasGender) {
                    console.log('1. 添加gender字段...');
                    db.run('ALTER TABLE heroes ADD COLUMN gender TEXT NOT NULL DEFAULT \'男\'', (err) => {
                        if (err) {
                            console.error('❌ 添加字段失败:', err.message);
                            db.close();
                            reject(err);
                            return;
                        }
                        console.log('✅ gender字段添加成功');
                        updateHeroes();
                    });
                } else {
                    console.log('✅ gender字段已存在');
                    updateHeroes();
                }
            });
            
            function updateHeroes() {
                console.log('');
                console.log('2. 更新英雄数据...');
                
                // 女性英雄列表
                const femaleHeroes = ['花木兰', '穆桂英'];
                
                // 角色定位更新映射
                const roleUpdates = {
                    '成吉思汗': '射手',
                    '秦始皇': '坦克',
                    '唐太宗': '坦克',
                    '韩信': '辅助',
                    '花木兰': '射手',
                    '穆桂英': '射手'
                };
                
                // 先更新所有"奶妈"为"治疗"
                db.run("UPDATE heroes SET role = '治疗' WHERE role = '奶妈'", (err) => {
                    if (err) {
                        console.error('❌ 更新"奶妈"为"治疗"失败:', err.message);
                    } else {
                        console.log('✅ 已将所有"奶妈"更新为"治疗"');
                    }
                    
                    db.all('SELECT id, name FROM heroes', [], (err, heroes) => {
                        if (err) {
                            console.error('❌ 读取英雄列表失败:', err.message);
                            db.close();
                            reject(err);
                            return;
                        }
                        
                        let updated = 0;
                        let total = heroes.length;
                        
                        if (total === 0) {
                            console.log('   没有英雄需要更新');
                            db.close();
                            resolve();
                            return;
                        }
                        
                        heroes.forEach((hero, index) => {
                            const gender = femaleHeroes.includes(hero.name) ? '女' : '男';
                            const newRole = roleUpdates[hero.name];
                            
                            let updateSql = 'UPDATE heroes SET gender = ?';
                            let params = [gender];
                            
                            if (newRole) {
                                updateSql += ', role = ?';
                                params.push(newRole);
                            }
                            
                            updateSql += ' WHERE id = ?';
                            params.push(hero.id);
                            
                            db.run(updateSql, params, (err) => {
                                if (err) {
                                    console.error(`❌ 更新 "${hero.name}" 失败:`, err.message);
                                } else {
                                    const changes = [];
                                    changes.push(`性别:${gender}`);
                                    if (newRole) {
                                        changes.push(`定位:${newRole}`);
                                    }
                                    console.log(`✅ 更新 "${hero.name}": ${changes.join(', ')}`);
                                    updated++;
                                }
                                
                                if (index === heroes.length - 1) {
                                    console.log('');
                                    console.log(`✅ 更新完成: ${updated}/${total} 个英雄`);
                                    db.close();
                                    resolve();
                                }
                            });
                        });
                    });
                });
            }
        });
    });
}

// 执行
if (require.main === module) {
    fixAllHeroes()
        .then(() => {
            console.log('');
            console.log('✅ 所有英雄数据修复完成！');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ 操作失败:', err);
            process.exit(1);
        });
}

module.exports = { fixAllHeroes };
