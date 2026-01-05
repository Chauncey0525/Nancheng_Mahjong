// 游戏状态
const gameState = {
    deck: [],
    playerCards: [],
    opponentCards: [],
    communityCards: [],
    pot: 0,
    playerChips: 1000,
    opponentChips: 1000,
    currentBet: 0,
    playerBet: 0,
    opponentBet: 0,
    gamePhase: 'preflop', // preflop, flop, turn, river, showdown
    playerAction: null,
    opponentAction: null
};

// 卡牌花色和点数
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 创建一副牌
function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank, value: getCardValue(rank) });
        }
    }
    return shuffleDeck(deck);
}

// 洗牌
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 获取卡牌数值（用于比较）
function getCardValue(rank) {
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
    return parseInt(rank);
}

// 初始化游戏
function initGame() {
    gameState.deck = createDeck();
    gameState.playerCards = [];
    gameState.opponentCards = [];
    gameState.communityCards = [];
    gameState.pot = 0;
    gameState.currentBet = 0;
    gameState.playerBet = 0;
    gameState.opponentBet = 0;
    gameState.gamePhase = 'preflop';
    gameState.playerAction = null;
    gameState.opponentAction = null;

    // 发牌
    gameState.playerCards = [gameState.deck.pop(), gameState.deck.pop()];
    gameState.opponentCards = [gameState.deck.pop(), gameState.deck.pop()];

    // 小盲注和大盲注
    const smallBlind = 10;
    const bigBlind = 20;
    gameState.playerBet = bigBlind;
    gameState.opponentBet = smallBlind;
    gameState.pot = smallBlind + bigBlind;
    gameState.currentBet = bigBlind;
    gameState.playerChips -= bigBlind;
    gameState.opponentChips -= smallBlind;

    updateUI();
    showMessage('游戏开始！你是大盲注，请选择操作。');
    enableActions();
}

// 更新UI
function updateUI() {
    // 更新筹码和底池
    document.getElementById('pot').textContent = gameState.pot;
    document.getElementById('current-bet').textContent = gameState.currentBet;
    document.getElementById('player-chips').textContent = gameState.playerChips;

    // 显示玩家手牌
    const playerCardsDiv = document.getElementById('player-cards');
    playerCardsDiv.innerHTML = '';
    gameState.playerCards.forEach(card => {
        playerCardsDiv.appendChild(createCardElement(card));
    });

    // 显示电脑手牌（背面）
    const opponentCardsDiv = document.getElementById('opponent-cards');
    opponentCardsDiv.innerHTML = '';
    gameState.opponentCards.forEach(() => {
        const cardBack = document.createElement('div');
        cardBack.className = 'card back';
        opponentCardsDiv.appendChild(cardBack);
    });

    // 显示公共牌
    const communityCardsDiv = document.getElementById('community-cards');
    communityCardsDiv.innerHTML = '';
    gameState.communityCards.forEach(card => {
        communityCardsDiv.appendChild(createCardElement(card));
    });

    // 显示手牌类型
    if (gameState.communityCards.length > 0) {
        const playerHand = evaluateHand([...gameState.playerCards, ...gameState.communityCards]);
        document.getElementById('player-hand-type').textContent = playerHand.name;
    } else {
        document.getElementById('player-hand-type').textContent = '';
    }
}

// 创建卡牌元素
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.classList.add(card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
    
    const rankDiv = document.createElement('div');
    rankDiv.className = 'card-rank';
    rankDiv.textContent = card.rank;
    
    const suitDiv = document.createElement('div');
    suitDiv.className = 'card-suit';
    suitDiv.textContent = card.suit;
    
    cardDiv.appendChild(rankDiv);
    cardDiv.appendChild(suitDiv);
    
    return cardDiv;
}

// 下注
function bet(amount) {
    if (amount > gameState.playerChips) {
        showMessage('筹码不足！');
        return;
    }
    
    if (amount < gameState.currentBet - gameState.playerBet) {
        showMessage(`下注金额至少需要 ${gameState.currentBet - gameState.playerBet}`);
        return;
    }

    const totalBet = amount;
    const additionalBet = totalBet - gameState.playerBet;
    
    gameState.playerChips -= additionalBet;
    gameState.playerBet = totalBet;
    gameState.pot += additionalBet;
    
    if (totalBet > gameState.currentBet) {
        gameState.currentBet = totalBet;
    }
    
    gameState.playerAction = 'bet';
    updateUI();
    disableActions();
    
    setTimeout(() => {
        opponentAction();
    }, 1000);
}

// 过牌
function check() {
    if (gameState.playerBet < gameState.currentBet) {
        showMessage('你不能过牌，需要跟注或加注！');
        return;
    }
    
    gameState.playerAction = 'check';
    disableActions();
    
    setTimeout(() => {
        opponentAction();
    }, 1000);
}

// 弃牌
function fold() {
    gameState.playerAction = 'fold';
    showMessage('你弃牌了，电脑获胜！', 'lose');
    disableActions();
    setTimeout(() => {
        initGame();
    }, 3000);
}

// 全押
function allIn() {
    bet(gameState.playerChips);
}

// 电脑行动
function opponentAction() {
    if (gameState.playerAction === 'fold') return;
    
    const allCards = [...gameState.opponentCards, ...gameState.communityCards];
    const handStrength = evaluateHandStrength(allCards);
    const randomFactor = Math.random();
    
    let action;
    
    if (gameState.playerAction === 'fold') {
        // 玩家已弃牌，电脑自动获胜
        return;
    }
    
    // 简单的AI逻辑
    if (handStrength > 0.7 || randomFactor > 0.8) {
        // 手牌很强或随机因素，加注或全押
        const raiseAmount = Math.min(
            gameState.currentBet + Math.floor(Math.random() * 100) + 50,
            gameState.opponentChips
        );
        if (raiseAmount > gameState.currentBet) {
            const additionalBet = raiseAmount - gameState.opponentBet;
            if (additionalBet <= gameState.opponentChips) {
                gameState.opponentChips -= additionalBet;
                gameState.opponentBet = raiseAmount;
                gameState.pot += additionalBet;
                gameState.currentBet = raiseAmount;
                gameState.opponentAction = 'raise';
                showMessage(`电脑加注到 ${raiseAmount}`);
            } else {
                // 跟注
                const callAmount = gameState.currentBet - gameState.opponentBet;
                gameState.opponentChips -= callAmount;
                gameState.opponentBet = gameState.currentBet;
                gameState.pot += callAmount;
                gameState.opponentAction = 'call';
                showMessage('电脑跟注');
            }
        } else {
            // 跟注
            const callAmount = gameState.currentBet - gameState.opponentBet;
            gameState.opponentChips -= callAmount;
            gameState.opponentBet = gameState.currentBet;
            gameState.pot += callAmount;
            gameState.opponentAction = 'call';
            showMessage('电脑跟注');
        }
    } else if (handStrength > 0.4 || randomFactor > 0.5) {
        // 手牌一般，跟注或过牌
        if (gameState.currentBet > gameState.opponentBet) {
            const callAmount = gameState.currentBet - gameState.opponentBet;
            if (callAmount <= gameState.opponentChips) {
                gameState.opponentChips -= callAmount;
                gameState.opponentBet = gameState.currentBet;
                gameState.pot += callAmount;
                gameState.opponentAction = 'call';
                showMessage('电脑跟注');
            } else {
                gameState.opponentAction = 'fold';
                showMessage('电脑弃牌，你获胜！', 'win');
                gameState.playerChips += gameState.pot;
                disableActions();
                setTimeout(() => {
                    initGame();
                }, 3000);
                return;
            }
        } else {
            gameState.opponentAction = 'check';
            showMessage('电脑过牌');
        }
    } else {
        // 手牌很弱，弃牌
        if (gameState.currentBet - gameState.opponentBet > gameState.opponentChips * 0.3) {
            gameState.opponentAction = 'fold';
            showMessage('电脑弃牌，你获胜！', 'win');
            gameState.playerChips += gameState.pot;
            disableActions();
            setTimeout(() => {
                initGame();
            }, 3000);
            return;
        } else {
            const callAmount = gameState.currentBet - gameState.opponentBet;
            gameState.opponentChips -= callAmount;
            gameState.opponentBet = gameState.currentBet;
            gameState.pot += callAmount;
            gameState.opponentAction = 'call';
            showMessage('电脑跟注');
        }
    }
    
    updateUI();
    
    // 检查是否进入下一阶段
    if (gameState.playerBet === gameState.opponentBet && 
        (gameState.playerAction === 'check' || gameState.playerAction === 'call' || gameState.playerAction === 'bet') &&
        (gameState.opponentAction === 'check' || gameState.opponentAction === 'call' || gameState.opponentAction === 'raise')) {
        nextPhase();
    } else {
        // 需要玩家行动
        enableActions();
    }
}

// 进入下一阶段
function nextPhase() {
    if (gameState.gamePhase === 'preflop') {
        gameState.gamePhase = 'flop';
        gameState.communityCards = [
            gameState.deck.pop(),
            gameState.deck.pop(),
            gameState.deck.pop()
        ];
        gameState.playerBet = 0;
        gameState.opponentBet = 0;
        gameState.currentBet = 0;
        gameState.playerAction = null;
        gameState.opponentAction = null;
        showMessage('翻牌圈！');
    } else if (gameState.gamePhase === 'flop') {
        gameState.gamePhase = 'turn';
        gameState.communityCards.push(gameState.deck.pop());
        gameState.playerBet = 0;
        gameState.opponentBet = 0;
        gameState.currentBet = 0;
        gameState.playerAction = null;
        gameState.opponentAction = null;
        showMessage('转牌圈！');
    } else if (gameState.gamePhase === 'turn') {
        gameState.gamePhase = 'river';
        gameState.communityCards.push(gameState.deck.pop());
        gameState.playerBet = 0;
        gameState.opponentBet = 0;
        gameState.currentBet = 0;
        gameState.playerAction = null;
        gameState.opponentAction = null;
        showMessage('河牌圈！');
    } else if (gameState.gamePhase === 'river') {
        showdown();
        return;
    }
    
    updateUI();
    
    // 电脑先行动（如果玩家是大盲注）
    if (gameState.gamePhase === 'flop' || gameState.gamePhase === 'turn' || gameState.gamePhase === 'river') {
        setTimeout(() => {
            opponentAction();
        }, 1000);
    } else {
        enableActions();
    }
}

// 摊牌
function showdown() {
    gameState.gamePhase = 'showdown';
    
    // 显示电脑手牌
    const opponentCardsDiv = document.getElementById('opponent-cards');
    opponentCardsDiv.innerHTML = '';
    gameState.opponentCards.forEach(card => {
        opponentCardsDiv.appendChild(createCardElement(card));
    });
    
    const playerHand = evaluateHand([...gameState.playerCards, ...gameState.communityCards]);
    const opponentHand = evaluateHand([...gameState.opponentCards, ...gameState.communityCards]);
    
    document.getElementById('player-hand-type').textContent = playerHand.name;
    document.getElementById('opponent-hand-type').textContent = opponentHand.name;
    
    const result = compareHands(playerHand, opponentHand);
    
    if (result > 0) {
        showMessage(`你获胜！${playerHand.name} 击败 ${opponentHand.name}`, 'win');
        gameState.playerChips += gameState.pot;
    } else if (result < 0) {
        showMessage(`电脑获胜！${opponentHand.name} 击败 ${playerHand.name}`, 'lose');
        gameState.opponentChips += gameState.pot;
    } else {
        showMessage(`平局！双方都是 ${playerHand.name}`);
        gameState.playerChips += Math.floor(gameState.pot / 2);
        gameState.opponentChips += Math.floor(gameState.pot / 2);
    }
    
    updateUI();
    disableActions();
    
    setTimeout(() => {
        initGame();
    }, 5000);
}

// 评估手牌强度（0-1之间的值）
function evaluateHandStrength(cards) {
    if (cards.length < 5) return 0.3; // 只有手牌，无法准确评估
    
    const hand = evaluateHand(cards);
    const strengthMap = {
        '高牌': 0.1,
        '一对': 0.3,
        '两对': 0.4,
        '三条': 0.5,
        '顺子': 0.6,
        '同花': 0.65,
        '葫芦': 0.75,
        '四条': 0.9,
        '同花顺': 0.95,
        '皇家同花顺': 1.0
    };
    
    return strengthMap[hand.name] || 0.1;
}

// 评估手牌
function evaluateHand(cards) {
    const sortedCards = [...cards].sort((a, b) => b.value - a.value);
    const ranks = sortedCards.map(c => c.value);
    const suits = sortedCards.map(c => c.suit);
    
    // 统计相同点数和花色
    const rankCounts = {};
    const suitCounts = {};
    
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
    
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const isFlush = Object.values(suitCounts).some(count => count >= 5);
    const isStraight = checkStraight(ranks);
    
    // 检查皇家同花顺
    if (isFlush && isStraight && ranks.includes(14) && ranks.includes(13) && ranks.includes(12) && ranks.includes(11) && ranks.includes(10)) {
        return { name: '皇家同花顺', rank: 10, highCard: 14 };
    }
    
    // 检查同花顺
    if (isFlush && isStraight) {
        return { name: '同花顺', rank: 9, highCard: Math.max(...ranks) };
    }
    
    // 检查四条
    if (counts[0] === 4) {
        const fourOfKind = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 4));
        return { name: '四条', rank: 8, highCard: fourOfKind };
    }
    
    // 检查葫芦
    if (counts[0] === 3 && counts[1] === 2) {
        const threeOfKind = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 3));
        return { name: '葫芦', rank: 7, highCard: threeOfKind };
    }
    
    // 检查同花
    if (isFlush) {
        return { name: '同花', rank: 6, highCard: Math.max(...ranks) };
    }
    
    // 检查顺子
    if (isStraight) {
        return { name: '顺子', rank: 5, highCard: Math.max(...ranks) };
    }
    
    // 检查三条
    if (counts[0] === 3) {
        const threeOfKind = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 3));
        return { name: '三条', rank: 4, highCard: threeOfKind };
    }
    
    // 检查两对
    if (counts[0] === 2 && counts[1] === 2) {
        const pairs = Object.keys(rankCounts).filter(k => rankCounts[k] === 2).map(k => parseInt(k)).sort((a, b) => b - a);
        return { name: '两对', rank: 3, highCard: pairs[0] };
    }
    
    // 检查一对
    if (counts[0] === 2) {
        const pair = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 2));
        return { name: '一对', rank: 2, highCard: pair };
    }
    
    // 高牌
    return { name: '高牌', rank: 1, highCard: Math.max(...ranks) };
}

// 检查顺子
function checkStraight(ranks) {
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);
    
    // 检查A-2-3-4-5的顺子
    if (uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && 
        uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
        return true;
    }
    
    // 检查其他顺子
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
        let consecutive = true;
        for (let j = 1; j < 5; j++) {
            if (uniqueRanks[i + j] !== uniqueRanks[i] + j) {
                consecutive = false;
                break;
            }
        }
        if (consecutive) return true;
    }
    
    return false;
}

// 比较两手牌
function compareHands(hand1, hand2) {
    if (hand1.rank !== hand2.rank) {
        return hand1.rank - hand2.rank;
    }
    return hand1.highCard - hand2.highCard;
}

// 显示消息
function showMessage(message, type = '') {
    const messageArea = document.getElementById('message-area');
    messageArea.textContent = message;
    messageArea.className = 'message-area ' + type;
}

// 启用操作按钮
function enableActions() {
    document.getElementById('bet-btn').disabled = false;
    document.getElementById('check-btn').disabled = false;
    document.getElementById('fold-btn').disabled = false;
    document.getElementById('all-in-btn').disabled = false;
    
    const betAmount = document.getElementById('bet-amount');
    const minBet = gameState.currentBet - gameState.playerBet;
    betAmount.min = minBet;
    betAmount.value = minBet;
}

// 禁用操作按钮
function disableActions() {
    document.getElementById('bet-btn').disabled = true;
    document.getElementById('check-btn').disabled = true;
    document.getElementById('fold-btn').disabled = true;
    document.getElementById('all-in-btn').disabled = true;
}

// 事件监听
document.getElementById('bet-btn').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('bet-amount').value);
    if (amount >= gameState.currentBet - gameState.playerBet) {
        bet(amount);
    } else {
        showMessage('下注金额不足！');
    }
});

document.getElementById('check-btn').addEventListener('click', check);
document.getElementById('fold-btn').addEventListener('click', fold);
document.getElementById('all-in-btn').addEventListener('click', allIn);
document.getElementById('new-game-btn').addEventListener('click', initGame);

// 初始化游戏
initGame();
