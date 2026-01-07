const { getDB } = require('./database');

// 更新皇帝的评分
function updateScore(emperorName, metric, score) {
    const db = getDB();
    
    // 获取皇帝ID
    db.get('SELECT id FROM emperors WHERE name = ?', [emperorName], (err, row) => {
        if (err) {
            console.error('查询失败:', err.message);
            db.close();
            return;
        }
        
        if (!row) {
            console.error(`未找到皇帝: ${emperorName}`);
            db.close();
            return;
        }
        
        const emperorId = row.id;
        
        // 更新评分
        db.run(
            'UPDATE scores SET score = ? WHERE emperor_id = ? AND metric = ?',
            [score, emperorId, metric],
            function(err) {
                if (err) {
                    console.error('更新失败:', err.message);
                    db.close();
                    return;
                }
                
                if (this.changes === 0) {
                    // 如果不存在，则插入
                    db.run(
                        'INSERT INTO scores (emperor_id, metric, score) VALUES (?, ?, ?)',
                        [emperorId, metric, score],
                        (err) => {
                            if (err) {
                                console.error('插入失败:', err.message);
                                db.close();
                                return;
                            }
                            console.log(`✓ 已添加评分: ${emperorName} - ${metric} = ${score}`);
                            recalculateTotal(emperorId, db);
                        }
                    );
                } else {
                    console.log(`✓ 已更新评分: ${emperorName} - ${metric} = ${score}`);
                    recalculateTotal(emperorId, db);
                }
            }
        );
    });
}

// 重新计算总分
function recalculateTotal(emperorId, db) {
    db.all('SELECT metric, weight FROM weights', [], (err, weightRows) => {
        if (err) {
            console.error('获取权重失败:', err.message);
            db.close();
            return;
        }
        
        const weights = {};
        weightRows.forEach(row => {
            weights[row.metric] = row.weight;
        });
        
        db.all('SELECT metric, score FROM scores WHERE emperor_id = ?', [emperorId], (err, scoreRows) => {
            if (err) {
                console.error('获取评分失败:', err.message);
                db.close();
                return;
            }
            
            let total = 0;
            scoreRows.forEach(row => {
                total += (row.score || 0) * (weights[row.metric] || 0);
            });
            
            db.run('UPDATE emperors SET total_score = ? WHERE id = ?', [total, emperorId], (err) => {
                if (err) {
                    console.error('更新总分失败:', err.message);
                } else {
                    console.log(`✓ 新总分: ${total.toFixed(2)}`);
                }
                db.close();
            });
        });
    });
}

// 获取命令行参数
const args = process.argv.slice(2);

if (args.length < 3) {
    console.log('用法: node edit-db.js <皇帝姓名> <指标名称> <分数>');
    console.log('示例: node edit-db.js 刘邦 德 85');
    console.log('\n可用指标: 德、智、体、美、劳、国力、民心、雄心、人事管理、心胸气量、后世影响');
    process.exit(1);
}

const [emperorName, metric, score] = args;
const scoreNum = parseFloat(score);

if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
    console.error('错误: 分数必须是 0-100 之间的数字');
    process.exit(1);
}

updateScore(emperorName, metric, scoreNum);
