#!/bin/bash

# Git中文支持配置脚本
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  配置Git中文支持"
echo "=========================================="
echo ""

# 设置环境变量
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

# 配置Git使用UTF-8编码
echo "正在配置Git编码设置..."
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false

echo ""
echo "✅ Git配置完成！"
echo ""
echo "配置内容："
echo "  - commit编码: UTF-8"
echo "  - log输出编码: UTF-8"
echo "  - 路径引用: false（不转义中文路径）"
echo ""
echo "现在可以正常使用中文commit信息了！"
echo ""
echo "提示：如果之前的commit是乱码，可以运行 fix-commits-chinese.sh 来修复"
