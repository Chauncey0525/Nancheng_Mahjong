/**
 * 重置玩家密码
 * 
 * 使用方法：
 * node scripts/reset-password.js <username> <new_password>
 */

const { getDB } = require('../database');
const bcrypt = require('bcrypt');

const username = process.argv[2];
const newPassword = process.argv[3];

if (!username || !newPassword) {
    console.log('使用方法: node scripts/reset-password.js <username> <new_password>');
    console.log('');
    console.log('示例: node scripts/reset-password.js zcx123 newpassword123');
    process.exit(1);
}

// 验证密码格式
if (newPassword.length < 6 || newPassword.length > 50) {
    console.log('❌ 密码长度必须在6-50个字符之间');
    process.exit(1);
}

const db = getDB();

db.get(
    'SELECT id, username FROM players WHERE username = ?',
    [username],
    async (err, row) => {
        if (err) {
            console.error('❌ 查询失败:', err.message);
            db.close();
            process.exit(1);
        }
        
        if (!row) {
            console.log(`❌ 用户 "${username}" 不存在`);
            db.close();
            process.exit(1);
        }
        
        try {
            // 加密新密码
            console.log('正在加密新密码...');
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // 更新密码
            db.run(
                'UPDATE players SET password = ? WHERE id = ?',
                [hashedPassword, row.id],
                function(updateErr) {
                    if (updateErr) {
                        console.error('❌ 更新密码失败:', updateErr.message);
                        db.close();
                        process.exit(1);
                    }
                    
                    console.log('==========================================');
                    console.log('  密码重置成功');
                    console.log('==========================================');
                    console.log('');
                    console.log(`用户ID: ${row.id}`);
                    console.log(`用户名: ${row.username}`);
                    console.log('✅ 密码已更新');
                    console.log('');
                    console.log('==========================================');
                    
                    db.close();
                }
            );
        } catch (error) {
            console.error('❌ 加密密码失败:', error.message);
            db.close();
            process.exit(1);
        }
    }
);
