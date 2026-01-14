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
    const gangPlayer = players[playerIndex];
    if (!gangPlayer) return;

    if (type === '点杠') {
      // 点杠：点杠者2分，庄家翻倍4分，其余玩家1分
      if (pointGangIndex >= 0 && pointGangIndex < players.length) {
        const pointGangPlayer = players[pointGangIndex];
        let pointGangScore = config.GANG_SCORES['点杠'].pointGang;
        if (pointGangPlayer.isDealer) {
          pointGangScore = config.GANG_SCORES['点杠'].dealer;
        }
        scores[`${pointGangIndex}_${playerIndex}`] = pointGangScore;
      }

      // 其余玩家各1分
      players.forEach((player, idx) => {
        if (idx !== playerIndex && idx !== pointGangIndex) {
          let score = config.GANG_SCORES['点杠'].others;
          if (player.isDealer) {
            score = config.GANG_SCORES['点杠'].dealer;
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
 * 计算玩家A对玩家B的得分（买码规则）
 * 规则：(胡分+杠分) × 对方码数
 * 注意：如果玩家A需要支付给玩家B，baseScore为正数；如果玩家B需要支付给玩家A，baseScore为负数
 * @param {number} playerAIndex - 玩家A索引
 * @param {number} playerBIndex - 玩家B索引
 * @param {Object} winScores - 胡分对象，格式：{from_to: score}
 * @param {Object} gangScores - 杠分对象，格式：{from_to: score}
 * @param {Array} players - 玩家数组
 * @returns {number} 得分（对玩家A来说，正数表示获得，负数表示支付）
 */
function calculateScoreBetweenPlayers(playerAIndex, playerBIndex, winScores, gangScores, players) {
  const playerA = players[playerAIndex];
  const playerB = players[playerBIndex];
  if (!playerA || !playerB) return 0;

  // 计算玩家A对玩家B的基础分数（胡分+杠分）
  // 如果玩家A需要支付给玩家B，分数为正；如果玩家B需要支付给玩家A，分数为负
  let baseScore = 0;

  // 累加所有玩家A需要支付给玩家B的胡分（正数表示支付）
  Object.keys(winScores).forEach(key => {
    const [from, to] = key.split('_').map(Number);
    if (from === playerAIndex && to === playerBIndex) {
      baseScore += winScores[key]; // 玩家A支付给玩家B，为正数
    } else if (from === playerBIndex && to === playerAIndex) {
      baseScore -= winScores[key]; // 玩家B支付给玩家A，为负数（对玩家A来说是获得）
    }
  });

  // 累加所有玩家A需要支付给玩家B的杠分
  Object.keys(gangScores).forEach(key => {
    const [from, to] = key.split('_').map(Number);
    if (from === playerAIndex && to === playerBIndex) {
      baseScore += gangScores[key]; // 玩家A支付给玩家B，为正数
    } else if (from === playerBIndex && to === playerAIndex) {
      baseScore -= gangScores[key]; // 玩家B支付给玩家A，为负数（对玩家A来说是获得）
    }
  });

  // 买码规则：(胡分+杠分) × 对方码数
  // baseScore为正数表示玩家A需要支付给玩家B，乘以玩家B的码数后仍为正数（对玩家A来说是支付）
  // baseScore为负数表示玩家B需要支付给玩家A，乘以玩家B的码数后为负数（对玩家A来说是获得）
  const finalScore = baseScore * (playerB.ma || 0);

  return finalScore;
}

/**
 * 计算所有玩家的得分
 * @param {Object} gameData - 游戏数据
 * @returns {Object} 计算结果
 */
function calculateAllScores(gameData) {
  const { players, winInfo, gangInfo } = gameData;
  
  // 计算胡分
  const winScores = calculateWinScore(
    winInfo.winType,
    winInfo.winnerIndex,
    winInfo.isSelfDraw,
    winInfo.shooterIndex,
    winInfo.winnerIndices,
    players
  );

  // 计算杠分
  const gangScores = calculateGangScore(gangInfo, players);

  // 计算每个玩家的总得分
  const results = [];
  const detailResults = [];

  players.forEach((player, playerIndex) => {
    let totalScore = 0;
    const details = [];

    // 对每个其他玩家计算得分
    players.forEach((otherPlayer, otherIndex) => {
      if (playerIndex !== otherIndex) {
        const score = calculateScoreBetweenPlayers(
          playerIndex,
          otherIndex,
          winScores,
          gangScores,
          players
        );
        totalScore += score;
        
        if (score !== 0) {
          details.push({
            targetIndex: otherIndex,
            targetName: otherPlayer.name,
            score: score,
            baseScore: (winScores[`${playerIndex}_${otherIndex}`] || 0) + (gangScores[`${playerIndex}_${otherIndex}`] || 0),
            ma: otherPlayer.ma || 0
          });
        }
      }
    });

    results.push({
      playerIndex: playerIndex,
      playerName: player.name,
      totalScore: totalScore,
      details: details
    });

    detailResults.push({
      playerIndex: playerIndex,
      playerName: player.name,
      totalScore: totalScore,
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
  calculateScoreBetweenPlayers,
  calculateAllScores
};
