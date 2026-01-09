#!/bin/bash

# Git提交中文commit的辅助脚本
# 使用方法: git-commit-chinese.sh "你的中文commit信息"

set -e

# 设置环境变量
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

# 确保Git配置正确
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false

if [ -z "$1" ]; then
    echo "使用方法: git-commit-chinese.sh \"你的中文commit信息\""
    echo ""
    echo "或者不提供参数，会打开编辑器让你输入："
    echo "  git-commit-chinese.sh"
    exit 1
fi

# 添加所有更改
git add -A

# 提交
git commit -m "$1"

echo ""
echo "✅ Commit已创建"
echo ""
echo "运行以下命令推送到远程："
echo "  git push origin main"
