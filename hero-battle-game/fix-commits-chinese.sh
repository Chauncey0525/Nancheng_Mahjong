#!/bin/bash

# 修复乱码commit信息的脚本
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  修复Git Commit乱码问题"
echo "=========================================="
echo ""

# 设置环境变量确保中文正确显示
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

# 配置Git使用UTF-8
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false

echo "✅ Git配置已更新为UTF-8"
echo ""

# 显示最近的commit
echo "最近的commit历史："
git log --oneline -10
echo ""

# 检查是否有乱码commit
echo "检查乱码commit..."
echo ""

# 需要修复的commit列表（根据实际情况修改）
# 这里列出可能需要修复的commit hash
COMMITS_TO_FIX=(
    "9c2aa78"  # 添加修复乱码commit的指南和脚本
    "5db7745"  # 添加Git中文支持配置
    "9ef4d92"  # 添加历史英雄养成游戏项目
    "1b0ec52"  # 删除CBDB相关文件
)

echo "准备修复以下commit："
for commit in "${COMMITS_TO_FIX[@]}"; do
    if git cat-file -e "$commit" 2>/dev/null; then
        echo "  - $commit: $(git log --format=%s -1 $commit)"
    fi
done
echo ""

read -p "是否继续修复？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 1
fi

echo ""
echo "⚠️  注意：修复commit需要force push，请确保没有其他人在使用这个仓库"
echo ""

# 创建备份分支
BACKUP_BRANCH="backup-before-fix-$(date +%Y%m%d-%H%M%S)"
echo "创建备份分支: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"
echo "✅ 备份分支已创建"
echo ""

# 使用交互式rebase修复commit
echo "开始交互式rebase..."
echo "在编辑器中，将需要修改的commit的 'pick' 改为 'reword'"
echo "然后保存并关闭编辑器"
echo ""

read -p "按Enter继续..." 

# 找到第一个需要修复的commit的父commit
FIRST_COMMIT="${COMMITS_TO_FIX[-1]}"
PARENT_COMMIT=$(git rev-parse "$FIRST_COMMIT^")

echo "从 $PARENT_COMMIT 开始rebase..."
git rebase -i "$PARENT_COMMIT"

echo ""
echo "如果rebase成功，请运行："
echo "  git push origin main --force"
echo ""
echo "⚠️  注意：force push会覆盖远程历史"
