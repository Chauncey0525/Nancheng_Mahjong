// pages/index/index.js
const scoring = require('../../utils/scoring.js');
const config = require('../../utils/config.js');

Page({
  data: {
    players: [
      { name: '东方', position: 'east', ma: 0, isDealer: false },
      { name: '南方', position: 'south', ma: 0, isDealer: false },
      { name: '西方', position: 'west', ma: 0, isDealer: false },
      { name: '北方', position: 'north', ma: 0, isDealer: false }
    ],
    playerNames: [
      { name: '无', index: -1 },
      { name: '东方', index: 0 },
      { name: '南方', index: 1 },
      { name: '西方', index: 2 },
      { name: '北方', index: 3 }
    ],
    winTypes: ['无', ...config.WIN_TYPES],
    winTypeIndex: 0,
    winInfo: {
      winnerIndex: -1,
      winType: '',
      isSelfDraw: true,
      shooterIndex: -1,
      winnerIndices: []
    },
    gangTypes: ['点杠', '暗杠'],
    gangInfo: [],
    results: []
  },

  onLoad() {
    // 页面加载
  },

  // 码数输入
  onMaInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = parseInt(e.detail.value) || 0;
    const players = this.data.players;
    players[index].ma = value;
    this.setData({ players });
  },

  // 庄家切换
  onDealerChange(e) {
    const index = e.currentTarget.dataset.index;
    const checked = e.detail.value;
    const players = this.data.players;
    // 只能有一个庄家
    players.forEach((p, i) => {
      p.isDealer = (i === index && checked);
    });
    this.setData({ players });
  },

  // 胡牌者选择
  onWinnerChange(e) {
    const index = parseInt(e.detail.value);
    const winInfo = this.data.winInfo;
    // 如果选择的是"无"（index 0），则设置为 -1
    if (index === 0) {
      winInfo.winnerIndex = -1;
      winInfo.winnerIndices = [];
    } else {
      // 实际玩家索引需要减1（因为第一个是"无"）
      winInfo.winnerIndex = index - 1;
      // 如果是一炮多响，需要更新winnerIndices
      if (winInfo.winnerIndices.length === 0) {
        winInfo.winnerIndices = [index - 1];
      }
    }
    this.setData({ winInfo });
  },

  // 胡牌类型选择
  onWinTypeChange(e) {
    const index = parseInt(e.detail.value);
    const winInfo = this.data.winInfo;
    // 如果选择的是"无"（index 0），则清空
    if (index === 0) {
      winInfo.winType = '';
    } else {
      // 实际类型索引需要减1（因为第一个是"无"）
      winInfo.winType = config.WIN_TYPES[index - 1];
    }
    this.setData({ 
      winTypeIndex: index,
      winInfo 
    });
  },

  // 胡牌方式选择
  onWinMethodChange(e) {
    const value = e.detail.value;
    const winInfo = this.data.winInfo;
    winInfo.isSelfDraw = (value === 'selfDraw');
    if (winInfo.isSelfDraw) {
      winInfo.shooterIndex = -1;
      winInfo.winnerIndices = winInfo.winnerIndex >= 0 ? [winInfo.winnerIndex] : [];
    }
    this.setData({ winInfo });
  },

  // 点炮者选择
  onShooterChange(e) {
    const index = parseInt(e.detail.value);
    const winInfo = this.data.winInfo;
    // 如果选择的是"无"（index 0），则设置为 -1
    if (index === 0) {
      winInfo.shooterIndex = -1;
    } else {
      // 实际玩家索引需要减1（因为第一个是"无"）
      winInfo.shooterIndex = index - 1;
      // 更新一炮多响的选项，排除点炮者
      if (winInfo.winnerIndices.indexOf(index - 1) > -1) {
        winInfo.winnerIndices = winInfo.winnerIndices.filter(i => i !== (index - 1));
      }
    }
    this.setData({ winInfo });
  },

  // 一炮多响选择
  onMultiWinChange(e) {
    const values = e.detail.value.map(v => parseInt(v));
    const winInfo = this.data.winInfo;
    // 如果选择了多个，更新winnerIndices
    if (values.length > 0) {
      winInfo.winnerIndices = values;
      // 更新主胡牌者为第一个
      if (values.length > 0) {
        winInfo.winnerIndex = values[0];
      }
    } else {
      // 如果没有选择，使用主胡牌者
      winInfo.winnerIndices = winInfo.winnerIndex >= 0 ? [winInfo.winnerIndex] : [];
    }
    this.setData({ winInfo });
  },

  // 添加杠
  addGang() {
    const gangInfo = this.data.gangInfo;
    gangInfo.push({
      type: '点杠',
      gangTypeIndex: 0,
      playerIndex: -1,
      pointGangIndex: -1
    });
    this.setData({ gangInfo });
  },

  // 删除杠
  deleteGang(e) {
    const index = e.currentTarget.dataset.index;
    const gangInfo = this.data.gangInfo;
    gangInfo.splice(index, 1);
    this.setData({ gangInfo });
  },

  // 杠类型选择
  onGangTypeChange(e) {
    const gangIndex = e.currentTarget.dataset.gangIndex;
    const typeIndex = parseInt(e.detail.value);
    const gangInfo = this.data.gangInfo;
    gangInfo[gangIndex].type = this.data.gangTypes[typeIndex];
    gangInfo[gangIndex].gangTypeIndex = typeIndex;
    if (gangInfo[gangIndex].type === '暗杠') {
      gangInfo[gangIndex].pointGangIndex = -1;
    }
    this.setData({ gangInfo });
  },

  // 杠的玩家选择
  onGangPlayerChange(e) {
    const gangIndex = e.currentTarget.dataset.gangIndex;
    const playerIndex = parseInt(e.detail.value);
    const gangInfo = this.data.gangInfo;
    gangInfo[gangIndex].playerIndex = playerIndex;
    this.setData({ gangInfo });
  },

  // 点杠者选择
  onPointGangChange(e) {
    const gangIndex = e.currentTarget.dataset.gangIndex;
    const pointGangIndex = parseInt(e.detail.value);
    const gangInfo = this.data.gangInfo;
    gangInfo[gangIndex].pointGangIndex = pointGangIndex;
    this.setData({ gangInfo });
  },

  // 计算得分
  calculateScore() {
    const { players, winInfo, gangInfo } = this.data;

    // 验证数据
    if (winInfo.winnerIndex < 0 || !winInfo.winType) {
      wx.showToast({
        title: '请选择胡牌者和胡牌类型',
        icon: 'none'
      });
      return;
    }

    if (!winInfo.isSelfDraw && winInfo.shooterIndex < 0) {
      wx.showToast({
        title: '请选择点炮者',
        icon: 'none'
      });
      return;
    }

    // 验证杠信息
    for (let i = 0; i < gangInfo.length; i++) {
      const gang = gangInfo[i];
      if (gang.playerIndex < 0) {
        wx.showToast({
          title: `请选择第${i + 1}个杠的玩家`,
          icon: 'none'
        });
        return;
      }
      if (gang.type === '点杠' && gang.pointGangIndex < 0) {
        wx.showToast({
          title: `请选择第${i + 1}个点杠的点杠者`,
          icon: 'none'
        });
        return;
      }
    }

    // 准备游戏数据
    const gameData = {
      players: players,
      winInfo: {
        winnerIndex: winInfo.winnerIndex,
        winType: winInfo.winType,
        isSelfDraw: winInfo.isSelfDraw,
        shooterIndex: winInfo.shooterIndex,
        winnerIndices: winInfo.winnerIndices.length > 0 ? winInfo.winnerIndices : [winInfo.winnerIndex]
      },
      gangInfo: gangInfo.map(gang => ({
        type: gang.type,
        playerIndex: gang.playerIndex,
        pointGangIndex: gang.pointGangIndex
      }))
    };

    // 计算得分
    const calculationResult = scoring.calculateAllScores(gameData);
    
    this.setData({
      results: calculationResult.results
    });

    wx.showToast({
      title: '计算完成',
      icon: 'success'
    });
  },

  // 保存记录
  saveRecord() {
    if (this.data.results.length === 0) {
      wx.showToast({
        title: '请先计算得分',
        icon: 'none'
      });
      return;
    }

    const record = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('zh-CN'),
      players: this.data.players,
      winInfo: this.data.winInfo,
      gangInfo: this.data.gangInfo,
      results: this.data.results
    };

    // 获取历史记录
    let history = wx.getStorageSync('mahjong_history') || [];
    history.unshift(record);
    
    // 最多保存100条记录
    if (history.length > 100) {
      history = history.slice(0, 100);
    }

    wx.setStorageSync('mahjong_history', history);

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  // 清空重来
  resetForm() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            players: [
              { name: '东方', position: 'east', ma: 0, isDealer: false },
              { name: '南方', position: 'south', ma: 0, isDealer: false },
              { name: '西方', position: 'west', ma: 0, isDealer: false },
              { name: '北方', position: 'north', ma: 0, isDealer: false }
            ],
            winTypeIndex: 0,
            winInfo: {
              winnerIndex: -1,
              winType: '',
              isSelfDraw: true,
              shooterIndex: -1,
              winnerIndices: []
            },
            gangInfo: [],
            results: []
          });
        }
      }
    });
  }
});
