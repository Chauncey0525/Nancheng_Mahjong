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
const dynastyFilter = document.getElementById('dynastyFilter');
const dynastyRankingList = document.getElementById('dynastyRankingList');

// 初始化
let currentRanking = [];
let currentPage = 1;
const pageSize = 10;
let isInitialized = false;
let selectedDynasty = '';

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
    if (selectedDynasty) {
        // 如果选择了朝代，显示朝代名称和当前页范围
        if (currentPage === 1) {
            rankingTitle.textContent = `${selectedDynasty} (共${currentRanking.length}人)`;
        } else {
            const startRank = (currentPage - 1) * pageSize + 1;
            const endRank = Math.min(currentPage * pageSize, currentRanking.length);
            rankingTitle.textContent = `${selectedDynasty} - 第 ${startRank}-${endRank} 名 (共${currentRanking.length}人)`;
        }
    } else {
        // 全部朝代
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
    pageItems.forEach((emperor, index) => {
        // 总排名必须直接从数据库的rank字段读取，不受筛选影响
        // 如果globalRank不存在或为null，说明数据有问题，不应该显示
        if (emperor.globalRank === undefined || emperor.globalRank === null) {
            console.error(`错误: ${emperor.name} 缺少 globalRank（数据库rank字段），数据可能未正确加载`);
        }
        
        // 直接使用数据库的rank字段作为总排名，不使用任何计算值
        const actualGlobalRank = emperor.globalRank;
        
        if (actualGlobalRank === undefined || actualGlobalRank === null) {
            console.warn(`警告: ${emperor.name} 的globalRank为${actualGlobalRank}，跳过显示`);
            return; // 跳过没有rank的皇帝
        }
        
        const rankItem = document.createElement('div');
        rankItem.className = 'ranking-item';
        
        // 排名样式基于总排名（数据库的rank字段）
        const rankClass = actualGlobalRank === 1 ? 'top1' : actualGlobalRank === 2 ? 'top2' : actualGlobalRank === 3 ? 'top3' : '';
        
        // 显示总排名（来自数据库rank字段）和当朝排名（来自数据库dynasty_rank字段）
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
            // 直接使用数据库的rank字段，不传递任何计算值
            showEmperorDetails(emperor);
            emperorSearch.value = emperor.name;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        topRankingList.appendChild(rankItem);
    });
}

// 显示皇帝详情
// 注意：总排名使用数据库的rank字段，当朝排名使用数据库的dynasty_rank字段
function showEmperorDetails(emperor) {
    // 安全检查：确保所有必需的DOM元素存在
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
    
    // 显示庙号、谥号、年号
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
    
    // ========== 总排名：必须使用数据库的rank字段 ==========
    // 数据库字段：rank -> API返回：globalRank -> 前端显示：emperor.globalRank
    if (emperor.globalRank === undefined || emperor.globalRank === null) {
        console.error(`错误: ${emperor.name} 缺少 globalRank（数据库rank字段）`);
        emperorGlobalRankElement.textContent = '未知';
    } else {
        // 直接使用数据库的rank字段（通过globalRank传递），不使用任何计算值
        emperorGlobalRankElement.textContent = `第${emperor.globalRank}名`;
    }
    
    // ========== 当朝排名：必须使用数据库的dynasty_rank字段 ==========
    // 数据库字段：dynasty_rank -> API返回：dynastyRank -> 前端显示：emperor.dynastyRank
    if (emperorDynastyRankElement && dynastyRankBadgeElement) {
        if (emperor.dynastyRank !== undefined && emperor.dynastyRank !== null) {
            // 直接使用数据库的dynasty_rank字段（通过dynastyRank传递），不使用任何计算值
            emperorDynastyRankElement.textContent = `第${emperor.dynastyRank}名`;
            dynastyRankBadgeElement.style.display = 'flex';
        } else {
            // 如果没有当朝排名，隐藏当朝排名徽章
            dynastyRankBadgeElement.style.display = 'none';
        }
    }
    
    emperorTotalElement.textContent = emperor.total.toFixed(2);
    // intro和bio已合并到bio字段，只显示bio
    const mergedContent = emperor.bio || emperor.intro || '';
    const emperorBioElement = document.getElementById('emperorBio');
    if (emperorBioElement) {
        emperorBioElement.textContent = mergedContent;
    } else {
        console.warn('emperorBio 元素未找到');
    }
    
    // 显示评分
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
        // 匹配庙号、谥号、年号
        if (emperor.templeName && emperor.templeName.toLowerCase().includes(normalizedQuery)) {
            return true;
        }
        if (emperor.posthumousName && emperor.posthumousName.toLowerCase().includes(normalizedQuery)) {
            return true;
        }
        if (emperor.eraName && emperor.eraName.toLowerCase().includes(normalizedQuery)) {
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
        // 使用皇帝对象中的固定排名，而不是在当前筛选结果中的排名
        showEmperorDetails(emperor);
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
        // 匹配庙号、谥号、年号
        if (emperor.templeName && emperor.templeName.toLowerCase().includes(normalizedQuery)) {
            return true;
        }
        if (emperor.posthumousName && emperor.posthumousName.toLowerCase().includes(normalizedQuery)) {
            return true;
        }
        if (emperor.eraName && emperor.eraName.toLowerCase().includes(normalizedQuery)) {
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
        // 显示真实姓名和匹配的庙号/谥号/年号
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

// 事件监听 - 确保DOM元素存在后再绑定
function setupEventListeners() {
    // 检查所有必需的DOM元素是否存在
    if (!searchBtn || !emperorSearch || !searchSuggestions || 
        !firstPageBtn || !prevPageBtn || !nextPageBtn || !lastPageBtn) {
        console.error('某些DOM元素未找到，无法绑定事件监听器');
        return;
    }

    // 搜索按钮事件
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        searchEmperor(emperorSearch.value);
    });

    // 搜索输入事件
    emperorSearch.addEventListener('input', (e) => {
        showSuggestions(e.target.value);
    });

    emperorSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
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

    // 朝代筛选事件
    if (dynastyFilter) {
        dynastyFilter.addEventListener('change', async (e) => {
            selectedDynasty = e.target.value;
            try {
                // 显示加载提示
                topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">正在加载数据...</div>';
                
                // 加载筛选后的皇帝数据（保持原有的globalRank和dynastyRank）
                const filteredEmperors = await loadEmperors(selectedDynasty);
                currentRanking = [...filteredEmperors].sort((a, b) => b.total - a.total);
                // 确保每个皇帝都有globalRank和dynastyRank
                currentRanking.forEach((emp, index) => {
                    if (emp.globalRank === undefined) {
                        console.warn(`警告: ${emp.name} 缺少 globalRank`);
                    }
                    if (emp.dynasty && emp.dynastyRank === undefined) {
                        console.warn(`警告: ${emp.name} 缺少 dynastyRank`);
                    }
                });
                currentPage = 1;
                
                // 更新全局EMPERORS（用于搜索功能）
                if (selectedDynasty) {
                    window.EMPERORS = filteredEmperors;
                } else {
                    // 如果选择"全部朝代"，重新加载所有数据
                    window.EMPERORS = await loadEmperors();
                }
                
                // 更新标题显示当前筛选的朝代
                if (selectedDynasty) {
                    const selectedOption = dynastyFilter.options[dynastyFilter.selectedIndex];
                    rankingTitle.textContent = `${selectedDynasty} (${currentRanking.length}人)`;
                } else {
                    rankingTitle.textContent = 'TOP 10';
                }
                
                displayPage(1);
                
                // 滚动到排行榜
                document.querySelector('.ranking-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                console.error('筛选失败:', error);
                topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #d32f2f;">筛选失败，请重试</div>';
            }
        });
    }
}

// 显示朝代排行榜
async function displayDynastyRanking() {
    try {
        const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
        const response = await fetch(`${API_BASE_URL}/api/dynasties`);
        if (!response.ok) {
            throw new Error('获取朝代列表失败');
        }
        const dynasties = await response.json();
        
        // 按平均分排序（后端已排序，但确保一下）
        dynasties.sort((a, b) => {
            const aScore = parseFloat(a.avgScore) || 0;
            const bScore = parseFloat(b.avgScore) || 0;
            return bScore - aScore;
        });
        
        dynastyRankingList.innerHTML = '';
        dynasties.forEach((dynasty, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'dynasty-ranking-item';
            
            const rankClass = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : '';
            
            // 确保 avgScore 是数字
            let avgScore = 0;
            if (dynasty.avgScore !== undefined && dynasty.avgScore !== null) {
                avgScore = parseFloat(dynasty.avgScore);
                if (isNaN(avgScore)) {
                    avgScore = 0;
                }
            }
            const displayScore = avgScore.toFixed(2);
            
            rankItem.innerHTML = `
                <div class="dynasty-rank-number ${rankClass}">${dynasty.rank || (index + 1)}</div>
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
    } catch (error) {
        console.error('显示朝代排行榜失败:', error);
        dynastyRankingList.innerHTML = '<div style="text-align: center; padding: 20px; color: #d32f2f;">加载失败</div>';
    }
}

// 加载朝代列表
async function loadDynasties() {
    try {
        const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
        console.log('正在加载朝代列表...', `${API_BASE_URL}/api/dynasties`);
        
        const response = await fetch(`${API_BASE_URL}/api/dynasties`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API响应错误:', response.status, errorText);
            throw new Error(`获取朝代列表失败: ${response.status}`);
        }
        const dynasties = await response.json();
        console.log('朝代列表加载成功:', dynasties.length, '个朝代');
        
        // 按朝代名称排序
        dynasties.sort((a, b) => {
            // 先按朝代类型分组：主要朝代在前
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
        
        // 计算总人数
        const totalCount = dynasties.reduce((sum, dynasty) => sum + dynasty.count, 0);
        
        // 清空并填充下拉框
        dynastyFilter.innerHTML = `<option value="">全部朝代 (${totalCount}人)</option>`;
        dynasties.forEach(dynasty => {
            const option = document.createElement('option');
            option.value = dynasty.name;
            option.textContent = `${dynasty.name} (${dynasty.count}人)`;
            dynastyFilter.appendChild(option);
        });
        
        console.log(`✓ 已加载 ${dynasties.length} 个朝代到下拉框`);
    } catch (error) {
        console.error('加载朝代列表失败:', error);
        // 显示友好的错误提示
        dynastyFilter.innerHTML = '<option value="">全部朝代</option>';
        const errorOption = document.createElement('option');
        errorOption.value = '';
        errorOption.textContent = '⚠ 朝代列表加载失败，请检查服务器是否运行';
        errorOption.disabled = true;
        errorOption.style.color = '#d32f2f';
        dynastyFilter.appendChild(errorOption);
    }
}
    
// 加载皇帝数据
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
    
// 初始化：加载数据并显示排行榜
async function initializeApp() {
    try {
        // 显示加载提示
        topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">正在加载数据...</div>';
        
        // 加载权重配置
        const { WEIGHTS: loadedWeights } = await initData();
        window.WEIGHTS = loadedWeights;
        
        // 加载朝代列表
        await loadDynasties();
        
        // 加载皇帝数据
        const loadedEmperors = await loadEmperors();
        window.EMPERORS = loadedEmperors;
        
        // 更新"全部朝代"选项的总人数（使用实际加载的皇帝数量）
        const totalCount = loadedEmperors.length;
        const allDynastyOption = dynastyFilter.querySelector('option[value=""]');
        if (allDynastyOption) {
            allDynastyOption.textContent = `全部朝代 (${totalCount}人)`;
        }
        
        // 构建排行榜（保持原有的globalRank和dynastyRank）
        currentRanking = [...loadedEmperors].sort((a, b) => b.total - a.total);
        // 确保每个皇帝都有globalRank和dynastyRank
        currentRanking.forEach((emp, index) => {
            if (emp.globalRank === undefined) {
                console.warn(`警告: ${emp.name} 缺少 globalRank`);
            }
            if (emp.dynasty && emp.dynastyRank === undefined) {
                console.warn(`警告: ${emp.name} 缺少 dynastyRank`);
            }
        });
        isInitialized = true;
        
        // 显示第一页
        displayPage(1);
        
        // 显示朝代排行榜
        await displayDynastyRanking();
        
        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);
        topRankingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #d32f2f;">数据加载失败，请刷新页面重试</div>';
    }
}

// 确保DOM加载完成后再初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        initializeApp();
    });
} else {
    // DOM已经加载完成
    setupEventListeners();
    initializeApp();
}
