#!/bin/bash

# 历史英雄养成游戏启动脚本（后台运行）
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  历史英雄养成游戏 - 启动脚本（后台）"
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

# 创建日志目录
mkdir -p logs

echo "🚀 启动后端服务器（后台运行）..."
cd backend
nohup npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "后端进程ID: $BACKEND_PID"
cd ..

# 等待后端启动（缩短到1秒）
echo "等待后端启动..."
sleep 1

echo "🚀 启动前端开发服务器（后台运行）..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端进程ID: $FRONTEND_PID"
cd ..

# 等待前端启动（缩短到2秒）
echo ""
echo "等待前端服务器启动..."
sleep 2

# 自动打开浏览器
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
echo "📱 前端地址: http://localhost:5173"
echo "🔧 后端API: http://localhost:3001"
echo ""
echo "💡 提示："
echo "   - 服务器在后台运行，不会弹出窗口"
echo "   - 日志文件：logs/backend.log 和 logs/frontend.log"
echo "   - 停止服务：运行 stop-game.sh"
echo "   - 或手动停止：kill $BACKEND_PID $FRONTEND_PID"
echo "=========================================="

# 保存进程ID到文件
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid
