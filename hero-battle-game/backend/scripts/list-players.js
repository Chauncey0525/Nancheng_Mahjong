/**
 * 列出所有玩家信息（不显示密码）
 * 
 * 使用方法：
 * node scripts/list-players.js
 */

const { getDB } = require('../database');

const db = getDB();

db.all(
    'SELECT id, username, coins, gems, level, exp, pvp_rank, pvp_points, created_at, last_login FROM players ORDER BY id',
    [],
    (err, rows) => {
        if (err) {
            console.error('❌ 查询失败:', err.message);
            db.close();
            process.exit(1);
        }
        
        console.log('==========================================');
        console.log('  玩家列表');
        console.log('==========================================');
        console.log('');
        
        if (rows.length === 0) {
            console.log('暂无玩家');
        } else {
            console.log(`共有 ${rows.length} 个玩家：`);
            console.log('');
            
            rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id}`);
                console.log(`   用户名: ${row.username}`);
                console.log(`   金币: ${row.coins}`);
                console.log(`   宝石: ${row.gems}`);
                console.log(`   等级: ${row.level}`);
                console.log(`   经验: ${row.exp}`);
                console.log(`   创建时间: ${row.created_at || '未知'}`);
                console.log(`   最后登录: ${row.last_login || '从未登录'}`);
                console.log('');
            });
        }
        
        console.log('==========================================');
        console.log('注意：密码已加密存储，无法查看明文');
        console.log('如需验证密码，使用: node scripts/check-password.js <username> <password>');
        console.log('==========================================');
        
        db.close();
    }
);
