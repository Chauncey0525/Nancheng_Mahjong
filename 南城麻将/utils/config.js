// 算分规则配置

// 胡分配置
const WIN_SCORES = {
  '平胡': 1,
  '打烂': 2,
  '七星': 4,
  '碰碰胡': 5,
  '七对': 6,
  '清一色': 7,
  '清一色碰碰胡': 10,
  '清一色七对': 10,
  '天胡': 20,
  '地胡': 20
};

// 杠分配置
const GANG_SCORES = {
  '点杠': { 
    pointGang: 2,  // 点杠者
    dealer: 4,     // 庄家（翻倍）
    others: 1      // 其余玩家
  },
  '暗杠': { 
    others: 2,     // 其余三家
    dealer: 4      // 庄家（翻倍）
  }
};

// 胡牌类型列表
const WIN_TYPES = [
  '平胡',
  '打烂',
  '七星',
  '碰碰胡',
  '七对',
  '清一色',
  '清一色碰碰胡',
  '清一色七对',
  '天胡',
  '地胡'
];

// 方位列表
const POSITIONS = [
  { name: '东方', value: 'east', index: 0 },
  { name: '南方', value: 'south', index: 1 },
  { name: '西方', value: 'west', index: 2 },
  { name: '北方', value: 'north', index: 3 }
];

module.exports = {
  WIN_SCORES,
  GANG_SCORES,
  WIN_TYPES,
  POSITIONS
};
