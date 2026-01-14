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
      // 点杠：放杠者2分，庄家翻倍4分，其余玩家1分
      // 注意：如果捡杠者是庄家，放杠者和其他玩家都要翻倍（庄家没有奇数）
      if (pointGangIndex >= 0 && pointGangIndex < players.length) {
        const pointGangPlayer = players[pointGangIndex]; // 放杠者
        let pointGangScore = config.GANG_SCORES['点杠'].pointGang;
        // 如果放杠者是庄家，翻倍
        if (pointGangPlayer.isDealer) {
          pointGangScore = config.GANG_SCORES['点杠'].dealer;
        }
        // 如果捡杠者是庄家，放杠者也要翻倍
        else if (gangPlayer.isDealer) {
          pointGangScore = config.GANG_SCORES['点杠'].dealer;
        }
        scores[`${pointGangIndex}_${playerIndex}`] = pointGangScore;
      }

      // 其余玩家各1分，但如果捡杠者是庄家，翻倍为2分
      players.forEach((player, idx) => {
        if (idx !== playerIndex && idx !== pointGangIndex) {
          let score = config.GANG_SCORES['点杠'].others;
          // 如果其他玩家是庄家，翻倍
          if (player.isDealer) {
            score = config.GANG_SCORES['点杠'].dealer;
          }
          // 如果捡杠者是庄家，其他玩家也要翻倍（庄家没有奇数）
          else if (gangPlayer.isDealer) {
            score = config.GANG_SCORES['点杠'].others * 2; // 1分翻倍为2分
          }
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
  
  // 计算胡分（荒庄时不计算胡分）
  let winScores = {};
  if (!winInfo.isDrawGame && winInfo.winners && winInfo.winners.length > 0) {
    // 为每个胡牌者分别计算
    winInfo.winners.forEach(winner => {
      if (winner.playerIndex >= 0 && winner.winType) {
        const scores = calculateWinScore(
          winner.winType,
          winner.playerIndex,
          winInfo.isSelfDraw,
          winInfo.shooterIndex,
          [winner.playerIndex],  // 单个玩家
          players
        );
        // 合并分数
        Object.keys(scores).forEach(key => {
          winScores[key] = (winScores[key] || 0) + scores[key];
        });
      }
    });
  }

  // 计算杠分
  const gangScores = calculateGangScore(gangInfo, players);

  // 计算每个玩家的总得分
  const results = [];
  const detailResults = [];

  players.forEach((player, playerIndex) => {
    let totalScore = 0;
    const details = [];

    // 对每个其他玩家计算得分
    // 根据买码规则：每个方位计算与其他三家的正负得分
    // 第一步：计算玩家A对玩家B的得分 = (胡分+杠分) × 对方码数
    // 第二步：玩家A的最终得分 = (玩家A对所有其他玩家的得分之和) × 玩家A自己的码数
    let subTotalScore = 0; // 玩家A对所有其他玩家的得分之和（未乘以自己码数）
    
    players.forEach((otherPlayer, otherIndex) => {
      if (playerIndex !== otherIndex) {
        // 计算玩家A对玩家B的净支付（胡分+杠分）
        let baseScore = 0;
        // 玩家A需要支付给玩家B的（对玩家A来说是支付，为负数）
        baseScore -= (winScores[`${playerIndex}_${otherIndex}`] || 0);
        baseScore -= (gangScores[`${playerIndex}_${otherIndex}`] || 0);
        // 玩家B需要支付给玩家A的（对玩家A来说是获得，为正数）
        baseScore += (winScores[`${otherIndex}_${playerIndex}`] || 0);
        baseScore += (gangScores[`${otherIndex}_${playerIndex}`] || 0);
        
        // 买码规则第一步：(胡分+杠分) × (1 + 对方码数)
        // 基础倍数为1，每有1只码是多一倍
        // 比如有1只码，则分数是*2，有2只码分数*3...以此类推
        const multiplier = 1 + (otherPlayer.ma || 0);
        const score = baseScore * multiplier;
        subTotalScore += score;
        
        if (score !== 0) {
          details.push({
            targetIndex: otherIndex,
            targetName: otherPlayer.name,
            score: score,
            baseScore: baseScore,
            ma: otherPlayer.ma || 0,
            multiplier: multiplier
          });
        }
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
      winScores: winScores,
      gangScores: gangScores,
      details: details
    });
  });

  return {
    results: results,
    detailResults: detailResults,
    winScores: winScores,
    gangScores: gangScores
  };
}

module.exports = {
  calculateWinScore,
  calculateGangScore,
  calculateAllScores
};
