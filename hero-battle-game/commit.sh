#!/bin/bash

# Git提交脚本（中文）
# 在Git Bash中运行此脚本

set -e

# 设置环境变量
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

# 配置Git
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false

echo "=========================================="
echo "  提交Git更改"
echo "=========================================="
echo ""

# 检查是否有更改
if git diff-index --quiet HEAD -- && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "⚠️  没有需要提交的更改"
    exit 0
fi

# 显示更改状态
echo "当前更改："
git status --short
echo ""

# 添加所有更改
echo "添加所有更改..."
git add -A

# 提交
COMMIT_MSG="优化项目：更新注册规则、修复React错误、清理无用文件、改进启动脚本"

echo "提交信息: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo ""
echo "✅ 提交完成！"
echo ""
echo "运行以下命令推送到远程："
echo "  git push origin main"
echo ""
