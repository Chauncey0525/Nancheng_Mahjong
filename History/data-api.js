// API数据获取模块
// 权重配置（也可以从API获取，但为了性能可以缓存）
let WEIGHTS = {};
let EMPERORS = [];
let isDataLoaded = false;

// API基础URL
const API_BASE_URL = window.location.origin;

// 计算总分
function calculateTotal(scores) {
    let total = 0;
    for (const [key, value] of Object.entries(WEIGHTS)) {
        total += (scores[key] || 0) * value;
    }
    return total;
}

// 从API加载权重配置
async function loadWeights() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/weights`);
        if (!response.ok) {
            throw new Error('获取权重配置失败');
        }
        WEIGHTS = await response.json();
        console.log('权重配置加载完成:', WEIGHTS);
        return WEIGHTS;
    } catch (error) {
        console.error('加载权重配置失败:', error);
        // 使用默认权重作为后备
        WEIGHTS = {
            "德": 0.20, "智": 0.15, "体": 0.02, "美": 0.01, "劳": 0.01,
            "国力": 0.20, "民心": 0.15, "雄心": 0.03, "人事管理": 0.10,
            "心胸气量": 0.03, "后世影响": 0.10,
        };
        return WEIGHTS;
    }
}

// 从API加载所有皇帝数据
async function loadEmperors() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/emperors`);
        if (!response.ok) {
            throw new Error('获取皇帝列表失败');
        }
        EMPERORS = await response.json();
        
        // 确保每个皇帝都有total字段（虽然数据库已经计算了，但为了兼容性）
        EMPERORS.forEach(emperor => {
            if (!emperor.total) {
                emperor.total = calculateTotal(emperor.scores);
            }
        });
        
        console.log(`皇帝数据加载完成: ${EMPERORS.length} 个皇帝`);
        isDataLoaded = true;
        return EMPERORS;
    } catch (error) {
        console.error('加载皇帝数据失败:', error);
        throw error;
    }
}

// 初始化：加载所有数据
async function initData() {
    try {
        await loadWeights();
        await loadEmperors();
        return { WEIGHTS, EMPERORS };
    } catch (error) {
        console.error('数据初始化失败:', error);
        throw error;
    }
}

// 搜索皇帝（使用API）
async function searchEmperorAPI(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/emperors/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('搜索失败');
        }
        const results = await response.json();
        return results;
    } catch (error) {
        console.error('搜索失败:', error);
        return [];
    }
}

// 构建排行榜
function buildRanking() {
    if (!isDataLoaded) {
        console.warn('数据尚未加载完成');
        return [];
    }
    return [...EMPERORS].sort((a, b) => b.total - a.total);
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WEIGHTS,
        EMPERORS,
        calculateTotal,
        loadWeights,
        loadEmperors,
        initData,
        searchEmperorAPI,
        buildRanking
    };
}
