let WEIGHTS = {};
let EMPERORS = [];
let isDataLoaded = false;

const API_BASE_URL = (window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null') 
    ? 'http://localhost:3000' 
    : window.location.origin;

function calculateTotal(scores) {
    let total = 0;
    for (const [key, value] of Object.entries(WEIGHTS)) {
        total += (scores[key] || 0) * value;
    }
    return total;
}

async function loadWeights() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/weights`);
        if (!response.ok) {
            throw new Error('获取权重配置失败');
        }
        WEIGHTS = await response.json();
        if (typeof window !== 'undefined') {
            window.WEIGHTS = WEIGHTS;
        }
        return WEIGHTS;
    } catch (error) {
        console.error('加载权重配置失败:', error);
        WEIGHTS = {
            "德": 0.20, "智": 0.15, "体": 0.02, "美": 0.01, "劳": 0.01,
            "国力": 0.20, "民心": 0.15, "雄心": 0.03, "人事管理": 0.10,
            "心胸气量": 0.03, "后世影响": 0.10,
        };
        return WEIGHTS;
    }
}

async function loadEmperors() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/emperors`);
        if (!response.ok) {
            throw new Error('获取皇帝列表失败');
        }
        EMPERORS = await response.json();
        
        EMPERORS.forEach(emperor => {
            if (!emperor.total) {
                emperor.total = calculateTotal(emperor.scores);
            }
        });
        
        isDataLoaded = true;
        if (typeof window !== 'undefined') {
            window.EMPERORS = EMPERORS;
        }
        return EMPERORS;
    } catch (error) {
        console.error('加载皇帝数据失败:', error);
        throw error;
    }
}

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

function buildRanking() {
    if (!isDataLoaded) {
        console.warn('数据尚未加载完成');
        return [];
    }
    return [...EMPERORS].sort((a, b) => b.total - a.total);
}

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

if (typeof window !== 'undefined') {
    window.initData = initData;
    window.loadWeights = loadWeights;
    window.loadEmperors = loadEmperors;
    window.searchEmperorAPI = searchEmperorAPI;
    window.buildRanking = buildRanking;
}
