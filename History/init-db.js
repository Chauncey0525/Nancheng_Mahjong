const { initDatabase, insertWeights, insertEmperor } = require('./database');

// 从data.js读取数据（需要先转换为CommonJS格式）
// 这里我们直接定义数据，或者可以读取data.js文件
const fs = require('fs');
const path = require('path');

// 读取并解析data.js文件
function loadDataFromJS() {
    const dataPath = path.join(__dirname, 'data.js');
    const content = fs.readFileSync(dataPath, 'utf-8');
    
    // 提取WEIGHTS
    const weightsMatch = content.match(/const WEIGHTS = ({[\s\S]*?});/);
    let weights = {};
    if (weightsMatch) {
        const weightsStr = weightsMatch[1].replace(/"([^"]+)":\s*([\d.]+)/g, '"$1": $2');
        weights = eval(`(${weightsStr})`);
    }
    
    // 提取EMPERORS数组
    const emperorsMatch = content.match(/const EMPERORS = (\[[\s\S]*?\]);/);
    let emperors = [];
    if (emperorsMatch) {
        // 使用eval解析数组（注意：在生产环境中应该使用更安全的方法）
        try {
            emperors = eval(emperorsMatch[1]);
        } catch (e) {
            console.error('解析EMPERORS数组失败:', e);
            // 备用方案：手动解析
            return { weights, emperors: [] };
        }
    }
    
    return { weights, emperors };
}

async function main() {
    try {
        console.log('开始初始化数据库...');
        
        // 初始化数据库表结构
        await initDatabase();
        
        // 加载数据
        console.log('加载数据文件...');
        const { weights, emperors } = loadDataFromJS();
        
        if (!weights || Object.keys(weights).length === 0) {
            throw new Error('未找到权重配置');
        }
        
        if (!emperors || emperors.length === 0) {
            throw new Error('未找到皇帝数据');
        }
        
        console.log(`找到 ${Object.keys(weights).length} 个权重配置`);
        console.log(`找到 ${emperors.length} 个皇帝数据`);
        
        // 插入权重配置
        console.log('插入权重配置...');
        await insertWeights(weights);
        
        // 插入皇帝数据
        console.log('插入皇帝数据...');
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < emperors.length; i++) {
            try {
                await insertEmperor(emperors[i], weights);
                successCount++;
                if ((i + 1) % 20 === 0) {
                    console.log(`已插入 ${i + 1}/${emperors.length} 个皇帝...`);
                }
            } catch (error) {
                console.error(`插入皇帝 "${emperors[i].name}" 失败:`, error.message);
                failCount++;
            }
        }
        
        console.log('\n数据库初始化完成!');
        console.log(`成功: ${successCount} 个`);
        console.log(`失败: ${failCount} 个`);
        
        process.exit(0);
    } catch (error) {
        console.error('初始化失败:', error);
        process.exit(1);
    }
}

main();
