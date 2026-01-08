#!/bin/bash

# 发布前后端到GitHub Packages的脚本（Git Bash版本）

echo "=== 发布到GitHub Packages ==="
echo ""

# 检查环境变量
if [ -z "$GITHUB_TOKEN" ]; then
    echo "错误: GITHUB_TOKEN 环境变量未设置!"
    echo ""
    echo "请先设置环境变量:"
    echo "  export GITHUB_TOKEN='your_token_here'"
    echo ""
    echo "或者添加到 ~/.bashrc 或 ~/.bash_profile:"
    echo "  echo 'export GITHUB_TOKEN=\"your_token_here\"' >> ~/.bashrc"
    echo "  source ~/.bashrc"
    exit 1
fi

echo "✓ GITHUB_TOKEN 已设置"
echo ""

# 发布后端
echo "正在发布后端包..."
cd backend
npm publish
if [ $? -eq 0 ]; then
    echo "✓ 后端包发布成功!"
else
    echo "✗ 后端包发布失败"
    cd ..
    exit 1
fi
cd ..
echo ""

# 发布前端
echo "正在发布前端包..."
cd frontend
npm publish
if [ $? -eq 0 ]; then
    echo "✓ 前端包发布成功!"
else
    echo "✗ 前端包发布失败"
    cd ..
    exit 1
fi
cd ..
echo ""

echo "=== 发布完成 ==="
echo "查看已发布的包: https://github.com/Chauncey0525/myGit/packages"
