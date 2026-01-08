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
const dynastyFilter = document.getElementById('dynastyFilter');
const dynastyRankingList = document.getElementById('dynastyRankingList');
const dynastyFirstPageBtn = document.getElementById('dynastyFirstPageBtn');
const dynastyPrevPageBtn = document.getElementById('dynastyPrevPageBtn');
const dynastyNextPageBtn = document.getElementById('dynastyNextPageBtn');
const dynastyLastPageBtn = document.getElementById('dynastyLastPageBtn');
const dynastyPageInfo = document.getElementById('dynastyPageInfo');

let currentRanking = [];
let currentPage = 1;
const pageSize = 10;
let isInitialized = false;
let selectedDynasty = '';
let dynastyRankingData = [];
let dynastyPage = 1;
const dynastyPageSize = 5;

function displayPage(page) {
    const totalPages = Math.ceil(currentRanking.length / pageSize);
    currentPage = Math.min(Math.max(page, 1), totalPages);

    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    firstPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;

    if (selectedDynasty) {
        if (currentPage === 1) {
            rankingTitle.textContent = `${selectedDynasty} (共${currentRanking.length}人)`;
        } else {
            const startRank = (currentPage - 1) * pageSize + 1;
            const endRank = Math.min(currentPage * pageSize, currentRanking.length);
            rankingTitle.textContent = `${selectedDynasty} - 第 ${startRank}-${endRank} 名 (共${currentRanking.length}人)`;
        }
    } else {
        if (currentPage === 1) {
            rankingTitle.textContent = 'TOP 10';
        } else {
            const startRank = (currentPage - 1) * pageSize + 1;
            const endRank = Math.min(currentPage * pageSize, currentRanking.length);
            rankingTitle.textContent = `第 ${startRank}-${endRank} 名`;
        }
    }

    const start = (currentPage - 1) * pageSize;
    const pageItems = currentRanking.slice(start, start + pageSize);

    topRankingList.innerHTML = '';
    pageItems.forEach((emperor) => {
        const actualGlobalRank = emperor.globalRank;
        
        if (actualGlobalRank === undefined || actualGlobalRank === null) {
            return;
        }
        
        const rankItem = document.createElement('div');
        rankItem.className = 'ranking-item';
        const rankClass = actualGlobalRank === 1 ? 'top1' : actualGlobalRank === 2 ? 'top2' : actualGlobalRank === 3 ? 'top3' : '';
        const dynastyRankText = emperor.dynastyRank ? ` | 当朝第${emperor.dynastyRank}名` : '';
        rankItem.innerHTML = `
            <div class="rank-number ${rankClass}">${actualGlobalRank}</div>
            <div class="rank-info">
                <div class="rank-name">${emperor.name}${emperor.dynasty ? `<span class="dynasty-tag">${emperor.dynasty}</span>` : ''}</div>
                <div class="rank-total">总分: ${emperor.total.toFixed(2)}${dynastyRankText}</div>
            </div>
        `;
        
        rankItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showEmperorDetails(emperor);
            emperorSearch.value = emperor.name;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        topRankingList.appendChild(rankItem);
    });
}

function showEmperorDetails(emperor) {
    const emperorNameElement = document.getElementById('emperorName');
    const titlesElement = document.getElementById('emperorTitles');
    const emperorGlobalRankElement = document.getElementById('emperorGlobalRank');
    const emperorDynastyRankElement = document.getElementById('emperorDynastyRank');
    const dynastyRankBadgeElement = document.getElementById('dynastyRankBadge');
    const emperorTotalElement = document.getElementById('emperorTotal');
    const scoresGridElement = document.getElementById('scoresGrid');
    
    if (!emperorNameElement || !titlesElement || !emperorGlobalRankElement || 
        !emperorTotalElement || !scoresGridElement) {
        console.error('缺少必需的DOM元素，无法显示皇帝详情');
        return;
    }
    
    emperorNameElement.textContent = emperor.name;
    
    const titles = [];
    if (emperor.templeName) {
        titles.push(`庙号：${emperor.templeName}`);
    }
    if (emperor.posthumousName) {
        titles.push(`谥号：${emperor.posthumousName}`);
    }
    if (emperor.eraName) {
        titles.push(`年号：${emperor.eraName}`);
    }
    if (titles.length > 0) {
        titlesElement.innerHTML = `<div class="titles-list">${titles.join(' | ')}</div>`;
        titlesElement.style.display = 'block';
    } else {
        titlesElement.style.display = 'none';
    }
    
    if (emperor.globalRank === undefined || emperor.globalRank === null) {
        emperorGlobalRankElement.textContent = '未知';
    } else {
        emperorGlobalRankElement.textContent = `第${emperor.globalRank}名`;
    }
    
    if (emperorDynastyRankElement && dynastyRankBadgeElement) {
        if (emperor.dynastyRank !== undefined && emperor.dynastyRank !== null) {
            emperorDynastyRankElement.textContent = `第${emperor.dynastyRank}名`;
            dynastyRankBadgeElement.style.display = 'flex';
        } else {
            dynastyRankBadgeElement.style.display = 'none';
        }
    }
    
    emperorTotalElement.textContent = emperor.total.toFixed(2);
    
    const emperorBioElement = document.getElementById('emperorBio');
    if (emperorBioElement) {
        emperorBioElement.textContent = emperor.bio || emperor.intro || '';
    }
    
    scoresGridElement.innerHTML = '';
    
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
        scoresGridElement.appendChild(scoreItem);
    });
    
    if (emperorDetails) {
        emperorDetails.classList.remove('hidden');
    }
    
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

function findEmperorByQuery(query) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return null;
    
    return currentRanking.find(emperor => {
        if (emperor.name.toLowerCase().includes(normalizedQuery)) return true;
        if (emperor.templeName && emperor.templeName.toLowerCase().includes(normalizedQuery)) return true;
        if (emperor.posthumousName && emperor.posthumousName.toLowerCase().includes(normalizedQuery)) return true;
        if (emperor.eraName && emperor.eraName.toLowerCase().includes(normalizedQuery)) return true;
        return false;
    });
}

function searchEmperor(query) {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;
    
    const emperor = findEmperorByQuery(normalizedQuery);
    if (emperor) {
        showEmperorDetails(emperor);
        searchSuggestions.classList.remove('show');
    } else {
        alert('未找到该皇帝，请检查输入是否正确。可以尝试输入姓名、庙号、年号或谥号。');
    }
}

function showSuggestions(query) {
    if (!query.trim()) {
        searchSuggestions.classList.remove('show');
        return;
    }
    
    const normalizedQuery = query.toLowerCase();
    const matches = currentRanking.filter(emperor => {
        if (emperor.name.toLowerCase().includes(normalizedQuery)) return true;
        if (emperor.templeName && emperor.templeName.toLowerCase().includes(normalizedQuery)) return true;
        if (emperor.posthumousName && emperor.posthumousName.toLowerCase().includes(normalizedQuery)) return true;
        if (emperor.eraName && emperor.eraName.toLowerCase().includes(normalizedQuery)) return true;
        return false;
    });
    
    if (matches.length === 0) {
        searchSuggestions.classList.remove('show');
        return;
    }
    
    searchSuggestions.innerHTML = '';
    matches.slice(0, 10).forEach(emperor => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        let matchedTitle = null;
        if (emperor.templeName && emperor.templeName.toLowerCase().includes(normalizedQuery)) {
            matchedTitle = emperor.templeName;
        } else if (emperor.posthumousName && emperor.posthumousName.toLowerCase().includes(normalizedQuery)) {
            matchedTitle = emperor.posthumousName;
        } else if (emperor.eraName && emperor.eraName.toLowerCase().includes(normalizedQuery)) {
            matchedTitle = emperor.eraName;
        }
        const displayText = matchedTitle ? `${emperor.name} (${matchedTitle})` : emperor.name;
        item.textContent = displayText;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            emperorSearch.value = emperor.name;
            searchEmperor(emperor.name);
            searchSuggestions.classList.remove('show');
        });
        searchSuggestions.appendChild(item);
    });
    
    searchSuggestions.classList.add('show');
}

    function setupEventListeners() {
        if (!searchBtn || !emperorSearch || !searchSuggestions || 
            !firstPageBtn || !prevPageBtn || !nextPageBtn || !lastPageBtn) {
            return;
        }

        searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
            searchEmperor(emperorSearch.value);
        });

        emperorSearch.addEventListener('input', (e) => {
            showSuggestions(e.target.value);
        });

        emperorSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchEmperor(emperorSearch.value);
            }
        });

        document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            searchSuggestions.classList.remove('show');
            }
        });

        firstPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInitialized) displayPage(1);
    });
    
    prevPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInitialized) displayPage(currentPage - 1);
    });
    
    nextPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInitialized) displayPage(currentPage + 1);
    });
    
    lastPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInitialized) {
            displayPage(Math.ceil(currentRanking.length / pageSize));
        }
    });

    if (dynastyFirstPageBtn && dynastyPrevPageBtn && dynastyNextPageBtn && dynastyLastPageBtn) {
        dynastyFirstPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            renderDynastyPage(1);
        });

        dynastyPrevPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            renderDynastyPage(dynastyPage - 1);
        });

        dynastyNextPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            renderDynastyPage(dynastyPage + 1);
        });

        dynastyLastPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const totalPages = Math.max(1, Math.ceil(dynastyRankingData.length / dynastyPageSize));
            renderDynastyPage(totalPages);
        });
    }

    if (dynastyFilter) {
        dynastyFilter.addEventListener('change', async (e) => {
            selectedDynasty = e.target.value;
            try {
                topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">正在加载数据...</div>';
                
                const filteredEmperors = await loadEmperors(selectedDynasty);
                currentRanking = [...filteredEmperors].sort((a, b) => b.total - a.total);
                currentPage = 1;
                
                if (selectedDynasty) {
                    window.EMPERORS = filteredEmperors;
                } else {
                    window.EMPERORS = await loadEmperors();
                }
                
                if (selectedDynasty) {
                    rankingTitle.textContent = `${selectedDynasty} (${currentRanking.length}人)`;
                } else {
                    rankingTitle.textContent = 'TOP 10';
                }
                
                displayPage(1);
                document.querySelector('.ranking-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                console.error('筛选失败:', error);
                topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #d32f2f;">筛选失败，请重试</div>';
            }
        });
    }
}

function renderDynastyPage(page = 1) {
    if (!dynastyRankingData.length || !dynastyRankingList) return;

    const totalPages = Math.max(1, Math.ceil(dynastyRankingData.length / dynastyPageSize));
    dynastyPage = Math.min(Math.max(page, 1), totalPages);

    if (dynastyPageInfo) {
        dynastyPageInfo.textContent = `${dynastyPage} / ${totalPages}`;
    }
    if (dynastyPrevPageBtn && dynastyFirstPageBtn) {
        dynastyPrevPageBtn.disabled = dynastyPage === 1;
        dynastyFirstPageBtn.disabled = dynastyPage === 1;
    }
    if (dynastyNextPageBtn && dynastyLastPageBtn) {
        dynastyNextPageBtn.disabled = dynastyPage === totalPages;
        dynastyLastPageBtn.disabled = dynastyPage === totalPages;
    }

    const start = (dynastyPage - 1) * dynastyPageSize;
    const items = dynastyRankingData.slice(start, start + dynastyPageSize);

    dynastyRankingList.innerHTML = '';
    items.forEach((dynasty, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'dynasty-ranking-item';

        const absoluteIndex = start + index;
        const rankClass = absoluteIndex === 0 ? 'top1' : absoluteIndex === 1 ? 'top2' : absoluteIndex === 2 ? 'top3' : '';

        let avgScore = 0;
        if (dynasty.avgScore !== undefined && dynasty.avgScore !== null) {
            avgScore = parseFloat(dynasty.avgScore);
            if (isNaN(avgScore)) avgScore = 0;
        }
        const displayScore = avgScore.toFixed(2);

        rankItem.innerHTML = `
            <div class="dynasty-rank-number ${rankClass}">${dynasty.rank || (absoluteIndex + 1)}</div>
            <div class="dynasty-rank-info">
                <div class="dynasty-rank-name">${dynasty.name}</div>
                <div class="dynasty-rank-stats">
                    <span>平均分: ${displayScore}</span>
                    <span>皇帝数: ${dynasty.count}人</span>
                </div>
            </div>
        `;

        rankItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dynastyFilter.value = dynasty.name;
            dynastyFilter.dispatchEvent(new Event('change'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        dynastyRankingList.appendChild(rankItem);
    });
}

async function displayDynastyRanking() {
    try {
        const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
        const response = await fetch(`${API_BASE_URL}/api/dynasties`);
        if (!response.ok) {
            throw new Error('获取朝代列表失败');
        }
        const dynasties = await response.json();

        dynasties.sort((a, b) => {
            const aScore = parseFloat(a.avgScore) || 0;
            const bScore = parseFloat(b.avgScore) || 0;
            return bScore - aScore;
        });

        dynastyRankingData = dynasties;
        renderDynastyPage(1);
    } catch (error) {
        console.error('显示朝代排行榜失败:', error);
        dynastyRankingList.innerHTML = '<div style="text-align: center; padding: 20px; color: #d32f2f;">加载失败</div>';
    }
}

async function loadDynasties() {
    try {
        const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
        const response = await fetch(`${API_BASE_URL}/api/dynasties`);
        if (!response.ok) {
            throw new Error(`获取朝代列表失败: ${response.status}`);
        }
        const dynasties = await response.json();
        
        dynasties.sort((a, b) => {
            const mainDynasties = ['秦', '西汉', '东汉', '魏', '蜀汉', '吴', '西晋', '东晋', '隋', '唐', '北宋', '南宋', '元', '明', '清'];
            const aIndex = mainDynasties.indexOf(a.name);
            const bIndex = mainDynasties.indexOf(b.name);
            
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.name.localeCompare(b.name, 'zh-CN');
        });
        
        const totalCount = dynasties.reduce((sum, dynasty) => sum + dynasty.count, 0);
        dynastyFilter.innerHTML = `<option value="">全部朝代 (${totalCount}人)</option>`;
        dynasties.forEach(dynasty => {
            const option = document.createElement('option');
            option.value = dynasty.name;
            option.textContent = `${dynasty.name} (${dynasty.count}人)`;
            dynastyFilter.appendChild(option);
        });
    } catch (error) {
        console.error('加载朝代列表失败:', error);
        dynastyFilter.innerHTML = '<option value="">全部朝代</option>';
        const errorOption = document.createElement('option');
        errorOption.value = '';
        errorOption.textContent = '⚠ 朝代列表加载失败，请检查服务器是否运行';
        errorOption.disabled = true;
        errorOption.style.color = '#d32f2f';
        dynastyFilter.appendChild(errorOption);
    }
}

async function loadEmperors(dynasty = '') {
    try {
        const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
        const url = dynasty ? `${API_BASE_URL}/api/emperors?dynasty=${encodeURIComponent(dynasty)}` : `${API_BASE_URL}/api/emperors`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('获取皇帝列表失败');
        }
        return await response.json();
    } catch (error) {
        console.error('加载皇帝数据失败:', error);
        throw error;
    }
}

async function initializeApp() {
    try {
        topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">正在加载数据...</div>';
        
        const { WEIGHTS: loadedWeights } = await initData();
        window.WEIGHTS = loadedWeights;
        
        await loadDynasties();
        const loadedEmperors = await loadEmperors();
        window.EMPERORS = loadedEmperors;
        
        const totalCount = loadedEmperors.length;
        const allDynastyOption = dynastyFilter.querySelector('option[value=""]');
        if (allDynastyOption) {
            allDynastyOption.textContent = `全部朝代 (${totalCount}人)`;
        }
        
        currentRanking = [...loadedEmperors].sort((a, b) => b.total - a.total);
        isInitialized = true;
        
        displayPage(1);
        await displayDynastyRanking();
    } catch (error) {
        console.error('应用初始化失败:', error);
        topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #d32f2f;">数据加载失败，请刷新页面重试</div>';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        initializeApp();
    });
} else {
    setupEventListeners();
    initializeApp();
}
