#!/bin/bash

# 更新英雄数据脚本
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  更新英雄数据"
echo "=========================================="
echo ""

cd backend

echo "1. 修复数据库结构（添加性别字段，更新角色定位）..."
node scripts/fixAllHeroes.js

if [ $? -ne 0 ]; then
    echo "❌ 修复失败"
    exit 1
fi

echo ""
echo "2. 更新英雄属性分配..."
node scripts/updateHeroAttributes.js

if [ $? -ne 0 ]; then
    echo "❌ 属性更新失败"
    exit 1
fi

echo ""
echo "3. 导入/更新英雄数据..."
node scripts/importHeroes.js

if [ $? -ne 0 ]; then
    echo "❌ 导入失败"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ 更新完成！"
echo "=========================================="
echo ""
echo "更新内容："
echo "  - 添加性别字段"
echo "  - 更新角色定位（奶妈→治疗，成吉思汗→射手等）"
echo "  - 更新属性分布（更分散，包含龙、钢、超能力等）"
echo "  - 添加20位外国名人"
echo ""
