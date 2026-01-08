#!/bin/bash

# 修复所有乱码commit信息的脚本
# 在Git Bash中运行此脚本

echo "=== 修复乱码commit信息 ==="
echo ""
echo "将修复以下commit："
echo "1. 5db7745 - 添加Git中文支持配置"
echo "2. 9ef4d92 - 添加历史英雄养成游戏项目"
echo "3. 1b0ec52 - 删除CBDB相关文件"
echo ""
read -p "是否继续？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 1
fi

echo ""
echo "开始交互式rebase..."
echo ""

# 使用交互式rebase修改最近3个commit
GIT_SEQUENCE_EDITOR="sed -i '1s/^pick/reword/; 2s/^pick/reword/; 3s/^pick/reword/'" git rebase -i HEAD~3

echo ""
echo "如果rebase成功，请运行："
echo "  git push origin main --force"
echo ""
echo "⚠️ 注意：force push会覆盖远程历史"
