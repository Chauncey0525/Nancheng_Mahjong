// pages/knowledge/knowledge.js
Page({
  data: {
    categories: [
      { id: 'basics', name: '基础知识', icon: '📚' },
      { id: 'preflop', name: '翻牌前策略', icon: '🎯' },
      { id: 'postflop', name: '翻牌后策略', icon: '🃏' },
      { id: 'ranges', name: '手牌范围', icon: '📊' },
      { id: 'advanced', name: '高级技巧', icon: '🚀' }
    ],
    articles: [],
    selectedCategory: null,
    searchKeyword: ''
  },

  onLoad() {
    this.loadArticles();
  },

  // 加载文章列表
  loadArticles() {
    // 这里可以从后端API或本地存储加载
    const articles = [
      {
        id: '1',
        title: 'GTO基础理论',
        category: 'basics',
        summary: '了解博弈论最优策略的基本概念',
        content: 'GTO（Game Theory Optimal）是博弈论最优策略...'
      },
      {
        id: '2',
        title: '翻牌前起手牌选择',
        category: 'preflop',
        summary: '学习不同位置的起手牌范围',
        content: '翻牌前的决策是德州扑克中最重要的环节...'
      }
    ];
    
    this.setData({ articles });
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category === this.data.selectedCategory ? null : category
    });
  },

  // 搜索
  onSearch(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 查看文章详情
  viewArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/knowledge/article?id=${id}`
    });
  }
});
