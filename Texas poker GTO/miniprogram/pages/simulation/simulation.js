// pages/simulation/simulation.js
const gameLogic = require('../../utils/game-logic.js');
const gtoApi = require('../../utils/gto-api.js');

Page({
  data: {
    gameState: null,
    showGTOAdvice: false,
    gtoAdvice: null,
    isLoading: false,
    gameSettings: {
      playerCount: 2,
      initialChips: 1000,
      smallBlind: 10,
      bigBlind: 20
    }
  },

  onLoad(options) {
    // 加载游戏设置
    const savedSettings = wx.getStorageSync('gameSettings');
    if (savedSettings) {
      this.setData({
        gameSettings: { ...this.data.gameSettings, ...savedSettings }
      });
    }
  },

  // 开始新游戏
  startNewGame() {
    this.setData({ isLoading: true });
    
    const gameState = gameLogic.initGame(
      this.data.gameSettings.playerCount,
      this.data.gameSettings
    );
    
    this.setData({
      gameState: gameState,
      isLoading: false
    });
    
    // 如果是AI回合，自动处理
    this.checkAITurn();
  },

  // 检查是否需要AI行动
  checkAITurn() {
    const gameState = this.data.gameState;
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.isHuman && !currentPlayer.folded) {
      setTimeout(() => {
        this.processAITurn();
      }, 1000);
    }
  },

  // 处理AI回合
  processAITurn() {
    const gameState = this.data.gameState;
    const action = gameLogic.getAIAction(gameState);
    this.handlePlayerAction(action);
  },

  // 处理玩家操作
  handlePlayerAction(action) {
    const newGameState = gameLogic.processAction(this.data.gameState, action);
    
    this.setData({
      gameState: newGameState
    });
    
    // 检查游戏是否结束
    if (newGameState.gamePhase === 'ended') {
      this.endGame(newGameState);
    } else {
      // 继续下一回合
      this.checkAITurn();
    }
  },

  // 获取GTO建议
  async getGTOAdvice() {
    const gameState = this.data.gameState;
    if (!gameState) return;
    
    this.setData({ isLoading: true, showGTOAdvice: true });
    
    try {
      const advice = await gtoApi.getAdvice(gameState);
      this.setData({
        gtoAdvice: advice,
        isLoading: false
      });
    } catch (error) {
      console.error('获取GTO建议失败', error);
      wx.showToast({
        title: '获取建议失败',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    }
  },

  // 关闭GTO建议
  closeGTOAdvice() {
    this.setData({
      showGTOAdvice: false,
      gtoAdvice: null
    });
  },

  // 设置玩家数量
  onPlayerCountChange(e) {
    const count = parseInt(e.detail.value) + 2;
    this.setData({
      'gameSettings.playerCount': count
    });
    wx.setStorageSync('gameSettings', this.data.gameSettings);
  },

  // 设置初始筹码
  onChipsChange(e) {
    const chips = parseInt(e.detail.value) || 1000;
    this.setData({
      'gameSettings.initialChips': chips
    });
    wx.setStorageSync('gameSettings', this.data.gameSettings);
  },

  // 设置小盲注
  onSmallBlindChange(e) {
    const blind = parseInt(e.detail.value) || 10;
    this.setData({
      'gameSettings.smallBlind': blind
    });
    wx.setStorageSync('gameSettings', this.data.gameSettings);
  },

  // 设置大盲注
  onBigBlindChange(e) {
    const blind = parseInt(e.detail.value) || 20;
    this.setData({
      'gameSettings.bigBlind': blind
    });
    wx.setStorageSync('gameSettings', this.data.gameSettings);
  },

  // 下注
  onBet() {
    wx.showModal({
      title: '下注',
      editable: true,
      placeholderText: '请输入下注金额',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseInt(res.content);
          if (amount > 0) {
            this.handlePlayerAction({
              type: 'bet',
              amount: amount
            });
          }
        }
      }
    });
  },

  // 跟注
  onCall() {
    this.handlePlayerAction({
      type: 'call'
    });
  },

  // 过牌
  onCheck() {
    this.handlePlayerAction({
      type: 'check'
    });
  },

  // 弃牌
  onFold() {
    this.handlePlayerAction({
      type: 'fold'
    });
  },

  // 全押
  onAllIn() {
    this.handlePlayerAction({
      type: 'allin'
    });
  },

  // 结束游戏
  endGame(gameState) {
    // 保存游戏记录
    const gameRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      gameState: gameState,
      finalResult: gameState.finalResult
    };
    
    let history = wx.getStorageSync('gameHistory') || [];
    history.unshift(gameRecord);
    // 最多保存100条记录
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    wx.setStorageSync('gameHistory', history);
    
    // 显示结果
    wx.showModal({
      title: '游戏结束',
      content: `底池: ${gameState.pot}，${gameState.finalResult.message}`,
      showCancel: true,
      confirmText: '再来一局',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          this.startNewGame();
        } else {
          wx.navigateBack();
        }
      }
    });
  }
});
