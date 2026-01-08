#!/bin/bash

# Git中文支持配置脚本
# 在Git Bash中运行此脚本

echo "=== 配置Git中文支持 ==="
echo ""

# 配置Git编码
echo "1. 配置Git编码设置..."
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false

echo "✓ Git编码配置完成"
echo ""

# 设置环境变量（当前会话）
echo "2. 设置环境变量..."
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

echo "✓ 环境变量设置完成（当前会话）"
echo ""

# 添加到 ~/.bashrc 使其永久生效
echo "3. 添加到 ~/.bashrc 使其永久生效..."
if ! grep -q "export LANG=zh_CN.UTF-8" ~/.bashrc 2>/dev/null; then
    echo '' >> ~/.bashrc
    echo '# Git中文支持' >> ~/.bashrc
    echo 'export LANG=zh_CN.UTF-8' >> ~/.bashrc
    echo 'export LC_ALL=zh_CN.UTF-8' >> ~/.bashrc
    echo "✓ 已添加到 ~/.bashrc"
else
    echo "✓ ~/.bashrc 中已存在配置"
fi
echo ""

# 验证配置
echo "4. 验证配置..."
echo "Git配置:"
git config --global --get i18n.commitencoding
git config --global --get i18n.logoutputencoding
git config --global --get core.quotepath

echo ""
echo "环境变量:"
echo "LANG=$LANG"
echo "LC_ALL=$LC_ALL"
echo ""

echo "=== 配置完成 ==="
echo ""
echo "请重新打开Git Bash或运行: source ~/.bashrc"
echo ""
echo "测试提交:"
echo "  git commit -m '测试中文commit信息'"
