// 10个复杂测试案例
const scoring = require('./utils/scoring.js');

// 测试案例1：自摸平胡，有杠分，有码
const case1 = {
  players: [
    { name: '东方', ma: 2, isDealer: true },
    { name: '南方', ma: 1, isDealer: false },
    { name: '西方', ma: 3, isDealer: false },
    { name: '北方', ma: 0, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 0,
    winType: '平胡',
    isSelfDraw: true,
    shooterIndex: -1,
    winnerIndices: [0],
    isDrawGame: false
  },
  gangInfo: [
    { type: '点杠', playerIndex: 1, pointGangIndex: 2 }
  ]
};

// 测试案例2：点炮打烂，一炮双响，有暗杠
const case2 = {
  players: [
    { name: '东方', ma: 1, isDealer: false },
    { name: '南方', ma: 2, isDealer: true },
    { name: '西方', ma: 1, isDealer: false },
    { name: '北方', ma: 3, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 0,
    winType: '打烂',
    isSelfDraw: false,
    shooterIndex: 3,
    winnerIndices: [0, 1],
    isDrawGame: false
  },
  gangInfo: [
    { type: '暗杠', playerIndex: 2, pointGangIndex: -1 }
  ]
};

// 测试案例3：自摸七星，有多个杠（点杠+暗杠）
const case3 = {
  players: [
    { name: '东方', ma: 0, isDealer: false },
    { name: '南方', ma: 2, isDealer: false },
    { name: '西方', ma: 1, isDealer: true },
    { name: '北方', ma: 4, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 2,
    winType: '七星',
    isSelfDraw: true,
    shooterIndex: -1,
    winnerIndices: [2],
    isDrawGame: false
  },
  gangInfo: [
    { type: '点杠', playerIndex: 0, pointGangIndex: 1 },
    { type: '暗杠', playerIndex: 3, pointGangIndex: -1 }
  ]
};

// 测试案例4：点炮碰碰胡，一炮三响，庄家点炮
const case4 = {
  players: [
    { name: '东方', ma: 1, isDealer: false },
    { name: '南方', ma: 2, isDealer: true },
    { name: '西方', ma: 0, isDealer: false },
    { name: '北方', ma: 1, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 0,
    winType: '碰碰胡',
    isSelfDraw: false,
    shooterIndex: 1,
    winnerIndices: [0, 2, 3],
    isDrawGame: false
  },
  gangInfo: []
};

// 测试案例5：自摸七对，有码，庄家胡牌
const case5 = {
  players: [
    { name: '东方', ma: 3, isDealer: true },
    { name: '南方', ma: 1, isDealer: false },
    { name: '西方', ma: 2, isDealer: false },
    { name: '北方', ma: 0, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 0,
    winType: '七对',
    isSelfDraw: true,
    shooterIndex: -1,
    winnerIndices: [0],
    isDrawGame: false
  },
  gangInfo: [
    { type: '点杠', playerIndex: 1, pointGangIndex: 2 }
  ]
};

// 测试案例6：点炮清一色，有多个点杠
const case6 = {
  players: [
    { name: '东方', ma: 2, isDealer: false },
    { name: '南方', ma: 1, isDealer: false },
    { name: '西方', ma: 3, isDealer: true },
    { name: '北方', ma: 1, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 0,
    winType: '清一色',
    isSelfDraw: false,
    shooterIndex: 2,
    winnerIndices: [0],
    isDrawGame: false
  },
  gangInfo: [
    { type: '点杠', playerIndex: 1, pointGangIndex: 3 },
    { type: '点杠', playerIndex: 2, pointGangIndex: 1 }
  ]
};

// 测试案例7：自摸清一色碰碰胡，有暗杠，高码
const case7 = {
  players: [
    { name: '东方', ma: 5, isDealer: false },
    { name: '南方', ma: 3, isDealer: false },
    { name: '西方', ma: 4, isDealer: true },
    { name: '北方', ma: 2, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 0,
    winType: '清一色碰碰胡',
    isSelfDraw: true,
    shooterIndex: -1,
    winnerIndices: [0],
    isDrawGame: false
  },
  gangInfo: [
    { type: '暗杠', playerIndex: 1, pointGangIndex: -1 }
  ]
};

// 测试案例8：点炮清一色七对，一炮双响，有码
const case8 = {
  players: [
    { name: '东方', ma: 2, isDealer: false },
    { name: '南方', ma: 1, isDealer: true },
    { name: '西方', ma: 0, isDealer: false },
    { name: '北方', ma: 3, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 0,
    winType: '清一色七对',
    isSelfDraw: false,
    shooterIndex: 3,
    winnerIndices: [0, 2],
    isDrawGame: false
  },
  gangInfo: [
    { type: '点杠', playerIndex: 1, pointGangIndex: 0 }
  ]
};

// 测试案例9：荒庄，只有杠分和码
const case9 = {
  players: [
    { name: '东方', ma: 2, isDealer: true },
    { name: '南方', ma: 1, isDealer: false },
    { name: '西方', ma: 3, isDealer: false },
    { name: '北方', ma: 0, isDealer: false }
  ],
  winInfo: {
    winnerIndex: -1,
    winType: '',
    isSelfDraw: true,
    shooterIndex: -1,
    winnerIndices: [],
    isDrawGame: true
  },
  gangInfo: [
    { type: '点杠', playerIndex: 0, pointGangIndex: 1 },
    { type: '暗杠', playerIndex: 2, pointGangIndex: -1 }
  ]
};

// 测试案例10：自摸打烂，多个暗杠，高码
const case10 = {
  players: [
    { name: '东方', ma: 4, isDealer: false },
    { name: '南方', ma: 2, isDealer: true },
    { name: '西方', ma: 3, isDealer: false },
    { name: '北方', ma: 1, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 1,
    winType: '打烂',
    isSelfDraw: true,
    shooterIndex: -1,
    winnerIndices: [1],
    isDrawGame: false
  },
  gangInfo: [
    { type: '暗杠', playerIndex: 0, pointGangIndex: -1 },
    { type: '暗杠', playerIndex: 2, pointGangIndex: -1 },
    { type: '点杠', playerIndex: 3, pointGangIndex: 0 }
  ]
};

// 运行所有测试案例
const cases = [
  { name: '案例1：自摸平胡，有杠分，有码', data: case1 },
  { name: '案例2：点炮打烂，一炮双响，有暗杠', data: case2 },
  { name: '案例3：自摸七星，有多个杠（点杠+暗杠）', data: case3 },
  { name: '案例4：点炮碰碰胡，一炮三响，庄家点炮', data: case4 },
  { name: '案例5：自摸七对，有码，庄家胡牌', data: case5 },
  { name: '案例6：点炮清一色，有多个点杠', data: case6 },
  { name: '案例7：自摸清一色碰碰胡，有暗杠，高码', data: case7 },
  { name: '案例8：点炮清一色七对，一炮双响，有码', data: case8 },
  { name: '案例9：荒庄，只有杠分和码', data: case9 },
  { name: '案例10：自摸打烂，多个暗杠，高码', data: case10 }
];

function formatResult(result) {
  let output = '';
  output += `玩家: ${result.playerName}\n`;
  output += `  总分（未乘本方码）: ${result.subTotalScore}分\n`;
  if (result.details && result.details.length > 0) {
    output += `  明细:\n`;
    result.details.forEach(detail => {
      output += `    对${detail.targetName}: ${detail.score >= 0 ? '+' : ''}${detail.score}分 (基础:${detail.baseScore}, 对方码:${detail.ma}, 倍数:${detail.multiplier})\n`;
    });
  }
  return output;
}

console.log('='.repeat(80));
console.log('10个复杂测试案例结果');
console.log('='.repeat(80));

cases.forEach((testCase, index) => {
  console.log(`\n${testCase.name}`);
  console.log('-'.repeat(80));
  
  // 打印输入信息
  console.log('输入信息:');
  console.log(`  玩家信息:`);
  testCase.data.players.forEach((p, i) => {
    console.log(`    ${p.name}: 码数=${p.ma}, 庄家=${p.isDealer ? '是' : '否'}`);
  });
  
  if (!testCase.data.winInfo.isDrawGame) {
    console.log(`  胡牌信息:`);
    console.log(`    胡牌者: ${testCase.data.players[testCase.data.winInfo.winnerIndex].name}`);
    console.log(`    胡牌类型: ${testCase.data.winInfo.winType}`);
    console.log(`    方式: ${testCase.data.winInfo.isSelfDraw ? '自摸' : '点炮'}`);
    if (!testCase.data.winInfo.isSelfDraw) {
      console.log(`    点炮者: ${testCase.data.players[testCase.data.winInfo.shooterIndex].name}`);
      if (testCase.data.winInfo.winnerIndices.length > 1) {
        console.log(`    一炮多响: ${testCase.data.winInfo.winnerIndices.map(i => testCase.data.players[i].name).join(', ')}`);
      }
    }
  } else {
    console.log(`  荒庄（流局）`);
  }
  
  if (testCase.data.gangInfo.length > 0) {
    console.log(`  杠分信息:`);
    testCase.data.gangInfo.forEach((gang, i) => {
      const gangPlayer = testCase.data.players[gang.playerIndex];
      if (gang.type === '点杠') {
        const pointGangPlayer = testCase.data.players[gang.pointGangIndex];
        console.log(`    ${i + 1}. ${gang.type}: ${gangPlayer.name}杠，点杠者${pointGangPlayer.name}`);
      } else {
        console.log(`    ${i + 1}. ${gang.type}: ${gangPlayer.name}杠`);
      }
    });
  }
  
  // 计算得分
  const result = scoring.calculateAllScores(testCase.data);
  
  console.log('\n计算结果:');
  result.results.forEach(r => {
    console.log(formatResult(r));
  });
  
  // 验证总分
  const totalSum = result.results.reduce((sum, r) => sum + r.totalScore, 0);
  console.log(`\n验证: 所有玩家的totalScore（已乘本方码）之和 = ${totalSum} (应该为0)`);
  
  // 验证subTotalScore之和
  const subTotalSum = result.results.reduce((sum, r) => sum + r.subTotalScore, 0);
  console.log(`验证: 所有玩家的subTotalScore（未乘本方码）之和 = ${subTotalSum} (应该为0)`);
  
  console.log('\n' + '='.repeat(80));
});
