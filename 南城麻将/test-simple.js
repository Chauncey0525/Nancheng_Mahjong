// 简单测试：验证买码规则
const scoring = require('./utils/scoring.js');

// 测试场景：根据README示例
// 东方需要支付南方2分胡分，获得他1分码分（杠分），并且南方有4个码
// 期望：对东方来说，和南方的分数关系为（-2+1）*4=-4分
const test = {
  players: [
    { name: '东方', position: 'east', ma: 0, isDealer: false },
    { name: '南方', position: 'south', ma: 4, isDealer: false },
    { name: '西方', position: 'west', ma: 0, isDealer: false },
    { name: '北方', position: 'north', ma: 0, isDealer: false }
  ],
  winInfo: {
    winnerIndex: 1,        // 南方胡牌（假设）
    winType: '平胡',
    isSelfDraw: false,
    shooterIndex: 0,       // 东方点炮
    winnerIndices: [1]
  },
  gangInfo: [
    {
      type: '点杠',
      playerIndex: 0,       // 东方点杠
      pointGangIndex: 1    // 南方点杠者
    }
  ]
};

console.log('简单测试：根据README示例');
console.log('东方需要支付南方2分胡分，获得他1分码分（杠分），南方有4个码');
console.log('期望：对东方来说，和南方的分数关系为（-2+1）*4=-4分');
console.log('');

const result = scoring.calculateAllScores(test);

console.log('胡分明细：');
Object.keys(result.winScores).forEach(key => {
  const [from, to] = key.split('_').map(Number);
  console.log(`  ${test.players[from].name} → ${test.players[to].name}: ${result.winScores[key]}分`);
});

console.log('\n杠分明细：');
Object.keys(result.gangScores).forEach(key => {
  const [from, to] = key.split('_').map(Number);
  console.log(`  ${test.players[from].name} → ${test.players[to].name}: ${result.gangScores[key]}分`);
});

console.log('\n最终得分：');
result.results.forEach(r => {
  console.log(`  ${r.playerName}: ${r.totalScore >= 0 ? '+' : ''}${r.totalScore}分`);
  r.details.forEach(d => {
    const ma = d.ma || 0;
    const multiplier = d.multiplier || (1 + ma);
    console.log(`    对${d.targetName}: 基础分${d.baseScore >= 0 ? '+' : ''}${d.baseScore} × 倍数${multiplier}(1+码数${ma}) = ${d.score >= 0 ? '+' : ''}${d.score}分`);
  });
});

// 验证：每方的得分（已经乘以本方码数）相加应该为0
const totalSum = result.results.reduce((sum, r) => sum + r.totalScore, 0);
console.log(`\n总分验证: ${totalSum === 0 ? '✓ 正确（每方得分总和为0）' : '✗ 错误，每方得分总和=' + totalSum}`);
