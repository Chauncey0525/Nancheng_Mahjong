// pages/hand-analyzer/hand-analyzer.js
const handEvaluator = require('../../utils/hand-evaluator.js');

Page({
  data: {
    userHand: [],
    communityCards: [],
    analysis: null
  },

  onLoad() {
    // 初始化
  },

  // 选择手牌
  selectHand() {
    // 手牌选择逻辑
  },

  // 选择公共牌
  selectCommunityCards() {
    // 公共牌选择逻辑
  },

  // 分析手牌
  analyze() {
    if (this.data.userHand.length !== 2) {
      wx.showToast({
        title: '请先选择手牌',
        icon: 'none'
      });
      return;
    }

    const allCards = [...this.data.userHand, ...this.data.communityCards];
    const analysis = handEvaluator.analyzeHand(allCards);
    
    this.setData({
      analysis: analysis
    });
  }
});
