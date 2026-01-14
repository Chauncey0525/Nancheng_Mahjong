// 测试算分逻辑
const scoring = require('./utils/scoring.js');

// 辅助函数：打印结果
function printResult(title, gameData, result) {
  console.log('\n' + '='.repeat(60));
  console.log(`测试场景：${title}`);
  console.log('='.repeat(60));
  
  console.log('\n【游戏数据】');
  console.log('玩家信息：');
  gameData.players.forEach((p, i) => {
    console.log(`  ${p.name}: 码数=${p.ma}, 庄家=${p.isDealer ? '是' : '否'}`);
  });
  
  console.log('\n胡牌信息：');
  console.log(`  胡牌者: ${gameData.players[gameData.winInfo.winnerIndex].name}`);
  console.log(`  胡牌类型: ${gameData.winInfo.winType}`);
  console.log(`  方式: ${gameData.winInfo.isSelfDraw ? '自摸' : '点炮'}`);
  if (!gameData.winInfo.isSelfDraw && gameData.winInfo.shooterIndex >= 0) {
    console.log(`  点炮者: ${gameData.players[gameData.winInfo.shooterIndex].name}`);
  }
  
  if (gameData.gangInfo.length > 0) {
    console.log('\n杠分信息：');
    gameData.gangInfo.forEach((gang, i) => {
      console.log(`  杠${i+1}: ${gang.type}, 杠的玩家=${gameData.players[gang.playerIndex].name}`);
      if (gang.type === '点杠') {
        console.log(`    点杠者=${gameData.players[gang.pointGangIndex].name}`);
      }
    });
  }
  
  console.log('\n【计算结果】');
  console.log('\n胡分明细：');
  Object.keys(result.winScores).forEach(key => {
    const [from, to] = key.split('_').map(Number);
    console.log(`  ${gameData.players[from].name} → ${gameData.players[to].name}: ${result.winScores[key]}分`);
  });
  
  if (Object.keys(result.gangScores).length > 0) {
    console.log('\n杠分明细：');
    Object.keys(result.gangScores).forEach(key => {
      const [from, to] = key.split('_').map(Number);
      console.log(`  ${gameData.players[from].name} → ${gameData.players[to].name}: ${result.gangScores[key]}分`);
    });
  }
  
  console.log('\n最终得分（买码规则）：');
  result.results.forEach(r => {
    console.log(`\n${r.playerName}: 总分 = ${r.totalScore >= 0 ? '+' : ''}${r.totalScore}分`);
    if (r.details.length > 0) {
      r.details.forEach(d => {
        const baseScore = d.baseScore;
        const ma = d.ma || 0;
        const multiplier = d.multiplier || (1 + ma);
        const finalScore = d.score;
        console.log(`  对${d.targetName}: (基础分${baseScore >= 0 ? '+' : ''}${baseScore}) × 倍数${multiplier}(1+码数${ma}) = ${finalScore >= 0 ? '+' : ''}${finalScore}分`);
      });
    }
  });
  
  // 验证总分和：每方的得分（已经乘以本方码数）相加应该为0
  // 因为totalScore已经是 subTotalScore × 自己的码数
  const totalSum = result.results.reduce((sum, r) => sum + r.totalScore, 0);
  console.log(`\n总分验证: ${totalSum === 0 ? '✓ 正确（每方得分总和为0）' : '✗ 错误（每方得分总和不为0，=' + totalSum + '）'}`);
}

// 测试场景1：自摸清一色，有暗杠，有码数，庄家翻倍
console.log('\n\n' + '#'.repeat(60));
console.log('# 测试场景1：自摸清一色，有暗杠，有码数，庄家翻倍');
console.log('#'.repeat(60));

const test1 = {
  players: [
    { name: '东方', position: 'east', ma: 2, isDealer: true },    // 庄家，2码
    { name: '南方', position: 'south', ma: 3, isDealer: false },   // 3码
    { name: '西方', position: 'west', ma: 1, isDealer: false },    // 1码
    { name: '北方', position: 'north', ma: 4, isDealer: false }    // 4码
  ],
  winInfo: {
    winnerIndex: 0,        // 东方自摸
    winType: '清一色',
    isSelfDraw: true,
    shooterIndex: -1,
    winnerIndices: [0]
  },
  gangInfo: [
    {
      type: '暗杠',
      playerIndex: 2,      // 西方暗杠
      pointGangIndex: -1
    }
  ]
};

const result1 = scoring.calculateAllScores(test1);
printResult('自摸清一色，有暗杠，有码数，庄家翻倍', test1, result1);

// 测试场景2：点炮碰碰胡，一炮双响，有点杠，有码数
console.log('\n\n' + '#'.repeat(60));
console.log('# 测试场景2：点炮碰碰胡，一炮双响，有点杠，有码数');
console.log('#'.repeat(60));

const test2 = {
  players: [
    { name: '东方', position: 'east', ma: 2, isDealer: false },
    { name: '南方', position: 'south', ma: 3, isDealer: true },    // 庄家，3码
    { name: '西方', position: 'west', ma: 1, isDealer: false },
    { name: '北方', position: 'north', ma: 4, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 0,        // 东方和西方都胡
    winType: '碰碰胡',
    isSelfDraw: false,
    shooterIndex: 3,        // 北方点炮
    winnerIndices: [0, 2]  // 一炮双响：东方和西方
  },
  gangInfo: [
    {
      type: '点杠',
      playerIndex: 1,       // 南方点杠
      pointGangIndex: 3     // 北方点杠者
    }
  ]
};

const result2 = scoring.calculateAllScores(test2);
printResult('点炮碰碰胡，一炮双响，有点杠，有码数', test2, result2);

// 测试场景3：天胡，庄家，有码数
console.log('\n\n' + '#'.repeat(60));
console.log('# 测试场景3：天胡，庄家，有码数');
console.log('#'.repeat(60));

const test3 = {
  players: [
    { name: '东方', position: 'east', ma: 2, isDealer: true },     // 庄家，2码，天胡
    { name: '南方', position: 'south', ma: 3, isDealer: false },
    { name: '西方', position: 'west', ma: 1, isDealer: false },
    { name: '北方', position: 'north', ma: 4, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 0,
    winType: '天胡',
    isSelfDraw: true,
    shooterIndex: -1,
    winnerIndices: [0]
  },
  gangInfo: []
};

const result3 = scoring.calculateAllScores(test3);
printResult('天胡，庄家，有码数', test3, result3);

// 测试场景4：地胡，有暗杠和点杠，有码数
console.log('\n\n' + '#'.repeat(60));
console.log('# 测试场景4：地胡，有暗杠和点杠，有码数');
console.log('#'.repeat(60));

const test4 = {
  players: [
    { name: '东方', position: 'east', ma: 2, isDealer: true },     // 庄家，2码
    { name: '南方', position: 'south', ma: 3, isDealer: false },
    { name: '西方', position: 'west', ma: 1, isDealer: false },
    { name: '北方', position: 'north', ma: 4, isDealer: false }  // 地胡
  ],
  winInfo: {
    winnerIndex: 3,         // 北方地胡
    winType: '地胡',
    isSelfDraw: true,       // 地胡不需要点炮者
    shooterIndex: -1,
    winnerIndices: [3]
  },
  gangInfo: [
    {
      type: '暗杠',
      playerIndex: 1,       // 南方暗杠
      pointGangIndex: -1
    },
    {
      type: '点杠',
      playerIndex: 2,       // 西方点杠
      pointGangIndex: 0    // 东方点杠者
    }
  ]
};

const result4 = scoring.calculateAllScores(test4);
printResult('地胡，有暗杠和点杠，有码数', test4, result4);

// 测试场景5：复杂场景 - 自摸清一色碰碰胡，多个杠，有码数，庄家翻倍
console.log('\n\n' + '#'.repeat(60));
console.log('# 测试场景5：自摸清一色碰碰胡，多个杠，有码数，庄家翻倍');
console.log('#'.repeat(60));

const test5 = {
  players: [
    { name: '东方', position: 'east', ma: 2, isDealer: false },
    { name: '南方', position: 'south', ma: 3, isDealer: true },    // 庄家，3码
    { name: '西方', position: 'west', ma: 1, isDealer: false },
    { name: '北方', position: 'north', ma: 4, isDealer: false }    // 自摸清一色碰碰胡
  ],
  winInfo: {
    winnerIndex: 3,
    winType: '清一色碰碰胡',
    isSelfDraw: true,
    shooterIndex: -1,
    winnerIndices: [3]
  },
  gangInfo: [
    {
      type: '暗杠',
      playerIndex: 0,       // 东方暗杠
      pointGangIndex: -1
    },
    {
      type: '点杠',
      playerIndex: 1,       // 南方点杠
      pointGangIndex: 2    // 西方点杠者
    },
    {
      type: '暗杠',
      playerIndex: 3,       // 北方暗杠
      pointGangIndex: -1
    }
  ]
};

const result5 = scoring.calculateAllScores(test5);
printResult('自摸清一色碰碰胡，多个杠，有码数，庄家翻倍', test5, result5);

console.log('\n\n' + '='.repeat(60));
console.log('所有测试完成！');
console.log('='.repeat(60) + '\n');
