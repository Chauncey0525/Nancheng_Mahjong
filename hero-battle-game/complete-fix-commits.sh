#!/bin/bash

# 完全自动化修复所有乱码commit
# 在Git Bash中运行此脚本

set -e

echo "=========================================="
echo "  完全自动化修复Git Commit乱码"
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

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"
echo ""

# 暂存未提交的更改
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  检测到未提交的更改，正在暂存..."
    git stash push -m "临时保存：修复commit前 $(date +%Y%m%d-%H%M%S)"
    STASHED=true
else
    STASHED=false
fi

# 创建备份分支
BACKUP_BRANCH="backup-before-fix-commits-$(date +%Y%m%d-%H%M%S)"
echo "创建备份分支: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"
echo "✅ 备份分支已创建"
echo ""

# 显示需要修复的commit（乱码的）
echo "检测到的可能乱码的commit："
git log --oneline -20 | grep -E "[^\x00-\x7F]" | head -10 || echo "未检测到明显的乱码"
echo ""

# 需要修复的commit映射
declare -A FIXES=(
    ["57af113"]="优化前端UI样式并实现响应式设计"
    ["9c2aa78"]="添加修复乱码commit的指南和脚本"
    ["5db7745"]="添加Git中文支持配置"
    ["9ef4d92"]="添加历史英雄养成游戏项目"
    ["1b0ec52"]="删除CBDB相关文件"
    ["ee83cd3"]="删除CBDB相关文件"
    ["e0e6d5e"]="删除CBDB相关文件"
    ["8b185c1"]="删除CBDB相关文件"
    ["26843f0"]="清理临时文件：删除修改commit消息时创建的临时脚本文件"
    ["e27695d"]="更新数据库和格式文件"
    ["b00d716"]="修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题"
)

echo "准备修复的commit："
for hash in "${!FIXES[@]}"; do
    if git cat-file -e "$hash" 2>/dev/null; then
        echo "  $hash -> ${FIXES[$hash]}"
    fi
done
echo ""

read -p "是否继续？这将需要交互式rebase (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
    exit 1
fi

# 找到最早的commit
EARLIEST=""
for hash in "${!FIXES[@]}"; do
    if git cat-file -e "$hash" 2>/dev/null; then
        if [ -z "$EARLIEST" ]; then
            EARLIEST="$hash"
        else
            # 比较时间，找到更早的
            if git log --format=%ct "$hash" -1 | awk '{if ($1 < '$EARLIEST_TIME') EARLIEST="$hash"}'; then
                EARLIEST="$hash"
            fi
        fi
    fi
done

if [ -z "$EARLIEST" ]; then
    echo "未找到需要修复的commit"
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
    exit 0
fi

PARENT=$(git rev-parse "$EARLIEST^" 2>/dev/null || echo "")

if [ -z "$PARENT" ]; then
    echo "无法找到父commit，请手动修复"
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
    exit 1
fi

echo ""
echo "开始交互式rebase..."
echo "从 $PARENT 开始"
echo ""
echo "在编辑器中："
echo "  1. 找到需要修改的commit（显示为乱码的）"
echo "  2. 将 'pick' 改为 'reword'"
echo "  3. 保存并关闭"
echo "  4. 在下一个编辑器中输入正确的中文信息"
echo ""
read -p "按Enter开始rebase..."

git rebase -i "$PARENT"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Rebase完成！"
    echo ""
    echo "请运行以下命令推送到远程："
    echo "  git push origin $CURRENT_BRANCH --force"
    echo ""
    echo "⚠️  注意：force push会覆盖远程历史"
else
    echo ""
    echo "❌ Rebase失败或已取消"
    echo "运行以下命令取消rebase："
    echo "  git rebase --abort"
fi

# 恢复暂存
if [ "$STASHED" = true ]; then
    echo ""
    echo "恢复暂存的更改..."
    git stash pop || true
fi
