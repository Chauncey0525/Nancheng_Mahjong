/**
 * 更新现有英雄的属性分配
 * 使用方法：node scripts/updateHeroAttributes.js
 */

const { getDB } = require('../database');

// 属性更新映射（根据历史背景重新分配）
const attributeUpdates = {
    // 中国名人
    '秦始皇': '龙',
    '成吉思汗': '龙',
    '关羽': '钢',
    '岳飞': '钢',
    '霍去病': '飞行',
    '花木兰': '飞行',
    '穆桂英': '飞行',
    '康熙帝': '冰',
    '张衡': '岩石',
    '祖冲之': '超能力',
    '汉高祖': '地面',
    '明太祖': '地面',
    
    // 外国名人
    '亚历山大大帝': '龙',
    '凯撒': '钢',
    '林肯': '钢',
    '华盛顿': '钢',
    '牛顿': '地面',
    '达芬奇': '普通',
    '甘地': '普通',
    '丘吉尔': '岩石',
    '米开朗基罗': '岩石',
    '麦哲伦': '冰',
    '南丁格尔': '普通'
};

function updateHeroAttributes() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        
        console.log('==========================================');
        console.log('  更新英雄属性分配');
        console.log('==========================================');
        console.log('');
        
        db.all('SELECT id, name, element FROM heroes ORDER BY name', [], (err, heroes) => {
            if (err) {
                console.error('❌ 读取英雄列表失败:', err.message);
                db.close();
                reject(err);
                return;
            }
            
            if (heroes.length === 0) {
                console.log('   没有英雄需要更新');
                db.close();
                resolve();
                return;
            }
            
            let updated = 0;
            let skipped = 0;
            let processed = 0;
            const total = heroes.length;
            
            console.log(`📊 找到 ${total} 个英雄，开始检查...`);
            console.log('');
            
            heroes.forEach((hero) => {
                const newElement = attributeUpdates[hero.name];
                
                if (!newElement) {
                    // 不在更新列表中的英雄，跳过
                    skipped++;
                    processed++;
                    checkFinish();
                    return;
                }
                
                if (hero.element === newElement) {
                    // 属性已经是目标值，跳过
                    console.log(`⏭️  跳过 "${hero.name}" (属性已是 ${newElement})`);
                    skipped++;
                    processed++;
                    checkFinish();
                    return;
                }
                
                // 需要更新属性
                db.run('UPDATE heroes SET element = ? WHERE id = ?', [newElement, hero.id], (err) => {
                    processed++;
                    if (err) {
                        console.error(`❌ 更新 "${hero.name}" 失败:`, err.message);
                    } else {
                        console.log(`✅ 更新 "${hero.name}": ${hero.element || '未知'} → ${newElement}`);
                        updated++;
                    }
                    checkFinish();
                });
            });
            
            function checkFinish() {
                if (processed === total) {
                    finish();
                }
            }
            
            function finish() {
                db.close();
                console.log('');
                console.log('==========================================');
                console.log('  更新完成');
                console.log('==========================================');
                console.log(`✅ 已更新: ${updated} 个英雄`);
                console.log(`⏭️  跳过: ${skipped} 个英雄`);
                console.log(`📊 总计: ${total} 个英雄`);
                console.log('');
                resolve();
            }
        });
    });
}

// 执行
if (require.main === module) {
    updateHeroAttributes()
        .then(() => {
            console.log('✅ 属性更新完成！');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ 更新失败:', err);
            process.exit(1);
        });
}

module.exports = { updateHeroAttributes };
