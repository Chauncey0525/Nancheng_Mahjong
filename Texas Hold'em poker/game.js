// 游戏状态
const gameState = {
    deck: [],
    players: [], // 玩家数组，第一个是真人玩家
    communityCards: [],
    pot: 0,
    currentBet: 0,
    gamePhase: 'preflop', // preflop, flop, turn, river, showdown
    currentPlayerIndex: 0, // 当前行动的玩家索引
    dealerIndex: 0, // 庄家位置
    smallBlindIndex: 0, // 小盲注位置
    bigBlindIndex: 0, // 大盲注位置
    gameMode: 'single', // single 或 multi
    activePlayers: [], // 仍在游戏中的玩家索引
    bettingRoundComplete: false
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

// 初始化玩家
function createPlayer(id, name, isHuman = false) {
    return {
        id: id,
        name: name,
        isHuman: isHuman,
        cards: [],
        chips: 1000,
        currentBet: 0,
        action: null, // bet, call, check, fold, allin
        folded: false,
        allIn: false
    };
}

// 初始化游戏
function initGame(playerCount = 2) {
    gameState.deck = createDeck();
    gameState.players = [];
    gameState.communityCards = [];
    gameState.pot = 0;
    gameState.currentBet = 0;
    gameState.gamePhase = 'preflop';
    gameState.activePlayers = [];
    
    // 创建玩家
    gameState.players.push(createPlayer(0, '你', true));
    for (let i = 1; i < playerCount; i++) {
        gameState.players.push(createPlayer(i, `电脑${i}`, false));
    }
    
    // 初始化所有玩家
    gameState.players.forEach(player => {
        player.cards = [];
        player.currentBet = 0;
        player.action = null;
        player.folded = false;
        player.allIn = false;
        gameState.activePlayers.push(player.id);
    });
    
    // 设置庄家位置（随机）
    gameState.dealerIndex = Math.floor(Math.random() * gameState.players.length);
    gameState.smallBlindIndex = (gameState.dealerIndex + 1) % gameState.players.length;
    gameState.bigBlindIndex = (gameState.dealerIndex + 2) % gameState.players.length;
    
    // 发牌
    for (let i = 0; i < 2; i++) {
        for (let player of gameState.players) {
            player.cards.push(gameState.deck.pop());
        }
    }
    
    // 设置盲注
    const smallBlind = 10;
    const bigBlind = 20;
    
    const smallBlindPlayer = gameState.players[gameState.smallBlindIndex];
    const bigBlindPlayer = gameState.players[gameState.bigBlindIndex];
    
    smallBlindPlayer.chips -= smallBlind;
    smallBlindPlayer.currentBet = smallBlind;
    bigBlindPlayer.chips -= bigBlind;
    bigBlindPlayer.currentBet = bigBlind;
    
    gameState.pot = smallBlind + bigBlind;
    gameState.currentBet = bigBlind;
    
    // 当前行动玩家是大盲注的下一位
    gameState.currentPlayerIndex = (gameState.bigBlindIndex + 1) % gameState.players.length;
    
    updateUI();
    
    // 如果当前玩家是真人，启用操作；否则AI行动
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isHuman) {
        showMessage(`游戏开始！你是大盲注，请选择操作。`);
        enableActions();
    } else {
        showMessage(`游戏开始！${currentPlayer.name}行动中...`);
        setTimeout(() => {
            processAITurn();
        }, 1000);
    }
}

// 更新UI
function updateUI() {
    // 更新筹码和底池
    const humanPlayer = gameState.players[0];
    document.getElementById('pot').textContent = gameState.pot;
    document.getElementById('current-bet').textContent = gameState.currentBet;
    document.getElementById('player-chips').textContent = humanPlayer.chips;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('current-player').textContent = currentPlayer.name;
    
    // 显示公共牌
    const communityCardsDiv = document.getElementById('community-cards');
    communityCardsDiv.innerHTML = '';
    gameState.communityCards.forEach(card => {
        communityCardsDiv.appendChild(createCardElement(card));
    });
    
    // 更新玩家显示
    const playersContainer = document.getElementById('players-container');
    playersContainer.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-info';
        playerDiv.id = `player-${index}`;
        
        if (index === gameState.currentPlayerIndex && !player.folded) {
            playerDiv.classList.add('active');
        }
        if (player.folded) {
            playerDiv.classList.add('folded');
        }
        
        const nameDiv = document.createElement('h3');
        nameDiv.textContent = player.name;
        if (index === gameState.dealerIndex) {
            nameDiv.textContent += ' (庄)';
        }
        if (index === gameState.smallBlindIndex) {
            nameDiv.textContent += ' (小盲)';
        }
        if (index === gameState.bigBlindIndex) {
            nameDiv.textContent += ' (大盲)';
        }
        
        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'cards-container';
        
        if (player.isHuman || gameState.gamePhase === 'showdown') {
            player.cards.forEach(card => {
                cardsDiv.appendChild(createCardElement(card));
            });
        } else {
            player.cards.forEach(() => {
                const cardBack = document.createElement('div');
                cardBack.className = 'card back';
                cardsDiv.appendChild(cardBack);
            });
        }
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'player-stats';
        infoDiv.innerHTML = `
            <div>筹码: ${player.chips}</div>
            <div>下注: ${player.currentBet}</div>
            ${player.folded ? '<div class="folded-badge">已弃牌</div>' : ''}
            ${player.allIn ? '<div class="allin-badge">全押</div>' : ''}
        `;
        
        const handTypeDiv = document.createElement('div');
        handTypeDiv.className = 'player-hand-info';
        if (gameState.communityCards.length > 0 && !player.folded) {
            const hand = evaluateHand([...player.cards, ...gameState.communityCards]);
            handTypeDiv.textContent = hand.name;
        }
        
        playerDiv.appendChild(nameDiv);
        playerDiv.appendChild(cardsDiv);
        playerDiv.appendChild(infoDiv);
        playerDiv.appendChild(handTypeDiv);
        
        playersContainer.appendChild(playerDiv);
    });
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
    const player = gameState.players[gameState.currentPlayerIndex];
    
    if (amount > player.chips) {
        showMessage('筹码不足！');
        return;
    }
    
    if (amount < gameState.currentBet - player.currentBet) {
        showMessage(`下注金额至少需要 ${gameState.currentBet - player.currentBet}`);
        return;
    }

    const totalBet = amount;
    const additionalBet = totalBet - player.currentBet;
    
    player.chips -= additionalBet;
    player.currentBet = totalBet;
    gameState.pot += additionalBet;
    
    if (totalBet > gameState.currentBet) {
        gameState.currentBet = totalBet;
    }
    
    if (player.chips === 0) {
        player.allIn = true;
        player.action = 'allin';
    } else {
        player.action = 'bet';
    }
    
    updateUI();
    disableActions();
    
    setTimeout(() => {
        nextPlayer();
    }, 1000);
}

// 过牌
function check() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    if (player.currentBet < gameState.currentBet) {
        showMessage('你不能过牌，需要跟注或加注！');
        return;
    }
    
    player.action = 'check';
    disableActions();
    
    setTimeout(() => {
        nextPlayer();
    }, 1000);
}

// 弃牌
function fold() {
    const player = gameState.players[gameState.currentPlayerIndex];
    player.action = 'fold';
    player.folded = true;
    gameState.activePlayers = gameState.activePlayers.filter(id => id !== player.id);
    
    updateUI();
    disableActions();
    
    setTimeout(() => {
        nextPlayer();
    }, 1000);
}

// 全押
function allIn() {
    const player = gameState.players[gameState.currentPlayerIndex];
    bet(player.chips);
}

// 下一个玩家
function nextPlayer() {
    // 检查是否只剩一个玩家
    if (gameState.activePlayers.length <= 1) {
        endGame();
        return;
    }
    
    // 移动到下一个活跃玩家
    do {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    } while (gameState.players[gameState.currentPlayerIndex].folded || 
             !gameState.activePlayers.includes(gameState.players[gameState.currentPlayerIndex].id));
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // 检查是否完成一轮下注
    if (isBettingRoundComplete()) {
        nextPhase();
        return;
    }
    
    updateUI();
    
    // 如果是真人玩家，启用操作；否则AI行动
    if (currentPlayer.isHuman && !currentPlayer.folded) {
        enableActions();
    } else if (!currentPlayer.folded) {
        setTimeout(() => {
            processAITurn();
        }, 1000);
    }
}

// 检查是否完成一轮下注
function isBettingRoundComplete() {
    const activePlayers = gameState.players.filter(p => !p.folded && gameState.activePlayers.includes(p.id));
    
    if (activePlayers.length <= 1) {
        return false; // 只剩一个玩家，不需要继续下注
    }
    
    // 所有活跃玩家的下注必须相等
    const bets = activePlayers.map(p => p.currentBet);
    if (bets.length === 0) return false;
    const allBetsEqual = bets.every(bet => bet === bets[0]);
    
    // 检查是否所有玩家都已行动
    // 在翻牌前，大盲注如果没有被加注，可以过牌
    // 在其他阶段，所有玩家都必须行动
    let allActed = true;
    for (let player of activePlayers) {
        if (gameState.gamePhase === 'preflop' && 
            player.id === gameState.players[gameState.bigBlindIndex].id) {
            // 大盲注在翻牌前，如果当前下注等于他的下注，他可以选择过牌或加注
            if (gameState.currentBet === player.currentBet && player.action === null) {
                // 如果当前玩家就是大盲注，且还没有行动，不算完成
                if (gameState.currentPlayerIndex === player.id) {
                    allActed = false;
                    break;
                }
            } else if (player.action === null) {
                allActed = false;
                break;
            }
        } else if (player.action === null) {
            allActed = false;
            break;
        }
    }
    
    // 还需要检查是否回到了最后一个加注的玩家
    // 如果所有下注相等且所有玩家都已行动，则完成
    return allBetsEqual && allActed;
}

// AI行动
function processAITurn() {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    if (player.folded || player.allIn) {
        nextPlayer();
        return;
    }
    
    const allCards = [...player.cards, ...gameState.communityCards];
    const handStrength = evaluateHandStrength(allCards);
    const randomFactor = Math.random();
    
    const callAmount = gameState.currentBet - player.currentBet;
    const canCheck = callAmount === 0;
    
    // AI决策逻辑
    if (handStrength > 0.7 || randomFactor > 0.8) {
        // 手牌很强，加注
        const raiseAmount = Math.min(
            gameState.currentBet + Math.floor(Math.random() * 100) + 50,
            player.chips
        );
        if (raiseAmount > gameState.currentBet && raiseAmount <= player.chips) {
            const additionalBet = raiseAmount - player.currentBet;
            player.chips -= additionalBet;
            player.currentBet = raiseAmount;
            gameState.pot += additionalBet;
            gameState.currentBet = raiseAmount;
            if (player.chips === 0) {
                player.allIn = true;
                player.action = 'allin';
            } else {
                player.action = 'raise';
            }
            showMessage(`${player.name} 加注到 ${raiseAmount}`);
        } else if (canCheck) {
            player.action = 'check';
            showMessage(`${player.name} 过牌`);
        } else {
            // 跟注
            player.chips -= callAmount;
            player.currentBet = gameState.currentBet;
            gameState.pot += callAmount;
            player.action = 'call';
            showMessage(`${player.name} 跟注 ${callAmount}`);
        }
    } else if (handStrength > 0.4 || randomFactor > 0.5) {
        // 手牌一般，跟注或过牌
        if (canCheck) {
            player.action = 'check';
            showMessage(`${player.name} 过牌`);
        } else if (callAmount <= player.chips && callAmount <= player.chips * 0.3) {
            player.chips -= callAmount;
            player.currentBet = gameState.currentBet;
            gameState.pot += callAmount;
            player.action = 'call';
            showMessage(`${player.name} 跟注 ${callAmount}`);
        } else {
            player.action = 'fold';
            player.folded = true;
            gameState.activePlayers = gameState.activePlayers.filter(id => id !== player.id);
            showMessage(`${player.name} 弃牌`);
        }
    } else {
        // 手牌很弱
        if (canCheck) {
            player.action = 'check';
            showMessage(`${player.name} 过牌`);
        } else if (callAmount > player.chips * 0.3) {
            player.action = 'fold';
            player.folded = true;
            gameState.activePlayers = gameState.activePlayers.filter(id => id !== player.id);
            showMessage(`${player.name} 弃牌`);
        } else {
            player.chips -= callAmount;
            player.currentBet = gameState.currentBet;
            gameState.pot += callAmount;
            player.action = 'call';
            showMessage(`${player.name} 跟注 ${callAmount}`);
        }
    }
    
    updateUI();
    
    setTimeout(() => {
        nextPlayer();
    }, 1500);
}

// 进入下一阶段
function nextPhase() {
    // 重置所有玩家的行动和下注
    gameState.players.forEach(player => {
        if (!player.folded) {
            player.action = null;
            player.currentBet = 0;
        }
    });
    gameState.currentBet = 0;
    
    if (gameState.gamePhase === 'preflop') {
        gameState.gamePhase = 'flop';
        gameState.communityCards = [
            gameState.deck.pop(),
            gameState.deck.pop(),
            gameState.deck.pop()
        ];
        gameState.currentPlayerIndex = (gameState.smallBlindIndex) % gameState.players.length;
        showMessage('翻牌圈！');
    } else if (gameState.gamePhase === 'flop') {
        gameState.gamePhase = 'turn';
        gameState.communityCards.push(gameState.deck.pop());
        gameState.currentPlayerIndex = (gameState.smallBlindIndex) % gameState.players.length;
        showMessage('转牌圈！');
    } else if (gameState.gamePhase === 'turn') {
        gameState.gamePhase = 'river';
        gameState.communityCards.push(gameState.deck.pop());
        gameState.currentPlayerIndex = (gameState.smallBlindIndex) % gameState.players.length;
        showMessage('河牌圈！');
    } else if (gameState.gamePhase === 'river') {
        showdown();
        return;
    }
    
    // 移动到第一个活跃玩家
    while (gameState.players[gameState.currentPlayerIndex].folded || 
           !gameState.activePlayers.includes(gameState.players[gameState.currentPlayerIndex].id)) {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    }
    
    updateUI();
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isHuman) {
        enableActions();
    } else {
        setTimeout(() => {
            processAITurn();
        }, 1000);
    }
}

// 摊牌
function showdown() {
    gameState.gamePhase = 'showdown';
    
    const activePlayers = gameState.players.filter(p => !p.folded && gameState.activePlayers.includes(p.id));
    
    if (activePlayers.length === 1) {
        // 只剩一个玩家，直接获胜
        const winner = activePlayers[0];
        winner.chips += gameState.pot;
        showMessage(`${winner.name} 获胜！获得 ${gameState.pot} 筹码`, 'win');
    } else {
        // 比较所有玩家的手牌
        const hands = activePlayers.map(player => ({
            player: player,
            hand: evaluateHand([...player.cards, ...gameState.communityCards])
        }));
        
        // 排序找出最佳手牌
        hands.sort((a, b) => {
            if (a.hand.rank !== b.hand.rank) {
                return b.hand.rank - a.hand.rank;
            }
            return b.hand.highCard - a.hand.highCard;
        });
        
        const bestHand = hands[0];
        const winners = hands.filter(h => 
            h.hand.rank === bestHand.hand.rank && h.hand.highCard === bestHand.hand.highCard
        );
        
        const potPerWinner = Math.floor(gameState.pot / winners.length);
        winners.forEach(winner => {
            winner.player.chips += potPerWinner;
        });
        
        if (winners.length === 1) {
            showMessage(`${winners[0].player.name} 获胜！${winners[0].hand.name} 获得 ${potPerWinner} 筹码`, 
                       winners[0].player.isHuman ? 'win' : 'lose');
        } else {
            const winnerNames = winners.map(w => w.player.name).join('、');
            showMessage(`平局！${winnerNames} 都是 ${bestHand.hand.name}，各获得 ${potPerWinner} 筹码`);
        }
    }
    
    updateUI();
    disableActions();
    
    setTimeout(() => {
        initGame(gameState.players.length);
    }, 5000);
}

// 结束游戏（只剩一个玩家）
function endGame() {
    const winner = gameState.players.find(p => !p.folded && gameState.activePlayers.includes(p.id));
    if (winner) {
        winner.chips += gameState.pot;
        showMessage(`${winner.name} 获胜！其他玩家都弃牌了`, winner.isHuman ? 'win' : 'lose');
        updateUI();
        disableActions();
        
        setTimeout(() => {
            initGame(gameState.players.length);
        }, 3000);
    }
}

// 评估手牌强度（0-1之间的值）
function evaluateHandStrength(cards) {
    if (cards.length < 5) return 0.3;
    
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

// 显示消息
function showMessage(message, type = '') {
    const messageArea = document.getElementById('message-area');
    messageArea.textContent = message;
    messageArea.className = 'message-area ' + type;
}

// 启用操作按钮
function enableActions() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const callAmount = gameState.currentBet - player.currentBet;
    
    document.getElementById('bet-btn').disabled = false;
    document.getElementById('check-btn').disabled = callAmount > 0;
    document.getElementById('fold-btn').disabled = false;
    document.getElementById('all-in-btn').disabled = false;
    
    const betAmount = document.getElementById('bet-amount');
    betAmount.min = Math.max(callAmount, 0);
    betAmount.value = callAmount;
    betAmount.max = player.chips;
}

// 禁用操作按钮
function disableActions() {
    document.getElementById('bet-btn').disabled = true;
    document.getElementById('check-btn').disabled = true;
    document.getElementById('fold-btn').disabled = true;
    document.getElementById('all-in-btn').disabled = true;
}

// 游戏模式选择
document.querySelectorAll('.btn-mode').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        gameState.gameMode = mode;
        
        if (mode === 'single') {
            document.getElementById('mode-selection').style.display = 'none';
            document.getElementById('game-info').style.display = 'flex';
            document.getElementById('game-area').style.display = 'block';
            document.getElementById('action-area').style.display = 'block';
            initGame(2);
        } else {
            document.getElementById('player-count-selection').style.display = 'block';
        }
    });
});

document.getElementById('start-game-btn').addEventListener('click', () => {
    const playerCount = parseInt(document.getElementById('player-count').value);
    if (playerCount < 2 || playerCount > 6) {
        showMessage('玩家数量必须在2-6人之间！');
        return;
    }
    
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('game-info').style.display = 'flex';
    document.getElementById('game-area').style.display = 'block';
    document.getElementById('action-area').style.display = 'block';
    initGame(playerCount);
});

// 事件监听
document.getElementById('bet-btn').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('bet-amount').value);
    const player = gameState.players[gameState.currentPlayerIndex];
    const callAmount = gameState.currentBet - player.currentBet;
    
    if (amount >= callAmount) {
        bet(amount);
    } else {
        showMessage('下注金额不足！');
    }
});

document.getElementById('check-btn').addEventListener('click', check);
document.getElementById('fold-btn').addEventListener('click', fold);
document.getElementById('all-in-btn').addEventListener('click', allIn);
document.getElementById('new-game-btn').addEventListener('click', () => {
    if (gameState.players.length > 0) {
        initGame(gameState.players.length);
    }
});
