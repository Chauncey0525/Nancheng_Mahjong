/**
 * 密码验证工具
 * 用于验证玩家密码是否正确（不显示明文密码）
 * 
 * 使用方法：
 * node scripts/check-password.js <username> <password_to_test>
 */

const { getDB } = require('../database');
const bcrypt = require('bcrypt');

const username = process.argv[2];
const passwordToTest = process.argv[3];

if (!username || !passwordToTest) {
    console.log('使用方法: node scripts/check-password.js <username> <password_to_test>');
    console.log('');
    console.log('示例: node scripts/check-password.js zcx123 mypassword');
    process.exit(1);
}

const db = getDB();

db.get(
    'SELECT id, username, password FROM players WHERE username = ?',
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
        
        console.log('==========================================');
        console.log('  密码验证工具');
        console.log('==========================================');
        console.log('');
        console.log(`用户ID: ${row.id}`);
        console.log(`用户名: ${row.username}`);
        console.log('');
        console.log('密码哈希值:');
        console.log(`  ${row.password}`);
        console.log('');
        
        // 验证密码
        try {
            const isMatch = await bcrypt.compare(passwordToTest, row.password);
            
            if (isMatch) {
                console.log('✅ 密码验证成功！输入的密码正确。');
            } else {
                console.log('❌ 密码验证失败！输入的密码不正确。');
            }
        } catch (error) {
            console.error('❌ 验证过程出错:', error.message);
        }
        
        console.log('');
        console.log('==========================================');
        console.log('注意：密码是单向加密的，无法解密回明文');
        console.log('这是安全设计，保护用户密码不被泄露');
        console.log('==========================================');
        
        db.close();
    }
);
