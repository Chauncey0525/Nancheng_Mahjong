// 获取DOM元素
const emperorSearch = document.getElementById('emperorSearch');
const searchBtn = document.getElementById('searchBtn');
const searchSuggestions = document.getElementById('searchSuggestions');
const emperorDetails = document.getElementById('emperorDetails');
const topRankingList = document.getElementById('topRankingList');
const rankingTitle = document.getElementById('rankingTitle');
const firstPageBtn = document.getElementById('firstPageBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const lastPageBtn = document.getElementById('lastPageBtn');
const pageInfo = document.getElementById('pageInfo');

// 初始化
let currentRanking = [];
let currentPage = 1;
const pageSize = 10;
let isInitialized = false;

// 显示分页列表（直接替换上面的10个皇帝）
function displayPage(page) {
    const totalPages = Math.ceil(currentRanking.length / pageSize);
    currentPage = Math.min(Math.max(page, 1), totalPages);

    // 更新分页按钮状态
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    firstPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;

    // 更新标题
    if (currentPage === 1) {
        rankingTitle.textContent = 'TOP 10';
    } else {
        const startRank = (currentPage - 1) * pageSize + 1;
        const endRank = Math.min(currentPage * pageSize, currentRanking.length);
        rankingTitle.textContent = `第 ${startRank}-${endRank} 名`;
    }

    const start = (currentPage - 1) * pageSize;
    const pageItems = currentRanking.slice(start, start + pageSize);

    topRankingList.innerHTML = '';
    pageItems.forEach((emperor, index) => {
        const globalRank = start + index + 1;
        const rankItem = document.createElement('div');
        rankItem.className = 'ranking-item';
        
        const rankClass = globalRank === 1 ? 'top1' : globalRank === 2 ? 'top2' : globalRank === 3 ? 'top3' : '';
        
        rankItem.innerHTML = `
            <div class="rank-number ${rankClass}">${globalRank}</div>
            <div class="rank-info">
                <div class="rank-name">${emperor.name}</div>
                <div class="rank-total">总分: ${emperor.total.toFixed(2)}</div>
            </div>
        `;
        
        rankItem.addEventListener('click', () => {
            showEmperorDetails(emperor, globalRank);
            emperorSearch.value = emperor.name;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        topRankingList.appendChild(rankItem);
    });
}

// 显示皇帝详情
function showEmperorDetails(emperor, rank) {
    document.getElementById('emperorName').textContent = emperor.name;
    document.getElementById('emperorRank').textContent = `第${rank}名`;
    document.getElementById('emperorTotal').textContent = emperor.total.toFixed(2);
    document.getElementById('emperorIntro').textContent = emperor.intro;
    document.getElementById('emperorBio').textContent = emperor.bio;
    
    // 显示评分
    const scoresGrid = document.getElementById('scoresGrid');
    scoresGrid.innerHTML = '';
    
    const weights = window.WEIGHTS || {};
    Object.entries(weights).forEach(([key, weight]) => {
        const score = emperor.scores[key] || 0;
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `
            <div class="score-label">
                <span>${key}</span>
                <span>权重: ${(weight * 100).toFixed(0)}%</span>
            </div>
            <div class="score-value">${score.toFixed(1)}</div>
            <div class="score-bar">
                <div class="score-bar-fill" style="width: ${score}%"></div>
            </div>
        `;
        scoresGrid.appendChild(scoreItem);
    });
    
    emperorDetails.classList.remove('hidden');
    
    // 延迟显示进度条动画
    setTimeout(() => {
        document.querySelectorAll('.score-bar-fill').forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 50);
        });
    }, 100);
}

// 模糊搜索函数 - 支持通过姓名、别名（庙号、年号、谥号等）查找
function findEmperorByQuery(query) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return null;
    
    // 从当前排行榜中查找
    return currentRanking.find(emperor => {
        // 匹配真实姓名
        if (emperor.name.toLowerCase().includes(normalizedQuery)) {
            return true;
        }
        // 匹配别名
        if (emperor.aliases && emperor.aliases.some(alias => 
            alias.toLowerCase().includes(normalizedQuery)
        )) {
            return true;
        }
        return false;
    });
}

// 搜索功能
function searchEmperor(query) {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;
    
    const emperor = findEmperorByQuery(normalizedQuery);
    if (emperor) {
        const rank = currentRanking.findIndex(e => e.name === emperor.name) + 1;
        showEmperorDetails(emperor, rank);
        searchSuggestions.classList.remove('show');
    } else {
        alert('未找到该皇帝，请检查输入是否正确。可以尝试输入姓名、庙号、年号或谥号。');
    }
}

// 搜索建议
function showSuggestions(query) {
    if (!query.trim()) {
        searchSuggestions.classList.remove('show');
        return;
    }
    
    const normalizedQuery = query.toLowerCase();
    const matches = currentRanking.filter(emperor => {
        // 匹配真实姓名
        if (emperor.name.toLowerCase().includes(normalizedQuery)) {
            return true;
        }
        // 匹配别名
        if (emperor.aliases && emperor.aliases.some(alias => 
            alias.toLowerCase().includes(normalizedQuery)
        )) {
            return true;
        }
        return false;
    });
    
    if (matches.length === 0) {
        searchSuggestions.classList.remove('show');
        return;
    }
    
    searchSuggestions.innerHTML = '';
    // 限制显示前10个建议
    matches.slice(0, 10).forEach(emperor => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        // 显示真实姓名和匹配的别名
        const matchedAlias = emperor.aliases && emperor.aliases.find(alias => 
            alias.toLowerCase().includes(normalizedQuery)
        );
        const displayText = matchedAlias ? `${emperor.name} (${matchedAlias})` : emperor.name;
        item.textContent = displayText;
        item.addEventListener('click', () => {
            emperorSearch.value = emperor.name;
            searchEmperor(emperor.name);
            searchSuggestions.classList.remove('show');
        });
        searchSuggestions.appendChild(item);
    });
    
    searchSuggestions.classList.add('show');
}

// 事件监听
searchBtn.addEventListener('click', () => {
    searchEmperor(emperorSearch.value);
});

emperorSearch.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});

emperorSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchEmperor(emperorSearch.value);
    }
});

// 点击外部关闭建议
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
        searchSuggestions.classList.remove('show');
    }
});

// 分页按钮事件
firstPageBtn.addEventListener('click', () => {
    if (isInitialized) displayPage(1);
});
prevPageBtn.addEventListener('click', () => {
    if (isInitialized) displayPage(currentPage - 1);
});
nextPageBtn.addEventListener('click', () => {
    if (isInitialized) displayPage(currentPage + 1);
});
lastPageBtn.addEventListener('click', () => {
    if (isInitialized) {
        displayPage(Math.ceil(currentRanking.length / pageSize));
    }
});

// 初始化：加载数据并显示排行榜
async function initializeApp() {
    try {
        // 显示加载提示
        topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">正在加载数据...</div>';
        
        // 加载数据（从 data-api.js）
        const { WEIGHTS: loadedWeights, EMPERORS: loadedEmperors } = await initData();
        
        // 更新全局变量
        window.WEIGHTS = loadedWeights;
        window.EMPERORS = loadedEmperors;
        
        // 构建排行榜（使用全局变量）
        currentRanking = [...loadedEmperors].sort((a, b) => b.total - a.total);
        isInitialized = true;
        
        // 显示第一页
        displayPage(1);
        
        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);
        topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #d32f2f;">数据加载失败，请刷新页面重试</div>';
    }
}

// 启动应用
initializeApp();
