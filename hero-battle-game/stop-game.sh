#!/bin/bash

# 停止游戏服务器脚本
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  停止游戏服务器"
echo "=========================================="
echo ""

if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "停止后端服务器 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        echo "✅ 后端服务器已停止"
    else
        echo "⚠️  后端进程不存在"
    fi
    rm -f logs/backend.pid
else
    echo "⚠️  未找到后端进程ID文件"
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "停止前端服务器 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ 前端服务器已停止"
    else
        echo "⚠️  前端进程不存在"
    fi
    rm -f logs/frontend.pid
else
    echo "⚠️  未找到前端进程ID文件"
fi

# 尝试通过端口杀死进程（备用方法）
echo ""
echo "检查并清理占用端口的进程..."
if command -v lsof &> /dev/null; then
    # Linux/Mac
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
elif command -v netstat &> /dev/null; then
    # Windows (Git Bash)
    netstat -ano | grep :3001 | awk '{print $5}' | xargs kill -9 2>/dev/null || true
    netstat -ano | grep :5173 | awk '{print $5}' | xargs kill -9 2>/dev/null || true
fi

echo ""
echo "=========================================="
echo "✅ 停止完成！"
echo "=========================================="
