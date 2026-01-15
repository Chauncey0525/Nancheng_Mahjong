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
    playerNamesForGang: [
      { name: '东方', index: 0 },
      { name: '南方', index: 1 },
      { name: '西方', index: 2 },
      { name: '北方', index: 3 }
    ],
    winTypes: ['无', ...config.WIN_TYPES],
    winTypeIndex: 0,
    winInfo: {
      isMultiWin: false,  // 是否一炮多响
      winners: [{ playerIndex: -1, winType: '' }],  // 胡牌者列表 [{playerIndex: -1, winType: ''}, ...]
      isSelfDraw: true,
      shooterIndex: -1,
      isDrawGame: false  // 荒庄（流局）标志
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

  // 荒庄切换
  onDrawGameChange(e) {
    const checked = e.detail.value;
    const winInfo = this.data.winInfo;
    winInfo.isDrawGame = checked;
    // 如果开启荒庄，清空胡牌相关信息
    if (checked) {
      winInfo.winners = [];
      winInfo.shooterIndex = -1;
      winInfo.isMultiWin = false;
    }
    this.setData({ winInfo });
  },

  // 一炮多响切换
  onMultiWinToggle(e) {
    const checked = e.detail.value;
    const winInfo = this.data.winInfo;
    winInfo.isMultiWin = checked;
    
    if (checked) {
      // 开启一炮多响，自动设置为点炮模式（自摸没有一炮多响）
      winInfo.isSelfDraw = false;
      // 初始化3个胡牌者
      winInfo.winners = [
        { playerIndex: -1, winType: '' },
        { playerIndex: -1, winType: '' },
        { playerIndex: -1, winType: '' }
      ];
    } else {
      // 关闭一炮多响，只保留第一个
      if (winInfo.winners.length > 0) {
        winInfo.winners = [winInfo.winners[0]];
      } else {
        winInfo.winners = [{ playerIndex: -1, winType: '' }];
      }
    }
    this.setData({ winInfo });
  },

  // 胡牌者选择（一炮多响模式）
  onWinnerSelect(e) {
    const winnerIndex = parseInt(e.currentTarget.dataset.winnerIndex);
    const playerIndex = parseInt(e.detail.value);
    const winInfo = this.data.winInfo;
    
    if (!winInfo.winners[winnerIndex]) {
      winInfo.winners[winnerIndex] = { playerIndex: -1, winType: '' };
    }
    
    if (playerIndex === 0) {
      winInfo.winners[winnerIndex].playerIndex = -1;
      winInfo.winners[winnerIndex].winType = '';
    } else {
      const selectedPlayerIndex = playerIndex - 1;
      
      // 如果选择了点炮者，不允许
      if (!winInfo.isSelfDraw && selectedPlayerIndex === winInfo.shooterIndex) {
        wx.showToast({
          title: '胡牌者不能是点炮者',
          icon: 'none'
        });
        return;
      }
      
      // 检查是否与其他胡牌者重复
      let isDuplicate = false;
      for (let i = 0; i < winInfo.winners.length; i++) {
        if (i !== winnerIndex && winInfo.winners[i].playerIndex === selectedPlayerIndex) {
          isDuplicate = true;
          break;
        }
      }
      
      if (isDuplicate) {
        wx.showToast({
          title: '胡牌者不能重复，请选择不同的玩家',
          icon: 'none'
        });
        return;
      }
      
      winInfo.winners[winnerIndex].playerIndex = selectedPlayerIndex;
    }
    this.setData({ winInfo });
  },

  // 胡牌类型选择（一炮多响模式）
  onWinTypeSelect(e) {
    const winnerIndex = parseInt(e.currentTarget.dataset.winnerIndex);
    const typeIndex = parseInt(e.detail.value);
    const winInfo = this.data.winInfo;
    
    if (!winInfo.winners[winnerIndex]) {
      winInfo.winners[winnerIndex] = { playerIndex: -1, winType: '' };
    }
    
    if (typeIndex === 0) {
      winInfo.winners[winnerIndex].winType = '';
    } else {
      winInfo.winners[winnerIndex].winType = config.WIN_TYPES[typeIndex - 1];
    }
    this.setData({ winInfo });
  },

  // 胡牌者选择
  onWinnerChange(e) {
    const index = parseInt(e.detail.value);
    const winInfo = this.data.winInfo;
    // 如果选择的是"无"（index 0），则设置为 -1
    if (index === 0) {
      winInfo.winnerIndex = -1;
      winInfo.winnerIndices = [];
      winInfo.multiWinTypes = {};
    } else {
      // 实际玩家索引需要减1（因为第一个是"无"）
      winInfo.winnerIndex = index - 1;
      // 如果是一炮多响，需要更新winnerIndices
      if (winInfo.winnerIndices.length === 0) {
        winInfo.winnerIndices = [index - 1];
        // 设置主胡牌者的类型
        if (winInfo.winType) {
          if (!winInfo.multiWinTypes) {
            winInfo.multiWinTypes = {};
          }
          winInfo.multiWinTypes[index - 1] = winInfo.winType;
        }
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
      // 更新主胡牌者的类型
      if (winInfo.winnerIndex >= 0) {
        winInfo.multiWinTypes[winInfo.winnerIndex] = winInfo.winType;
      }
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
      // 自摸时不能一炮多响，自动关闭
      if (winInfo.isMultiWin) {
        winInfo.isMultiWin = false;
        // 只保留第一个胡牌者
        if (winInfo.winners.length > 0) {
          winInfo.winners = [winInfo.winners[0]];
        } else {
          winInfo.winners = [{ playerIndex: -1, winType: '' }];
        }
      } else if (winInfo.winners.length === 0) {
        winInfo.winners = [{ playerIndex: -1, winType: '' }];
      }
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
      // 如果一炮多响，排除点炮者
      if (winInfo.isMultiWin && winInfo.winners) {
        winInfo.winners.forEach(winner => {
          if (winner.playerIndex === index - 1) {
            winner.playerIndex = -1;
            winner.winType = '';
          }
        });
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
        // 确保主胡牌者有类型
        if (!winInfo.multiWinTypes[values[0]] && winInfo.winType) {
          winInfo.multiWinTypes[values[0]] = winInfo.winType;
        }
      }
    } else {
      // 如果没有选择，使用主胡牌者
      winInfo.winnerIndices = winInfo.winnerIndex >= 0 ? [winInfo.winnerIndex] : [];
    }
    this.setData({ winInfo });
  },

  // 一炮多响玩家类型选择
  onMultiWinTypeChange(e) {
    const playerIndex = parseInt(e.currentTarget.dataset.playerIndex);
    const typeIndex = parseInt(e.detail.value);
    const winInfo = this.data.winInfo;
    
    if (typeIndex === 0) {
      delete winInfo.multiWinTypes[playerIndex];
    } else {
      winInfo.multiWinTypes[playerIndex] = config.WIN_TYPES[typeIndex - 1];
    }
    this.setData({ winInfo });
  },

  // 添加杠
  addGang() {
    const gangInfo = this.data.gangInfo;
    gangInfo.push({
      type: '点杠',
      gangTypeIndex: 0,
      playerIndex: 0,  // 默认东方（索引0）
      pointGangIndex: 1  // 默认南方（索引1）
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

  // 捡杠者选择
  onGangPlayerChange(e) {
    const gangIndex = e.currentTarget.dataset.gangIndex;
    const valueIndex = parseInt(e.detail.value);
    const gangInfo = this.data.gangInfo;
    
    // playerNames数组直接对应玩家索引
    // valueIndex 0 = "东方" -> playerIndex 0
    // valueIndex 1 = "南方" -> playerIndex 1
    // ...
    const newPlayerIndex = valueIndex;
    
    // 验证捡杠者和放杠者不能是同一个人
    if (gangInfo[gangIndex].pointGangIndex >= 0 && gangInfo[gangIndex].pointGangIndex === newPlayerIndex) {
      wx.showToast({
        title: '捡杠者和放杠者不能是同一个人',
        icon: 'none'
      });
      return;
    }
    
    gangInfo[gangIndex].playerIndex = newPlayerIndex;
    this.setData({ gangInfo });
  },

  // 放杠者选择
  onPointGangChange(e) {
    const gangIndex = e.currentTarget.dataset.gangIndex;
    const valueIndex = parseInt(e.detail.value);
    const gangInfo = this.data.gangInfo;
    
    // playerNames数组直接对应玩家索引
    // valueIndex 0 = "东方" -> pointGangIndex 0
    // valueIndex 1 = "南方" -> pointGangIndex 1
    // ...
    const newPointGangIndex = valueIndex;
    
    // 验证捡杠者和放杠者不能是同一个人
    if (gangInfo[gangIndex].playerIndex >= 0 && gangInfo[gangIndex].playerIndex === newPointGangIndex) {
      wx.showToast({
        title: '捡杠者和放杠者不能是同一个人',
        icon: 'none'
      });
      return;
    }
    
    gangInfo[gangIndex].pointGangIndex = newPointGangIndex;
    this.setData({ gangInfo });
  },

  // 计算得分
  calculateScore() {
    const { players, winInfo, gangInfo } = this.data;

    // 验证必须有庄家
    const hasDealer = players.some(p => p.isDealer);
    if (!hasDealer) {
      wx.showToast({
        title: '请设置庄家',
        icon: 'none'
      });
      return;
    }

    // 如果不是荒庄，需要验证胡牌信息
    if (!winInfo.isDrawGame) {
      // 验证数据
      if (!winInfo.winners || winInfo.winners.length === 0) {
        winInfo.winners = [{ playerIndex: -1, winType: '' }];
        this.setData({ winInfo });
      }

      // 验证每个胡牌者（只验证已选择的）
      let hasValidWinner = false;
      for (let i = 0; i < winInfo.winners.length; i++) {
        const winner = winInfo.winners[i];
        // 如果选择了玩家但没有选择类型，或者选择了类型但没有选择玩家，都是无效的
        if (winner.playerIndex >= 0 && !winner.winType) {
          wx.showToast({
            title: `请选择胡牌者${i + 1}的胡牌类型`,
            icon: 'none'
          });
          return;
        }
        if (winner.winType && winner.playerIndex < 0) {
          wx.showToast({
            title: `请选择胡牌者${i + 1}`,
            icon: 'none'
          });
          return;
        }
        // 如果既选择了玩家又选择了类型，验证是否有效
        if (winner.playerIndex >= 0 && winner.winType) {
          hasValidWinner = true;
          // 验证不能选择点炮者
          if (!winInfo.isSelfDraw && winner.playerIndex === winInfo.shooterIndex) {
            wx.showToast({
              title: `胡牌者${i + 1}不能是点炮者`,
              icon: 'none'
            });
            return;
          }
        }
      }
      
      // 至少需要一个有效的胡牌者
      if (!hasValidWinner) {
        wx.showToast({
          title: '请至少选择一个胡牌者和胡牌类型',
          icon: 'none'
        });
        return;
      }
      
      // 验证一炮多响时，已选择的胡牌者不能重复
      if (winInfo.isMultiWin) {
        const playerIndices = winInfo.winners
          .filter(w => w.playerIndex >= 0 && w.winType)
          .map(w => w.playerIndex);
        const uniqueIndices = [...new Set(playerIndices)];
        if (playerIndices.length !== uniqueIndices.length) {
          wx.showToast({
            title: '一炮多响时，胡牌者不能重复，请选择不同的玩家',
            icon: 'none'
          });
          return;
        }
      }

      if (!winInfo.isSelfDraw && winInfo.shooterIndex < 0) {
        wx.showToast({
          title: '请选择点炮者',
          icon: 'none'
        });
        return;
      }
    }

    // 验证杠信息
    for (let i = 0; i < gangInfo.length; i++) {
      const gang = gangInfo[i];
      if (gang.type === '点杠') {
        // 点杠必须有捡杠者和放杠者
        if (gang.playerIndex < 0) {
          wx.showToast({
            title: `请选择第${i + 1}个点杠的捡杠者`,
            icon: 'none'
          });
          return;
        }
        if (gang.pointGangIndex < 0) {
          wx.showToast({
            title: `请选择第${i + 1}个点杠的放杠者`,
            icon: 'none'
          });
          return;
        }
        // 验证捡杠者和放杠者不能是同一个人
        if (gang.playerIndex === gang.pointGangIndex) {
          wx.showToast({
            title: `第${i + 1}个点杠的捡杠者和放杠者不能是同一个人`,
            icon: 'none'
          });
          return;
        }
      } else if (gang.type === '暗杠') {
        // 暗杠必须有捡杠者
        if (gang.playerIndex < 0) {
          wx.showToast({
            title: `请选择第${i + 1}个暗杠的捡杠者`,
            icon: 'none'
          });
          return;
        }
      }
    }

    // 准备游戏数据
    const gameData = {
      players: players,
      winInfo: {
        isMultiWin: winInfo.isMultiWin,
        winners: winInfo.winners.filter(w => w.playerIndex >= 0 && w.winType),
        isSelfDraw: winInfo.isSelfDraw,
        shooterIndex: winInfo.shooterIndex,
        isDrawGame: winInfo.isDrawGame
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
