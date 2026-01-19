// pages/range-analyzer/range-analyzer.js
Page({
  data: {
    position: 'BTN',
    range: null,
    positions: ['UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB']
  },

  onLoad() {
    this.loadRange();
  },

  // 设置位置
  setPosition(e) {
    const position = this.data.positions[e.detail.value];
    this.setData({ position });
    this.loadRange();
  },

  // 加载范围
  loadRange() {
    // 这里可以从GTO API或本地数据加载范围
    // 暂时使用示例数据
    const range = this.generateRange(this.data.position);
    this.setData({ range });
  },

  // 生成范围（示例）
  generateRange(position) {
    // 这里应该从GTO数据中获取实际范围
    // 暂时返回空对象
    return {};
  }
});
