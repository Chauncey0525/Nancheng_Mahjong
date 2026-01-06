// 游戏状态
let gameState = {
    correctPerson: null,
    correctPersonInfo: null,
    initialHint: '',
    guesses: [],
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    isGameActive: false,
    isLoading: false,
    currentGuessCount: 0
};

// DOM 元素
const elements = {
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    submitBtn: document.getElementById('submit-btn'),
    skipBtn: document.getElementById('skip-btn'),
    revealBtn: document.getElementById('reveal-btn'),
    answerInput: document.getElementById('answer-input'),
    initialHint: document.getElementById('initial-hint'),
    comparisonSection: document.getElementById('comparison-section'),
    comparisonContainer: document.getElementById('comparison-container'),
    guessesHistory: document.getElementById('guesses-history'),
    guessesList: document.getElementById('guesses-list'),
    message: document.getElementById('message'),
    score: document.getElementById('score'),
    streak: document.getElementById('streak'),
    total: document.getElementById('total'),
    accuracy: document.getElementById('accuracy'),
    hintsUsed: document.getElementById('hints-used'),
    skips: document.getElementById('skips')
};

// 指标标签映射（只显示基本资讯中的指标）
const indicatorLabels = {
    chName: '中文名',
    birthYear: '生年',
    deathYear: '卒年',
    ageAtDeath: '享年',
    dynasty: '朝代',
    gender: '性别',
    placeOfOrigin: '籍贯'
};

// 初始化游戏
function initGame() {
    // 绑定事件
    elements.startBtn.addEventListener('click', startGame);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.submitBtn.addEventListener('click', submitGuess);
    elements.skipBtn.addEventListener('click', skipQuestion);
    elements.revealBtn.addEventListener('click', revealAnswer);
    
    // 回车键提交
    elements.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !elements.submitBtn.disabled) {
            submitGuess();
        }
    });
}

// 开始游戏
async function startGame() {
    gameState.isGameActive = true;
    gameState.currentGuessCount = 0;
    gameState.guesses = [];
    elements.startBtn.style.display = 'none';
    elements.resetBtn.style.display = 'inline-block';
    
    await loadNewQuestion();
}

// 重置游戏
function resetGame() {
    gameState = {
        correctPerson: null,
        correctPersonInfo: null,
        initialHint: '',
        guesses: [],
        score: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        isGameActive: false,
        isLoading: false,
        currentGuessCount: 0
    };
    
    updateUI();
    elements.startBtn.style.display = 'inline-block';
    elements.resetBtn.style.display = 'none';
    elements.initialHint.innerHTML = '<p class="intro-text">点击"开始游戏"按钮开始猜历史人物！<br><small style="color: #6c757d; font-size: 0.9em;">数据实时从CBDB数据库获取</small></p>';
    elements.comparisonSection.style.display = 'none';
    elements.guessesHistory.style.display = 'none';
    elements.comparisonContainer.innerHTML = '';
    elements.guessesList.innerHTML = '';
    hideMessage();
}

// 加载新题目
async function loadNewQuestion() {
    if (gameState.isLoading) return;
    
    gameState.isLoading = true;
    gameState.currentGuessCount = 0;
    gameState.guesses = [];
    elements.comparisonSection.style.display = 'none';
    elements.guessesHistory.style.display = 'none';
    elements.comparisonContainer.innerHTML = '';
    elements.guessesList.innerHTML = '';
    
    // 显示加载状态
    elements.initialHint.innerHTML = '<p class="intro-text">正在从CBDB数据库加载历史人物信息...</p>';
    disableGameControls();
    
    try {
        // 从CBDB API获取随机历史人物
        const result = await CBDBAPI.getRandomPerson();
        gameState.correctPerson = result.name;
        
        // 提取完整的人物信息
        gameState.correctPersonInfo = CBDBAPI.extractPersonInfo(result.data, result.name);
        
        // 生成初始提示（只显示一个模糊的提示）
        gameState.initialHint = generateInitialHint(gameState.correctPersonInfo);
        
        // 显示初始提示
        displayInitialHint();
        enableGameControls();
        
    } catch (error) {
        console.error('加载题目失败:', error);
        showMessage('加载失败，请稍后重试', 'info');
        
        // 如果API调用失败，使用备用方案
        await loadBackupQuestion();
    } finally {
        gameState.isLoading = false;
    }
}

// 生成初始提示（限定为名字字数）
function generateInitialHint(personInfo) {
    const nameLength = personInfo.name.length;
    return `这位历史人物的姓名由${nameLength}个字组成`;
}

// 显示初始提示
function displayInitialHint() {
    elements.initialHint.innerHTML = `
        <div class="hint-item revealed">
            <strong>初始提示：</strong>${gameState.initialHint}
        </div>
    `;
}

// 备用题目加载（如果API失败）
async function loadBackupQuestion() {
    const randomName = HISTORICAL_FIGURES[Math.floor(Math.random() * HISTORICAL_FIGURES.length)];
    gameState.correctPerson = randomName;
    
    // 创建基本的人物信息
    gameState.correctPersonInfo = {
        name: randomName,
        birthYear: null,
        deathYear: null,
        dynasty: null,
        placeOfOrigin: null,
        office: null,
        occupation: null,
        ethnicity: null,
        nationality: '中国',
        achievements: [],
        achievementsDesc: null,
        gender: null,
        socialStatus: null
    };
    
    gameState.initialHint = `这是一位重要的历史人物，姓名由${randomName.length}个字组成`;
    displayInitialHint();
    enableGameControls();
}

// 提交猜测
async function submitGuess() {
    const guessedName = elements.answerInput.value.trim();
    
    if (!guessedName) {
        showMessage('请输入你猜测的历史人物姓名', 'info');
        return;
    }
    
    // 检查是否已经猜过（支持别名识别）
    const normalizedGuessed = CBDBAPI.normalizePersonName(guessedName);
    if (gameState.guesses.some(g => {
        const normalizedPrevious = CBDBAPI.normalizePersonName(g.name);
        return normalizedPrevious === normalizedGuessed;
    })) {
        showMessage('你已经猜过这个人物了，请尝试其他人物', 'info');
        elements.answerInput.value = '';
        return;
    }
    
    disableGameControls();
    elements.answerInput.value = '';
    
    // 显示加载状态
    showMessage('正在查询猜测的人物信息...', 'info');
    
    try {
        // 从CBDB获取猜测人物的信息
        const guessedData = await CBDBAPI.getPersonByName(guessedName);
        let guessedPersonInfo = CBDBAPI.extractPersonInfo(guessedData, guessedName);
        
        // 如果提取的数据不完整，至少确保有姓名和性别
        if (!guessedPersonInfo || Object.keys(guessedPersonInfo).length === 0) {
            console.warn('无法从CBDB提取猜测人物信息，使用基本信息');
            guessedPersonInfo = {
                name: guessedName,
                gender: '男', // 默认推断
                dynasty: null,
                placeOfOrigin: null,
                identity: null,
                ethnicity: null,
                importantPosition: null,
                birthYear: null,
                deathYear: null
            };
        }
        
        // 确保至少有人物姓名
        if (!guessedPersonInfo.name) {
            guessedPersonInfo.name = guessedName;
        }
        
        // 确保有性别（如果没有则推断）
        if (!guessedPersonInfo.gender) {
            guessedPersonInfo.gender = '男'; // 默认推断为男性
        }
        
        console.log('猜测人物信息:', guessedPersonInfo);
        console.log('正确答案信息:', gameState.correctPersonInfo);
        
        // 检查是否猜对（支持别名）
        const isCorrect = CBDBAPI.isSamePerson(guessedName, gameState.correctPerson);
        
        if (isCorrect) {
            // 猜对了！
            gameState.correctAnswers++;
            gameState.totalQuestions++;
            gameState.currentGuessCount++;
            
            // 计算得分（猜测次数越少得分越高）
            const baseScore = 1000;
            const penalty = (gameState.currentGuessCount - 1) * 100;
            const points = Math.max(100, baseScore - penalty);
            gameState.score += points;
            
            showMessage(`🎉 恭喜你猜对了！正确答案是：${gameState.correctPerson}！得分 +${points}`, 'correct');
            
            // 显示最终对比结果
            displayComparison(gameState.correctPersonInfo, guessedPersonInfo, true);
            
            // 延迟加载下一题
            setTimeout(() => {
                loadNewQuestion();
            }, 5000);
            
        } else {
            // 猜错了，显示对比结果
            gameState.currentGuessCount++;
            const comparison = CBDBAPI.comparePersons(gameState.correctPersonInfo, guessedPersonInfo);
            
            // 保存猜测记录
            gameState.guesses.push({
                name: guessedName,
                info: guessedPersonInfo,
                comparison: comparison
            });
            
            // 显示对比结果
            displayComparison(gameState.correctPersonInfo, guessedPersonInfo, false);
            displayGuessesHistory();
            
            showMessage(`❌ 猜错了！继续尝试，你已经猜了 ${gameState.currentGuessCount} 次`, 'incorrect');
            
            enableGameControls();
        }
        
        updateUI();
        
    } catch (error) {
        console.error('查询猜测人物失败:', error);
        showMessage('无法查询到该人物信息，请尝试其他人物', 'info');
        enableGameControls();
    }
}

// 检查答案（使用别名识别）
function checkAnswer(userAnswer, correctAnswer) {
    return CBDBAPI.isSamePerson(userAnswer, correctAnswer);
}

// 显示对比结果
function displayComparison(correctInfo, guessedInfo, isCorrect) {
    // 确保两个信息对象都存在
    if (!correctInfo || !guessedInfo) {
        console.error('对比信息不完整:', { correctInfo, guessedInfo });
        showMessage('对比信息不完整，请重试', 'info');
        return;
    }
    
    // 调试：打印对比前的数据
    console.log('对比前的数据:');
    console.log('正确答案:', correctInfo);
    console.log('你的猜测:', guessedInfo);
    
    const comparison = CBDBAPI.comparePersons(correctInfo, guessedInfo);
    
    // 调试：打印对比结果
    console.log('对比结果:', comparison);
    
    elements.comparisonSection.style.display = 'block';
    
    let html = `
        <div class="comparison-header">
            <h3>${isCorrect ? '🎉 恭喜猜对！' : '对比结果'}</h3>
            <div class="match-rate">匹配度: ${comparison.matchRate}%</div>
        </div>
        <div class="comparison-table">
            <div class="comparison-row header">
                <div class="comparison-cell">指标</div>
                <div class="comparison-cell">你的猜测</div>
                <div class="comparison-cell">正确答案</div>
                <div class="comparison-cell">状态</div>
            </div>
    `;
    
        // 遍历所有指标（排除name、chName和matchRate）
        Object.keys(comparison).forEach(key => {
            if (key === 'name' || key === 'chName' || key === 'matchRate') return;
            
            const comp = comparison[key];
            const label = indicatorLabels[key] || key;
            const match = comp.match;
            
            // 处理状态显示
            let statusText = '❌ 不一致';
            let statusClass = 'no-match';
            if (match === true) {
                statusText = '✅ 一致';
                statusClass = 'match';
            }
            
            html += `
            <div class="comparison-row ${statusClass}" data-label="${label}">
                <div class="comparison-cell indicator-name">
                    <span class="mobile-label">${label}:</span>
                    <span class="desktop-content">${label}</span>
                </div>
                <div class="comparison-cell guessed-value">
                    <span class="mobile-label">你的猜测:</span>
                    <span class="desktop-content">${formatValue(comp.guessed)}</span>
                </div>
                <div class="comparison-cell correct-value">
                    <span class="mobile-label">正确答案:</span>
                    <span class="desktop-content">${formatValue(comp.correct)}</span>
                </div>
                <div class="comparison-cell status">
                    <span class="mobile-label">状态:</span>
                    <span class="desktop-content">${statusText}</span>
                </div>
            </div>
        `;
        });
    
    html += '</div>';
    elements.comparisonContainer.innerHTML = html;
    
    // 滚动到对比区域
    elements.comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 格式化显示值
function formatValue(value) {
    if (value === null || value === undefined || value === '') {
        return '<span class="no-data">未知</span>';
    }
    if (Array.isArray(value)) {
        return value.length > 0 ? value.slice(0, 3).join('、') + (value.length > 3 ? '...' : '') : '<span class="no-data">未知</span>';
    }
    return String(value);
}

// 显示猜测历史
function displayGuessesHistory() {
    if (gameState.guesses.length === 0) return;
    
    elements.guessesHistory.style.display = 'block';
    
    let html = '';
    gameState.guesses.forEach((guess, index) => {
        const matchRate = guess.comparison.matchRate;
        html += `
            <div class="guess-item">
                <div class="guess-header">
                    <span class="guess-number">猜测 #${index + 1}</span>
                    <span class="guess-name">${guess.name}</span>
                    <span class="guess-match-rate">匹配度: ${matchRate}%</span>
                </div>
            </div>
        `;
    });
    
    elements.guessesList.innerHTML = html;
}

// 跳过题目
function skipQuestion() {
    gameState.totalQuestions++;
    showMessage(`已跳过，正确答案是：${gameState.correctPerson}`, 'info');
    
    // 延迟加载下一题
    setTimeout(() => {
        loadNewQuestion();
    }, 2000);
}

// 揭晓答案
function revealAnswer() {
    gameState.totalQuestions++;
    showMessage(`正确答案是：${gameState.correctPerson}`, 'info');
    
    // 显示完整信息
    displayPersonInfo(gameState.correctPersonInfo);
    
    // 延迟加载下一题
    setTimeout(() => {
        loadNewQuestion();
    }, 3000);
}

// 显示人物完整信息
function displayPersonInfo(personInfo) {
    elements.comparisonSection.style.display = 'block';
    
    let html = `
        <div class="comparison-header">
            <h3>正确答案：${personInfo.name}</h3>
        </div>
        <div class="person-info">
    `;
    
    Object.keys(indicatorLabels).forEach(key => {
        const value = personInfo[key];
        if (value !== null && value !== undefined && value !== '') {
            html += `
                <div class="info-item">
                    <span class="info-label">${indicatorLabels[key]}:</span>
                    <span class="info-value">${formatValue(value)}</span>
                </div>
            `;
        }
    });
    
    html += '</div>';
    elements.comparisonContainer.innerHTML = html;
}

// 显示消息
function showMessage(text, type = 'info') {
    elements.message.textContent = text;
    elements.message.className = `message show ${type}`;
    
    // 5秒后自动隐藏（对于错误消息）
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

// 隐藏消息
function hideMessage() {
    elements.message.classList.remove('show');
}

// 启用游戏控制
function enableGameControls() {
    elements.answerInput.disabled = false;
    elements.submitBtn.disabled = false;
    elements.skipBtn.disabled = false;
    elements.revealBtn.disabled = false;
    elements.answerInput.focus();
}

// 禁用游戏控制
function disableGameControls() {
    elements.answerInput.disabled = true;
    elements.submitBtn.disabled = true;
    elements.skipBtn.disabled = true;
    elements.revealBtn.disabled = true;
}

// 更新UI
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.streak.textContent = gameState.correctAnswers;
    elements.total.textContent = gameState.totalQuestions;
    
    // 计算正确率
    const accuracy = gameState.totalQuestions > 0 
        ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100)
        : 0;
    elements.accuracy.textContent = `${accuracy}%`;
    
    elements.hintsUsed.textContent = gameState.currentGuessCount;
    // 计算跳过次数（总题数减去答对题数，但当前进行中的题目不算）
    const skips = gameState.totalQuestions - gameState.correctAnswers;
    elements.skips.textContent = skips > 0 ? skips : 0;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initGame);
