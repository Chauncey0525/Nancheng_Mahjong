#!/bin/bash

# 数据库迁移脚本
# 将旧的英雄系统迁移到新的宝可梦风格系统
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  数据库迁移：更新英雄系统"
echo "=========================================="
echo ""
echo "⚠️  警告：此操作会更新数据库结构"
echo "   建议先备份数据库文件：backend/game.db"
echo ""
read -p "是否继续？(y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "已取消"
    exit 0
fi

echo ""
echo "1. 更新数据库结构..."
cd backend
node scripts/updateHeroSchema.js

if [ $? -ne 0 ]; then
    echo "❌ 数据库结构更新失败"
    exit 1
fi

echo ""
echo "2. 导入新的英雄数据..."
node scripts/importHeroes.js

if [ $? -ne 0 ]; then
    echo "❌ 英雄数据导入失败"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ 迁移完成！"
echo "=========================================="
echo ""
echo "新的英雄系统特性："
echo "  - 属性类型：生命、物攻、法攻、物抗、法抗、速度"
echo "  - 角色定位：战士、刺客、法师、治疗、坦克、射手、辅助"
echo "  - 属性克制：参考宝可梦的克制关系"
echo "  - 所有英雄平等，无星级区分"
echo ""
