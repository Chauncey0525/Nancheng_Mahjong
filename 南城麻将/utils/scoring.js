// 算分核心逻辑
const config = require('./config.js');

/**
 * 计算胡分
 * @param {string} winType - 胡牌类型
 * @param {number} winnerIndex - 胡牌者索引
 * @param {boolean} isSelfDraw - 是否自摸
 * @param {number} shooterIndex - 点炮者索引（如果点炮）
 * @param {Array} winnerIndices - 一炮多响的胡牌者索引数组
 * @param {Array} players - 玩家数组
 * @returns {Object} 返回每个玩家需要支付的胡分
 */
function calculateWinScore(winType, winnerIndex, isSelfDraw, shooterIndex, winnerIndices, players) {
  const baseScore = config.WIN_SCORES[winType] || 0;
  if (baseScore === 0) return {};

  const scores = {};
  const winners = winnerIndices && winnerIndices.length > 0 ? winnerIndices : [winnerIndex];

  winners.forEach(winnerIdx => {
    const winner = players[winnerIdx];
    if (!winner) return;

    // 天胡：一家给
    if (winType === '天胡') {
      // 天胡时，非胡牌者都需要给分
      players.forEach((player, idx) => {
        if (idx !== winnerIdx) {
          let score = baseScore;
          // 庄家翻倍
          if (player.isDealer || winner.isDealer) {
            score *= 2;
          }
          scores[`${idx}_${winnerIdx}`] = score;
        }
      });
    }
    // 地胡：庄家给胡牌者
    else if (winType === '地胡') {
      players.forEach((player, idx) => {
        if (player.isDealer && idx !== winnerIdx) {
          let score = baseScore;
          // 庄家翻倍
          if (player.isDealer || winner.isDealer) {
            score *= 2;
          }
          scores[`${idx}_${winnerIdx}`] = score;
        }
      });
    }
    // 自摸：三家给
    else if (isSelfDraw) {
      players.forEach((player, idx) => {
        if (idx !== winnerIdx) {
          let score = baseScore;
          // 庄家翻倍
          if (player.isDealer || winner.isDealer) {
            score *= 2;
          }
          scores[`${idx}_${winnerIdx}`] = score;
        }
      });
    }
    // 放炮：放炮方给
    else if (shooterIndex >= 0) {
      const shooter = players[shooterIndex];
      if (shooter) {
        let score = baseScore;
        // 庄家翻倍
        if (shooter.isDealer || winner.isDealer) {
          score *= 2;
        }
        scores[`${shooterIndex}_${winnerIdx}`] = score;
      }
    }
  });

  return scores;
}

/**
 * 计算杠分
 * @param {Array} gangInfo - 杠信息数组
 * @param {Array} players - 玩家数组
 * @returns {Object} 返回每个玩家需要支付的杠分
 */
function calculateGangScore(gangInfo, players) {
  const scores = {};

  gangInfo.forEach(gang => {
    const { type, playerIndex, pointGangIndex } = gang;
    const gangPlayer = players[playerIndex]; // 捡杠者
    if (!gangPlayer) return;

    if (type === '点杠') {
      // 点杠规则：点杠者（放杠者）给2分，其他玩家给1分，庄家翻倍
      // 具体情况：
      // 1. 庄点闲：点杠者（庄家）给-4分，其他两家闲家各给-1分
      // 2. 闲点庄：点杠者（闲家）给-4分，其他两家各给-2分（因为捡杠者是庄家，需要翻倍）
      // 3. 闲点闲：点杠者（闲家）给-2分，庄家给-2分，另一家闲家给-1分
      
      if (pointGangIndex >= 0 && pointGangIndex < players.length) {
        const pointGangPlayer = players[pointGangIndex]; // 放杠者（点杠者）
        
        // 计算点杠者（放杠者）的分数
        let pointGangScore = config.GANG_SCORES['点杠'].pointGang; // 基础2分
        
        // 如果点杠者是庄家，翻倍为4分（庄点闲）
        if (pointGangPlayer.isDealer) {
          pointGangScore = config.GANG_SCORES['点杠'].dealer; // 4分
        }
        // 如果捡杠者是庄家，点杠者也要翻倍为4分（闲点庄）
        else if (gangPlayer.isDealer) {
          pointGangScore = config.GANG_SCORES['点杠'].dealer; // 4分
        }
        // 否则是闲点闲，点杠者给2分
        
        scores[`${pointGangIndex}_${playerIndex}`] = pointGangScore;
      }

      // 计算其他玩家的分数（不包括点杠者和捡杠者）
      players.forEach((player, idx) => {
        if (idx !== playerIndex && idx !== pointGangIndex) {
          let score = config.GANG_SCORES['点杠'].others; // 基础1分
          
          // 判断是否需要翻倍为2分
          // 情况1：这个玩家是庄家（无论是闲点闲还是闲点庄，庄家都翻倍）
          // 情况2：捡杠者是庄家（闲点庄的情况，其他玩家都要翻倍）
          if (player.isDealer || gangPlayer.isDealer) {
            score = config.GANG_SCORES['点杠'].others * 2; // 2分
          }
          // 否则是闲点闲且这个玩家不是庄家的情况，给1分
          
          scores[`${idx}_${playerIndex}`] = score;
        }
      });
    } else if (type === '暗杠') {
      // 暗杠：其余三家各2分，庄家翻倍4分
      players.forEach((player, idx) => {
        if (idx !== playerIndex) {
          let score = config.GANG_SCORES['暗杠'].others;
          if (player.isDealer) {
            score = config.GANG_SCORES['暗杠'].dealer;
          }
          scores[`${idx}_${playerIndex}`] = score;
        }
      });
    }
  });

  return scores;
}


/**
 * 计算所有玩家的得分
 * @param {Object} gameData - 游戏数据
 * @returns {Object} 计算结果
 */
function calculateAllScores(gameData) {
  const { players, winInfo, gangInfo } = gameData;
  
  // 第一步：初始化所有人对其他三家的胜负关系为0
  // scores[from_to] 表示 from 玩家需要支付给 to 玩家的分数（正数表示支付，负数表示获得）
  const scores = {};
  const winScores = {};  // 单独记录胡分
  const gangScores = {}; // 单独记录杠分
  players.forEach((player, fromIndex) => {
    players.forEach((otherPlayer, toIndex) => {
      if (fromIndex !== toIndex) {
        scores[`${fromIndex}_${toIndex}`] = 0;
        winScores[`${fromIndex}_${toIndex}`] = 0;
        gangScores[`${fromIndex}_${toIndex}`] = 0;
      }
    });
  });

  // 第二步：处理胡牌关系（荒庄时不处理）
  if (!winInfo.isDrawGame && winInfo.winners && winInfo.winners.length > 0) {
    winInfo.winners.forEach(winner => {
      if (winner.playerIndex >= 0 && winner.winType) {
        const calculatedWinScores = calculateWinScore(
          winner.winType,
          winner.playerIndex,
          winInfo.isSelfDraw,
          winInfo.shooterIndex,
          [winner.playerIndex],
          players
        );
        // 更新 scores 和 winScores，累加胡分
        Object.keys(calculatedWinScores).forEach(key => {
          scores[key] = (scores[key] || 0) + calculatedWinScores[key];
          winScores[key] = (winScores[key] || 0) + calculatedWinScores[key];
        });
      }
    });
  }

  // 第三步：依次处理每个杠，每处理一个就更新所有人的积分
  gangInfo.forEach((gang, gangIndex) => {
    const { type, playerIndex, pointGangIndex } = gang;
    const gangPlayer = players[playerIndex]; // 捡杠者
    if (!gangPlayer) return;

    if (type === '点杠') {
      // 点杠规则：点杠者（放杠者）给2分，其他玩家给1分，庄家翻倍
      // 具体情况：
      // 1. 庄点闲：点杠者（庄家）给-4分，其他两家闲家各给-1分
      // 2. 闲点庄：点杠者（闲家）给-4分，其他两家各给-2分（因为捡杠者是庄家，需要翻倍）
      // 3. 闲点闲：点杠者（闲家）给-2分，庄家给-2分，另一家闲家给-1分
      
      if (pointGangIndex >= 0 && pointGangIndex < players.length) {
        const pointGangPlayer = players[pointGangIndex]; // 放杠者（点杠者）
        
        // 计算点杠者（放杠者）的分数
        let pointGangScore = config.GANG_SCORES['点杠'].pointGang; // 基础2分
        
        // 如果点杠者是庄家，翻倍为4分（庄点闲）
        if (pointGangPlayer.isDealer) {
          pointGangScore = config.GANG_SCORES['点杠'].dealer; // 4分
        }
        // 如果捡杠者是庄家，点杠者也要翻倍为4分（闲点庄）
        else if (gangPlayer.isDealer) {
          pointGangScore = config.GANG_SCORES['点杠'].dealer; // 4分
        }
        // 否则是闲点闲，点杠者给2分
        
        // 更新点杠者支付给捡杠者的分数
        scores[`${pointGangIndex}_${playerIndex}`] = (scores[`${pointGangIndex}_${playerIndex}`] || 0) + pointGangScore;
        gangScores[`${pointGangIndex}_${playerIndex}`] = (gangScores[`${pointGangIndex}_${playerIndex}`] || 0) + pointGangScore;
      }

      // 计算其他玩家的分数（不包括点杠者和捡杠者）
      // 关键：任何人捡杠都需要对所有人的积分进行修改
      players.forEach((player, idx) => {
        if (idx !== playerIndex && idx !== pointGangIndex) {
          let score = config.GANG_SCORES['点杠'].others; // 基础1分
          
          // 判断是否需要翻倍为2分
          // 情况1：这个玩家是庄家（无论是闲点闲还是闲点庄，庄家都翻倍）
          // 情况2：捡杠者是庄家（闲点庄的情况，其他玩家都要翻倍）
          if (player.isDealer || gangPlayer.isDealer) {
            score = config.GANG_SCORES['点杠'].others * 2; // 2分
          }
          // 否则是闲点闲且这个玩家不是庄家的情况，给1分
          
          // 更新这个玩家支付给捡杠者的分数
          scores[`${idx}_${playerIndex}`] = (scores[`${idx}_${playerIndex}`] || 0) + score;
          gangScores[`${idx}_${playerIndex}`] = (gangScores[`${idx}_${playerIndex}`] || 0) + score;
        }
      });
    } else if (type === '暗杠') {
      // 暗杠：其余三家各2分，庄家翻倍4分
      // 具体情况：
      // 1. 庄家暗杠：其他三家每家给庄家4分
      // 2. 闲家暗杠：其他玩家给2分，如果其他玩家是庄家则给4分
      // 关键：任何人捡杠都需要对所有人的积分进行修改
      players.forEach((player, idx) => {
        if (idx !== playerIndex) {
          let score = config.GANG_SCORES['暗杠'].others; // 基础2分
          
          // 如果捡杠者是庄家，其他三家每家给4分（庄家暗杠）
          if (gangPlayer.isDealer) {
            score = config.GANG_SCORES['暗杠'].dealer; // 4分
          }
          // 如果其他玩家是庄家，给4分（闲家暗杠，但其他玩家是庄家）
          else if (player.isDealer) {
            score = config.GANG_SCORES['暗杠'].dealer; // 4分
          }
          // 否则是闲家暗杠且其他玩家不是庄家，给2分
          
          // 更新这个玩家支付给捡杠者的分数
          scores[`${idx}_${playerIndex}`] = (scores[`${idx}_${playerIndex}`] || 0) + score;
          gangScores[`${idx}_${playerIndex}`] = (gangScores[`${idx}_${playerIndex}`] || 0) + score;
        }
      });
    }
  });

  // 第四步：根据最终的 scores 计算每个玩家的总得分
  const results = [];
  const detailResults = [];

  players.forEach((player, playerIndex) => {
    let totalScore = 0;
    const details = [];

    // 对每个其他玩家计算得分
    // 根据买码规则：每个方位计算与其他三家的正负得分
    // 第一步：计算玩家A对玩家B的得分 = (胡分+杠分) × (1 + 对方码数)
    // 第二步：玩家A的最终得分 = (玩家A对所有其他玩家的得分之和) × (1 + 玩家A自己的码数)
    let subTotalScore = 0; // 玩家A对所有其他玩家的得分之和（未乘以自己码数）
    
    players.forEach((otherPlayer, otherIndex) => {
      if (playerIndex !== otherIndex) {
        // 计算玩家A对玩家B的净支付（胡分+杠分）
        // scores[playerIndex_otherIndex] 表示玩家A需要支付给玩家B的分数（正数）
        // scores[otherIndex_playerIndex] 表示玩家B需要支付给玩家A的分数（正数）
        
        // 计算胡分：玩家A对玩家B的净胡分
        // 玩家A需要支付给玩家B的胡分（对玩家A来说是支付，为负数）
        const winScoreFromA = -(winScores[`${playerIndex}_${otherIndex}`] || 0);
        // 玩家B需要支付给玩家A的胡分（对玩家A来说是获得，为正数）
        const winScoreFromB = (winScores[`${otherIndex}_${playerIndex}`] || 0);
        const netWinScore = winScoreFromA + winScoreFromB;
        
        // 计算杠分：玩家A对玩家B的净杠分
        // 玩家A需要支付给玩家B的杠分（对玩家A来说是支付，为负数）
        const gangScoreFromA = -(gangScores[`${playerIndex}_${otherIndex}`] || 0);
        // 玩家B需要支付给玩家A的杠分（对玩家A来说是获得，为正数）
        const gangScoreFromB = (gangScores[`${otherIndex}_${playerIndex}`] || 0);
        const netGangScore = gangScoreFromA + gangScoreFromB;
        
        // 基础分 = 净胡分 + 净杠分
        let baseScore = netWinScore + netGangScore;
        
        // 买码规则第一步：(胡分+杠分) × (1 + 对方码数)
        // 基础倍数为1，每有1只码是多一倍
        // 比如有1只码，则分数是*2，有2只码分数*3...以此类推
        const multiplier = 1 + (otherPlayer.ma || 0);
        const score = baseScore * multiplier;
        subTotalScore += score;
        
        // 确保每个玩家都包含对其他三家的明细，即使得分为0也要显示
        details.push({
          targetIndex: otherIndex,
          targetName: otherPlayer.name,
          score: score,
          baseScore: baseScore,
          winScore: netWinScore,  // 净胡分
          gangScore: netGangScore, // 净杠分
          ma: otherPlayer.ma || 0,
          multiplier: multiplier
        });
      }
    });
    
    // 买码规则第二步：玩家A的最终得分 = (玩家A对所有其他玩家的得分之和) × (1 + 玩家A自己的码数)
    // 基础倍数为1，每有1只码是多一倍
    const playerMultiplier = 1 + (player.ma || 0);
    totalScore = subTotalScore * playerMultiplier;

    results.push({
      playerIndex: playerIndex,
      playerName: player.name,
      totalScore: totalScore,  // 用于验证：totalScore * (1 + player.ma) 求和为0
      subTotalScore: subTotalScore,  // 显示用：未乘本方码数的分数
      playerMa: player.ma || 0,
      playerMultiplier: playerMultiplier,
      details: details
    });

    detailResults.push({
      playerIndex: playerIndex,
      playerName: player.name,
      totalScore: totalScore,
      subTotalScore: subTotalScore,
      playerMa: player.ma || 0,
      playerMultiplier: playerMultiplier,
      winScores: scores,  // 保存最终的scores用于调试
      gangScores: scores,  // 为了兼容性，也保存scores
      details: details
    });
  });

  return {
    results: results,
    detailResults: detailResults,
    winScores: winScores,  // 保存胡分明细
    gangScores: gangScores  // 保存杠分明细
  };
}

module.exports = {
  calculateWinScore,
  calculateGangScore,
  calculateAllScores
};
