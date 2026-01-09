#!/bin/bash

# 历史英雄养成游戏启动脚本
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  历史英雄养成游戏 - 启动脚本"
echo "=========================================="
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到npm，请先安装npm"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"
echo "✅ npm版本: $(npm -v)"
echo ""

# 检查依赖是否已安装
if [ ! -d "backend/node_modules" ]; then
    echo "📦 后端依赖未安装，正在安装..."
    cd backend
    npm install
    cd ..
    echo ""
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 前端依赖未安装，正在安装..."
    cd frontend
    npm install
    cd ..
    echo ""
fi

echo "🚀 启动后端服务器..."
cd backend
start bash -c "npm start; exec bash"
cd ..

# 等待后端启动
sleep 2

echo "🚀 启动前端开发服务器..."
cd frontend
start bash -c "npm run dev; exec bash"
cd ..

# 等待前端启动
echo ""
echo "等待前端服务器启动..."
sleep 2

# 自动打开浏览器（只打开一个）
echo "正在打开浏览器..."
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:5173 2>/dev/null &
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:5173 2>/dev/null &
elif command -v start &> /dev/null; then
    # Windows (Git Bash)
    start http://localhost:5173 2>/dev/null &
fi

echo ""
echo "=========================================="
echo "✅ 启动完成！"
echo ""
echo "📱 前端地址: http://localhost:5173 或 http://localhost:5174"
echo "🔧 后端API: http://localhost:3001"
echo ""
echo "💡 提示：两个新窗口已打开，分别运行前端和后端"
echo "   浏览器应该已自动打开，如果没有请手动访问上述地址"
echo "   关闭窗口即可停止对应的服务"
echo "=========================================="
