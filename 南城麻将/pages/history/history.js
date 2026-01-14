// pages/history/history.js
Page({
  data: {
    history: [],
    totalScores: [],
    showDetail: false,
    currentDetail: null
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadHistory();
  },

  // 加载历史记录
  loadHistory() {
    const history = wx.getStorageSync('mahjong_history') || [];
    
    // 计算总得分
    const totalScores = this.calculateTotalScores(history);
    
    this.setData({
      history: history,
      totalScores: totalScores
    });
  },

  // 计算总得分
  calculateTotalScores(history) {
    const scores = {};
    
    // 初始化四个玩家的得分
    const playerNames = ['东方', '南方', '西方', '北方'];
    playerNames.forEach((name, index) => {
      scores[index] = {
        playerIndex: index,
        playerName: name,
        totalScore: 0
      };
    });

    // 累加每局得分（使用subTotalScore，如果没有则使用totalScore以兼容旧数据）
    history.forEach(record => {
      if (record.results && record.results.length > 0) {
        record.results.forEach(result => {
          if (scores[result.playerIndex]) {
            // 使用subTotalScore显示，如果没有则使用totalScore（向后兼容）
            const score = result.subTotalScore !== undefined ? result.subTotalScore : result.totalScore;
            scores[result.playerIndex].totalScore += score;
          }
        });
      }
    });

    return Object.values(scores);
  },

  // 查看详情
  viewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const detail = this.data.history[index];
    
    this.setData({
      showDetail: true,
      currentDetail: detail
    });
  },

  // 关闭详情
  closeDetail() {
    this.setData({
      showDetail: false,
      currentDetail: null
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          let history = wx.getStorageSync('mahjong_history') || [];
          history = history.filter(item => item.id !== id);
          wx.setStorageSync('mahjong_history', history);
          
          this.loadHistory();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空所有记录
  clearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('mahjong_history', []);
          
          this.setData({
            history: [],
            totalScores: []
          });
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  }
});
