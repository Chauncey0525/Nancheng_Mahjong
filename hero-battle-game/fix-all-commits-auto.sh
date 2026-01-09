#!/bin/bash

# 完全自动化修复所有乱码commit的脚本
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  完全自动化修复Git Commit乱码"
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

# 检查是否有未提交的更改
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  检测到未提交的更改，正在暂存..."
    git stash push -m "临时保存：修复commit前的更改"
    STASHED=true
else
    STASHED=false
fi

# 创建备份分支
BACKUP_BRANCH="backup-before-fix-$(date +%Y%m%d-%H%M%S)"
echo "创建备份分支: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"
echo "✅ 备份分支已创建: $BACKUP_BRANCH"
echo ""

# 需要修复的commit映射（hash -> 正确的中文信息）
declare -A COMMIT_FIXES=(
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

echo "准备修复以下commit："
for commit in "${!COMMIT_FIXES[@]}"; do
    if git cat-file -e "$commit" 2>/dev/null; then
        OLD_MSG=$(git log --format=%s -1 "$commit" 2>/dev/null)
        NEW_MSG="${COMMIT_FIXES[$commit]}"
        echo "  - $commit"
        echo "    旧: $OLD_MSG"
        echo "    新: $NEW_MSG"
    fi
done
echo ""

read -p "是否继续自动修复？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
    exit 1
fi

echo ""
echo "开始修复..."
echo ""

# 获取所有需要修复的commit，按时间顺序排序
COMMITS=($(git log --reverse --format=%H --all | while read hash; do
    if [[ -n "${COMMIT_FIXES[$hash]}" ]]; then
        echo "$hash"
    fi
done))

if [ ${#COMMITS[@]} -eq 0 ]; then
    echo "没有找到需要修复的commit"
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
    exit 0
fi

# 从最早的commit开始修复
FIRST_COMMIT="${COMMITS[0]}"
PARENT_COMMIT=$(git rev-parse "$FIRST_COMMIT^" 2>/dev/null || echo "")

if [ -z "$PARENT_COMMIT" ]; then
    echo "无法找到父commit，跳过修复"
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
    exit 1
fi

echo "从 $PARENT_COMMIT 开始交互式rebase..."
echo ""

# 创建rebase脚本
REBASE_SCRIPT=$(mktemp)
cat > "$REBASE_SCRIPT" << 'EOF'
#!/bin/bash
# 自动修改commit消息
for commit in "${COMMITS[@]}"; do
    if [ -n "${COMMIT_FIXES[$commit]}" ]; then
        git filter-branch -f --msg-filter "
            if [ \$GIT_COMMIT = $commit ]; then
                echo '${COMMIT_FIXES[$commit]}'
            else
                cat
            fi
        " -- --all
    fi
done
EOF

# 使用交互式rebase
echo "请在打开的编辑器中："
echo "1. 找到需要修改的commit（显示为乱码的）"
echo "2. 将 'pick' 改为 'reword'"
echo "3. 保存并关闭编辑器"
echo "4. 在下一个编辑器中输入正确的中文commit信息"
echo ""
echo "按Enter继续..."
read

GIT_SEQUENCE_EDITOR="sed -i 's/^pick/reword/g'" git rebase -i "$PARENT_COMMIT"

REBASE_STATUS=$?

if [ $REBASE_STATUS -eq 0 ]; then
    echo ""
    echo "✅ Rebase完成！"
    echo ""
    echo "请运行以下命令推送到远程："
    echo "  git push origin main --force"
    echo ""
    echo "⚠️  注意：force push会覆盖远程历史"
else
    echo ""
    echo "❌ Rebase失败或已取消"
    echo "运行以下命令取消rebase："
    echo "  git rebase --abort"
fi

# 恢复暂存的更改
if [ "$STASHED" = true ]; then
    echo ""
    echo "恢复暂存的更改..."
    git stash pop
fi
