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
    bettingRoundComplete: false,
    gameHistory: [], // 游戏历史记录
    lastBet: 0 // 最后一次下注金额（用于计算最小加注）
};

// 历史记录存储键名
const HISTORY_STORAGE_KEY = 'texasHoldemGameHistory';
const MAX_HISTORY_RECORDS = 50; // 最多保存50条记录

// 游戏设置
const gameSettings = {
    initialChips: 1000,
    smallBlind: 10,
    bigBlind: 20,
    soundEnabled: true,
    animationsEnabled: true
};

// 设置存储键名
const SETTINGS_STORAGE_KEY = 'texasHoldemGameSettings';

// 音效对象
const sounds = {
    cardFlip: null,
    chipDrop: null,
    win: null,
    lose: null,
    bet: null,
    fold: null
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
        chips: gameSettings.initialChips,
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
    
    // 设置盲注（使用设置中的值）
    const smallBlind = gameSettings.smallBlind;
    const bigBlind = gameSettings.bigBlind;
    
    const smallBlindPlayer = gameState.players[gameState.smallBlindIndex];
    const bigBlindPlayer = gameState.players[gameState.bigBlindIndex];
    
    smallBlindPlayer.chips -= smallBlind;
    smallBlindPlayer.currentBet = smallBlind;
    bigBlindPlayer.chips -= bigBlind;
    bigBlindPlayer.currentBet = bigBlind;
    
    gameState.pot = smallBlind + bigBlind;
    gameState.currentBet = bigBlind;
    
    // 播放音效
    playSound('chipDrop');
    
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
    const oldCardCount = communityCardsDiv.children.length;
    if (gameState.communityCards.length > oldCardCount && oldCardCount > 0) {
        // 有新牌发出，添加动画
        gameState.communityCards.forEach((card, index) => {
            if (index >= oldCardCount) {
                const cardEl = createCardElement(card, true);
                communityCardsDiv.appendChild(cardEl);
            }
        });
    } else {
    communityCardsDiv.innerHTML = '';
        gameState.communityCards.forEach((card, index) => {
            const cardEl = createCardElement(card, index >= oldCardCount);
            communityCardsDiv.appendChild(cardEl);
        });
    }
    
    // 更新玩家显示
    const playersContainer = document.getElementById('players-container');
    playersContainer.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-info';
        playerDiv.id = `player-${index}`;
        
        if (index === gameState.currentPlayerIndex && !player.folded) {
            playerDiv.classList.add('active');
            // 添加高亮动画
            setTimeout(() => animatePlayerHighlight(playerDiv), 100);
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
        
        // 只显示真人玩家的牌，电脑的牌始终显示背面
        if (player.isHuman) {
            player.cards.forEach((card, cardIndex) => {
                const cardEl = createCardElement(card, false);
                cardsDiv.appendChild(cardEl);
            });
    } else {
            player.cards.forEach((_, cardIndex) => {
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
        // 只显示真人玩家的手牌类型，电脑的手牌类型在摊牌前不显示
        if (player.isHuman && gameState.communityCards.length > 0 && !player.folded) {
            const hand = evaluateHand([...player.cards, ...gameState.communityCards]);
            handTypeDiv.textContent = hand.name;
        } else if (!player.isHuman) {
            // 电脑玩家不显示手牌类型
            handTypeDiv.textContent = '';
        }
        
        playerDiv.appendChild(nameDiv);
        playerDiv.appendChild(cardsDiv);
        playerDiv.appendChild(infoDiv);
        playerDiv.appendChild(handTypeDiv);
        
        playersContainer.appendChild(playerDiv);
    });
}

// 创建卡牌元素
function createCardElement(card, animate = false) {
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
    
    if (animate) {
        animateDealCard(cardDiv);
    }
    
    return cardDiv;
}

// 下注
function bet(amount) {
    const player = gameState.players[gameState.currentPlayerIndex];
    
    if (amount > player.chips) {
        showMessage(`筹码不足！你的筹码只有 ${player.chips}，无法下注 ${amount}`, 'error');
        // 添加输入框错误提示
        const betAmount = document.getElementById('bet-amount');
        betAmount.style.borderColor = '#f44336';
        betAmount.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.5)';
        setTimeout(() => {
            betAmount.style.borderColor = '';
            betAmount.style.boxShadow = '';
        }, 2000);
        return;
    }
    
    const callAmount = gameState.currentBet - player.currentBet;
    
    // 如果只是跟注，调用跟注函数
    if (amount === gameState.currentBet) {
        call();
        return;
    }
    
    // 检查是否满足最小下注要求（必须至少跟注）
    if (amount < gameState.currentBet) {
        const callAmount = gameState.currentBet - player.currentBet;
        showMessage(`下注金额不足！至少需要跟注到 ${gameState.currentBet}（还需 ${callAmount}）`, 'error');
        // 添加输入框错误提示
        const betAmount = document.getElementById('bet-amount');
        betAmount.style.borderColor = '#f44336';
        betAmount.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.5)';
        setTimeout(() => {
            betAmount.style.borderColor = '';
            betAmount.style.boxShadow = '';
        }, 2000);
        return;
    }
    
    // 如果是加注，检查是否满足最小加注倍数
    // 最小加注 = 当前下注 × 倍数
    if (amount > gameState.currentBet) {
        const minBetAmount = gameState.currentBet * gameSettings.minRaiseMultiplier;
        
        // 严格检查：如果加注金额不足最小加注，且不是全押，则不允许加注
        if (amount < minBetAmount) {
            // 全押是特殊情况，允许不足最小加注
            if (amount < player.chips) {
                const neededAmount = minBetAmount - amount;
                showMessage(`加注金额不足！最小加注为 ${minBetAmount}（当前下注 ${gameState.currentBet} × ${gameSettings.minRaiseMultiplier}倍），还需 ${neededAmount}`, 'error');
                // 添加输入框错误提示
                const betAmount = document.getElementById('bet-amount');
                betAmount.style.borderColor = '#f44336';
                betAmount.style.boxShadow = '0 0 10px rgba(244, 67, 54, 0.5)';
                setTimeout(() => {
                    betAmount.style.borderColor = '';
                    betAmount.style.boxShadow = '';
                }, 2000);
                return;
            }
            // 如果是全押但不足最小加注，给出提示但允许（因为全押是特殊情况）
        }
    }

    const totalBet = amount;
    const additionalBet = totalBet - player.currentBet;
    
    player.chips -= additionalBet;
    player.currentBet = totalBet;
    gameState.pot += additionalBet;
    gameState.lastBet = totalBet; // 记录最后一次下注
    
    if (totalBet > gameState.currentBet) {
        gameState.currentBet = totalBet;
    }
    
    if (player.chips === 0) {
        player.allIn = true;
        player.action = 'allin';
    } else {
        player.action = totalBet > gameState.currentBet ? 'raise' : 'bet';
    }
    
    playSound('bet');
    animateChips(document.getElementById('pot'), additionalBet);
    updateUI();
    disableActions();
    
    setTimeout(() => {
        nextPlayer();
    }, 1000);
}

// 跟注
function call() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const callAmount = gameState.currentBet - player.currentBet;
    
    if (callAmount === 0) {
        showMessage('你已经跟注了，可以选择过牌！', 'error');
        return;
    }
    
    if (callAmount > player.chips) {
        showMessage(`筹码不足，无法跟注！需要 ${callAmount}，但你只有 ${player.chips}`, 'error');
        return;
    }
    
    player.chips -= callAmount;
    player.currentBet = gameState.currentBet;
    gameState.pot += callAmount;
    player.action = 'call';
    
    playSound('bet');
    animateChips(document.getElementById('pot'), callAmount);
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
        const callAmount = gameState.currentBet - player.currentBet;
        showMessage(`你不能过牌，需要先跟注 ${callAmount} 或加注！`, 'error');
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
    
    playSound('fold');
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
        playSound('cardFlip');
        showMessage('翻牌圈！');
    } else if (gameState.gamePhase === 'flop') {
        gameState.gamePhase = 'turn';
        gameState.communityCards.push(gameState.deck.pop());
        gameState.currentPlayerIndex = (gameState.smallBlindIndex) % gameState.players.length;
        playSound('cardFlip');
        showMessage('转牌圈！');
    } else if (gameState.gamePhase === 'turn') {
        gameState.gamePhase = 'river';
        gameState.communityCards.push(gameState.deck.pop());
        gameState.currentPlayerIndex = (gameState.smallBlindIndex) % gameState.players.length;
        playSound('cardFlip');
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
    
    let winners = [];
    let resultMessage = '';
    let isHumanWin = false;
    
    if (activePlayers.length === 1) {
        // 只剩一个玩家，直接获胜
        const winner = activePlayers[0];
        winner.chips += gameState.pot;
        winners = [winner];
        resultMessage = `${winner.name} 获胜！获得 ${gameState.pot} 筹码`;
        isHumanWin = winner.isHuman;
        showMessage(resultMessage, isHumanWin ? 'win' : 'lose');
        playSound(isHumanWin ? 'win' : 'lose');
        if (isHumanWin) {
            animateChips(document.getElementById('player-chips'), gameState.pot);
        }
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
        winners = hands.filter(h => 
            h.hand.rank === bestHand.hand.rank && h.hand.highCard === bestHand.hand.highCard
        ).map(h => h.player);
        
        const potPerWinner = Math.floor(gameState.pot / winners.length);
        winners.forEach(winner => {
            winner.chips += potPerWinner;
        });
        
        if (winners.length === 1) {
            resultMessage = `${winners[0].name} 获胜！${bestHand.hand.name} 获得 ${potPerWinner} 筹码`;
            isHumanWin = winners[0].isHuman;
            showMessage(resultMessage, isHumanWin ? 'win' : 'lose');
            playSound(isHumanWin ? 'win' : 'lose');
            if (isHumanWin) {
                winners[0].chips && animateChips(document.getElementById('player-chips'), potPerWinner);
            }
    } else {
            const winnerNames = winners.map(w => w.name).join('、');
            resultMessage = `平局！${winnerNames} 都是 ${bestHand.hand.name}，各获得 ${potPerWinner} 筹码`;
            isHumanWin = winners.some(w => w.isHuman);
            showMessage(resultMessage);
            if (isHumanWin) {
                playSound('win');
            }
        }
    }
    
    // 记录游戏历史
    recordGameHistory(winners, resultMessage, isHumanWin);
    
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
        const resultMessage = `${winner.name} 获胜！其他玩家都弃牌了`;
        showMessage(resultMessage, winner.isHuman ? 'win' : 'lose');
        
        // 记录游戏历史
        recordGameHistory([winner], resultMessage, winner.isHuman);
        
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
    
    // 如果是错误消息，添加闪烁动画
    if (type === 'error' || message.includes('不足') || message.includes('不能') || message.includes('需要')) {
        messageArea.classList.add('error-shake');
        setTimeout(() => {
            messageArea.classList.remove('error-shake');
        }, 500);
    }
    
    // 如果是成功消息，添加成功动画
    if (type === 'success' || message.includes('成功') || message.includes('已保存')) {
        messageArea.classList.add('success-pulse');
        setTimeout(() => {
            messageArea.classList.remove('success-pulse');
        }, 500);
    }
}

// 启用操作按钮
function enableActions() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const callAmount = gameState.currentBet - player.currentBet;
    
    document.getElementById('bet-btn').disabled = false;
    document.getElementById('call-btn').disabled = callAmount === 0 || callAmount > player.chips;
    document.getElementById('check-btn').disabled = callAmount > 0;
    document.getElementById('fold-btn').disabled = false;
    document.getElementById('all-in-btn').disabled = false;
    
    const betAmount = document.getElementById('bet-amount');
    // 计算最小加注金额：当前下注 × 倍数
    const minBetAmount = gameState.currentBet * gameSettings.minRaiseMultiplier;
    
    // 清除之前的错误样式
    betAmount.style.borderColor = '';
    betAmount.style.boxShadow = '';
    
    // 设置下注输入框的最小值
    if (callAmount > 0) {
        // 需要跟注时，最小值是跟注金额（当前下注），但用户可以选择跟注或加注
        betAmount.min = gameState.currentBet; // 至少跟注
        betAmount.value = gameState.currentBet; // 默认显示跟注金额
    } else {
        // 不需要跟注时，如果要加注，最小加注金额必须满足
        betAmount.min = Math.min(minBetAmount, player.chips);
        betAmount.value = Math.min(minBetAmount, player.chips);
    }
    betAmount.max = player.chips;
    
    // 更新提示信息
    if (callAmount > 0) {
        betAmount.placeholder = `跟注: ${gameState.currentBet}, 最小加注: ${Math.min(minBetAmount, player.chips)}`;
        betAmount.title = `当前需要跟注 ${gameState.currentBet}，或加注到至少 ${Math.min(minBetAmount, player.chips)}`;
    } else {
        betAmount.placeholder = `最小加注: ${Math.min(minBetAmount, player.chips)}（当前下注 ${gameState.currentBet} × ${gameSettings.minRaiseMultiplier}倍）`;
        betAmount.title = `最小加注为 ${Math.min(minBetAmount, player.chips)}（当前下注 ${gameState.currentBet} × ${gameSettings.minRaiseMultiplier}倍）`;
    }
    
    // 添加实时验证（移除旧的监听器，添加新的）
    const oldInputHandler = betAmount._inputHandler;
    if (oldInputHandler) {
        betAmount.removeEventListener('input', oldInputHandler);
    }
    
    const inputHandler = function() {
        const value = parseInt(this.value) || 0;
        if (value > player.chips) {
            this.style.borderColor = '#f44336';
            this.style.boxShadow = '0 0 5px rgba(244, 67, 54, 0.3)';
        } else if (callAmount > 0 && value < gameState.currentBet) {
            this.style.borderColor = '#ff9800';
            this.style.boxShadow = '0 0 5px rgba(255, 152, 0, 0.3)';
        } else if (value > gameState.currentBet && value < minBetAmount) {
            this.style.borderColor = '#ff9800';
            this.style.boxShadow = '0 0 5px rgba(255, 152, 0, 0.3)';
        } else {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        }
    };
    
    betAmount._inputHandler = inputHandler;
    betAmount.addEventListener('input', inputHandler);
}

// 禁用操作按钮
function disableActions() {
    document.getElementById('bet-btn').disabled = true;
    document.getElementById('call-btn').disabled = true;
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
            updateHistoryCount();
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
    updateHistoryCount();
    initGame(playerCount);
});

// 事件监听
document.getElementById('bet-btn').addEventListener('click', () => {
    const amount = parseInt(document.getElementById('bet-amount').value);
    const player = gameState.players[gameState.currentPlayerIndex];
    const callAmount = gameState.currentBet - player.currentBet;
    
    // 验证下注金额
    if (amount < callAmount) {
        showMessage('下注金额不足！至少需要跟注。');
        return;
    }
    
    // 如果是加注，验证是否满足最小加注要求
    // 最小加注 = 当前下注 × 倍数
    if (amount > gameState.currentBet) {
        const minBetAmount = gameState.currentBet * gameSettings.minRaiseMultiplier;
        
        // 如果加注金额不足最小加注，且不是全押，则不允许
        if (amount < minBetAmount && amount < player.chips) {
            showMessage(`加注金额不足！最小加注为 ${minBetAmount}（当前下注 ${gameState.currentBet} × ${gameSettings.minRaiseMultiplier}倍）`);
            return;
        }
    }
    
    bet(amount);
});

document.getElementById('call-btn').addEventListener('click', call);
document.getElementById('check-btn').addEventListener('click', check);
document.getElementById('fold-btn').addEventListener('click', fold);
document.getElementById('all-in-btn').addEventListener('click', allIn);
document.getElementById('new-game-btn').addEventListener('click', () => {
    if (gameState.players.length > 0) {
        initGame(gameState.players.length);
    }
});

// ========== 游戏历史记录功能 ==========

// 记录游戏历史
function recordGameHistory(winners, resultMessage, isHumanWin) {
    const historyRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('zh-CN'),
        date: new Date().toISOString(),
        playerCount: gameState.players.length,
        players: gameState.players.map(p => ({
            name: p.name,
            isHuman: p.isHuman,
            finalChips: p.chips,
            cards: p.cards.map(c => `${c.rank}${c.suit}`),
            folded: p.folded
        })),
        communityCards: gameState.communityCards.map(c => `${c.rank}${c.suit}`),
        pot: gameState.pot,
        winners: winners.map(w => ({
            name: w.name,
            isHuman: w.isHuman,
            hand: gameState.communityCards.length > 0 ? 
                  evaluateHand([...w.cards, ...gameState.communityCards]).name : '未知'
        })),
        result: resultMessage,
        isHumanWin: isHumanWin
    };
    
    // 添加到历史记录
    gameState.gameHistory.unshift(historyRecord);
    
    // 限制历史记录数量
    if (gameState.gameHistory.length > MAX_HISTORY_RECORDS) {
        gameState.gameHistory = gameState.gameHistory.slice(0, MAX_HISTORY_RECORDS);
    }
    
    // 保存到localStorage
    saveGameHistory();
    
    // 更新历史记录计数
    updateHistoryCount();
}

// 保存游戏历史到localStorage
function saveGameHistory() {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(gameState.gameHistory));
    } catch (e) {
        console.error('保存游戏历史失败:', e);
    }
}

// 从localStorage加载游戏历史
function loadGameHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) {
            gameState.gameHistory = JSON.parse(saved);
        }
    } catch (e) {
        console.error('加载游戏历史失败:', e);
        gameState.gameHistory = [];
    }
}

// 显示游戏历史
function displayGameHistory() {
    const historyModal = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');
    
    if (!historyModal || !historyList) return;
    
    // 如果没有历史记录
    if (gameState.gameHistory.length === 0) {
        historyList.innerHTML = '<div class="no-history">暂无游戏历史记录</div>';
        historyModal.style.display = 'block';
        return;
    }
    
    // 生成历史记录列表
    historyList.innerHTML = gameState.gameHistory.map(record => {
        const winnerNames = record.winners.map(w => w.name).join('、');
        const playerList = record.players.map(p => 
            `${p.name} (${p.isHuman ? '你' : 'AI'}) - ${p.finalChips}筹码 ${p.folded ? '[弃牌]' : ''}`
        ).join('<br>');
        
        return `
            <div class="history-item ${record.isHumanWin ? 'win' : record.winners.some(w => w.isHuman) ? 'tie' : 'lose'}">
                <div class="history-header">
                    <span class="history-time">${record.timestamp}</span>
                    <span class="history-result">${record.result}</span>
                </div>
                <div class="history-details">
                    <div class="history-info">
                        <strong>玩家数量:</strong> ${record.playerCount}人<br>
                        <strong>底池:</strong> ${record.pot}筹码<br>
                        <strong>获胜者:</strong> ${winnerNames}
                    </div>
                    <div class="history-cards">
                        <div class="history-community-cards">
                            <strong>公共牌:</strong> ${record.communityCards.join(' ')}
                        </div>
                        <div class="history-player-cards">
                            ${record.players.map(p => 
                                `<div><strong>${p.name}:</strong> ${p.cards.join(' ')} ${p.folded ? '(弃牌)' : ''}</div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    historyModal.style.display = 'block';
}

// 关闭历史记录窗口
function closeHistoryModal() {
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
        historyModal.style.display = 'none';
    }
}

// 清空游戏历史
function clearGameHistory() {
    if (confirm('确定要清空所有游戏历史记录吗？此操作不可恢复！')) {
        gameState.gameHistory = [];
        saveGameHistory();
        updateHistoryCount();
        displayGameHistory(); // 刷新显示
    }
}

// 更新历史记录计数显示
function updateHistoryCount() {
    const historyCountEl = document.getElementById('history-count');
    if (historyCountEl) {
        historyCountEl.textContent = gameState.gameHistory.length;
    }
}

// 历史记录按钮事件监听
document.addEventListener('DOMContentLoaded', () => {
    const historyBtn = document.getElementById('history-btn');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            displayGameHistory();
        });
    }
    
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', closeHistoryModal);
    }
    
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearGameHistory);
    }
    
    // 点击模态窗口外部关闭
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
        historyModal.addEventListener('click', (e) => {
            if (e.target === historyModal) {
                closeHistoryModal();
            }
        });
    }
    
    // 设置按钮事件监听
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
    
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', closeSettings);
    }
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', applySettings);
    }
    
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', resetSettings);
    }
    
    // 点击设置模态窗口外部关闭
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                closeSettings();
            }
        });
    }
    
    // 最小加注倍数选择器事件
    const minRaiseMultiplierSelect = document.getElementById('min-raise-multiplier');
    const customRaiseMultiplierInput = document.getElementById('custom-raise-multiplier');
    if (minRaiseMultiplierSelect && customRaiseMultiplierInput) {
        minRaiseMultiplierSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customRaiseMultiplierInput.style.display = 'block';
            } else {
                customRaiseMultiplierInput.style.display = 'none';
            }
        });
    }
    
    // 初始化历史记录计数
    updateHistoryCount();
});

// ========== 音效系统 ==========

// 初始化音效（使用Web Audio API生成简单音效）
function initSounds() {
    if (!gameSettings.soundEnabled) return;
    
    // 创建音频上下文
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 生成音效函数
    function createTone(frequency, duration, type = 'sine') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // 定义音效
    sounds.cardFlip = () => createTone(400, 0.1, 'square');
    sounds.chipDrop = () => createTone(200, 0.15, 'sawtooth');
    sounds.bet = () => createTone(300, 0.1, 'sine');
    sounds.fold = () => createTone(150, 0.2, 'triangle');
    sounds.win = () => {
        createTone(523, 0.1);
        setTimeout(() => createTone(659, 0.1), 100);
        setTimeout(() => createTone(784, 0.2), 200);
    };
    sounds.lose = () => {
        createTone(200, 0.3, 'sawtooth');
    };
}

// 播放音效
function playSound(soundName) {
    if (!gameSettings.soundEnabled || !sounds[soundName]) return;
    try {
        sounds[soundName]();
    } catch (e) {
        console.error('播放音效失败:', e);
    }
}

// ========== 动画系统 ==========

// 卡牌翻转动画
function animateCardFlip(cardElement, delay = 0) {
    if (!gameSettings.animationsEnabled) return;
    
    setTimeout(() => {
        cardElement.style.transform = 'rotateY(180deg)';
        cardElement.style.transition = 'transform 0.5s';
        
        setTimeout(() => {
            cardElement.style.transform = 'rotateY(0deg)';
        }, 250);
    }, delay);
}

// 筹码动画
function animateChips(element, amount) {
    if (!gameSettings.animationsEnabled) return;
    
    const chipAnimation = document.createElement('div');
    chipAnimation.className = 'chip-animation';
    chipAnimation.textContent = `+${amount}`;
    chipAnimation.style.position = 'absolute';
    chipAnimation.style.color = '#ffd700';
    chipAnimation.style.fontWeight = 'bold';
    chipAnimation.style.fontSize = '1.2em';
    chipAnimation.style.pointerEvents = 'none';
    chipAnimation.style.zIndex = '1000';
    
    const rect = element.getBoundingClientRect();
    chipAnimation.style.left = (rect.left + rect.width / 2) + 'px';
    chipAnimation.style.top = (rect.top) + 'px';
    
    document.body.appendChild(chipAnimation);
    
    chipAnimation.animate([
        { transform: 'translateY(0) scale(1)', opacity: 1 },
        { transform: 'translateY(-50px) scale(1.2)', opacity: 0 }
    ], {
        duration: 1000,
        easing: 'ease-out'
    }).onfinish = () => {
        chipAnimation.remove();
    };
}

// 卡牌发牌动画
function animateDealCard(cardElement, delay = 0) {
    if (!gameSettings.animationsEnabled) {
        cardElement.style.opacity = '1';
        return;
    }
    
    cardElement.style.opacity = '0';
    cardElement.style.transform = 'scale(0) rotate(180deg)';
    
    setTimeout(() => {
        cardElement.style.transition = 'all 0.5s ease-out';
        cardElement.style.opacity = '1';
        cardElement.style.transform = 'scale(1) rotate(0deg)';
        playSound('cardFlip');
    }, delay);
}

// 玩家高亮动画
function animatePlayerHighlight(playerElement) {
    if (!gameSettings.animationsEnabled) return;
    
    playerElement.style.animation = 'pulse 1s ease-in-out';
    setTimeout(() => {
        playerElement.style.animation = '';
    }, 1000);
}

// ========== 设置管理 ==========

// 加载设置
function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(gameSettings, parsed);
        }
    } catch (e) {
        console.error('加载设置失败:', e);
    }
    updateSettingsUI();
}

// 保存设置
function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(gameSettings));
    } catch (e) {
        console.error('保存设置失败:', e);
    }
}

// 更新设置UI
function updateSettingsUI() {
    document.getElementById('initial-chips').value = gameSettings.initialChips;
    document.getElementById('small-blind').value = gameSettings.smallBlind;
    document.getElementById('big-blind').value = gameSettings.bigBlind;
    document.getElementById('sound-enabled').checked = gameSettings.soundEnabled;
    document.getElementById('animations-enabled').checked = gameSettings.animationsEnabled;
    
    // 更新最小加注倍数
    const minRaiseMultiplier = gameSettings.minRaiseMultiplier;
    const multiplierSelect = document.getElementById('min-raise-multiplier');
    const customInput = document.getElementById('custom-raise-multiplier');
    
    if (minRaiseMultiplier === 2) {
        multiplierSelect.value = '2';
        customInput.style.display = 'none';
    } else if (minRaiseMultiplier === 3) {
        multiplierSelect.value = '3';
        customInput.style.display = 'none';
    } else {
        multiplierSelect.value = 'custom';
        customInput.style.display = 'block';
        customInput.value = minRaiseMultiplier;
    }
}

// 应用设置
function applySettings() {
    gameSettings.initialChips = parseInt(document.getElementById('initial-chips').value);
    gameSettings.smallBlind = parseInt(document.getElementById('small-blind').value);
    gameSettings.bigBlind = parseInt(document.getElementById('big-blind').value);
    gameSettings.soundEnabled = document.getElementById('sound-enabled').checked;
    gameSettings.animationsEnabled = document.getElementById('animations-enabled').checked;
    
    // 处理最小加注倍数
    const multiplierSelect = document.getElementById('min-raise-multiplier');
    if (multiplierSelect.value === 'custom') {
        gameSettings.minRaiseMultiplier = parseFloat(document.getElementById('custom-raise-multiplier').value) || 2;
    } else {
        gameSettings.minRaiseMultiplier = parseFloat(multiplierSelect.value);
    }
    
    // 验证设置值
    if (gameSettings.initialChips < 100 || gameSettings.initialChips > 10000) {
        showMessage('初始筹码必须在100-10000之间！', 'error');
        return;
    }
    
    if (gameSettings.smallBlind < 5 || gameSettings.smallBlind > 500) {
        showMessage('小盲注必须在5-500之间！', 'error');
        return;
    }
    
    if (gameSettings.bigBlind < gameSettings.smallBlind || gameSettings.bigBlind > 1000) {
        showMessage('大盲注必须大于等于小盲注，且不超过1000！', 'error');
        return;
    }
    
    if (gameSettings.minRaiseMultiplier < 1 || gameSettings.minRaiseMultiplier > 10) {
        showMessage('最小加注倍数必须在1-10之间！', 'error');
        return;
    }
    
    saveSettings();
    
    // 重新初始化音效
    if (gameSettings.soundEnabled) {
        initSounds();
    }
    
    // 显示成功消息并关闭设置窗口
    showMessage('✓ 设置已保存成功！', 'success');
    
    // 延迟关闭设置窗口，让用户看到成功消息
    setTimeout(() => {
        closeSettings();
    }, 1500);
}

// 重置设置
function resetSettings() {
    gameSettings.initialChips = 1000;
    gameSettings.smallBlind = 10;
    gameSettings.bigBlind = 20;
    gameSettings.soundEnabled = true;
    gameSettings.animationsEnabled = true;
    gameSettings.minRaiseMultiplier = 2;
    
    updateSettingsUI();
    saveSettings();
    initSounds();
    showMessage('✓ 设置已重置为默认值！', 'success');
    
    // 延迟关闭设置窗口
    setTimeout(() => {
        closeSettings();
    }, 1500);
}

// 显示设置窗口
function showSettings() {
    updateSettingsUI();
    document.getElementById('settings-modal').style.display = 'block';
}

// 关闭设置窗口
function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

// 页面加载时加载历史记录和设置
loadGameHistory();
updateHistoryCount();
loadSettings();
initSounds();