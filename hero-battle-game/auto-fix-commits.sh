#!/bin/bash

# 自动化修复乱码commit - 简化版
# 在Git Bash中运行此脚本

set -e

echo "=========================================="
echo "  自动化修复Git Commit乱码"
echo "=========================================="
echo ""

# 设置环境变量
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

# 配置Git
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false

echo "✅ Git配置完成"
echo ""

# 暂存未提交的更改
if ! git diff-index --quiet HEAD --; then
    echo "暂存未提交的更改..."
    git stash push -m "临时保存：修复commit前"
fi

# 创建备份
BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH"
echo "✅ 备份分支: $BACKUP_BRANCH"
echo ""

# 显示需要修复的commit
echo "检测到的乱码commit："
git log --oneline --all | grep -E "[^[:print:]]" | head -10 || echo "未检测到明显的乱码"
echo ""

echo "⚠️  要修复commit，需要手动使用交互式rebase"
echo ""
echo "运行以下命令开始修复："
echo "  git rebase -i HEAD~N  (N是需要修复的commit数量)"
echo ""
echo "在编辑器中："
echo "  1. 将需要修改的commit的 'pick' 改为 'reword'"
echo "  2. 保存并关闭"
echo "  3. 在下一个编辑器中输入正确的中文信息"
echo ""

# 恢复暂存
if git stash list | grep -q "临时保存：修复commit前"; then
    echo "恢复暂存的更改..."
    git stash pop || true
fi
