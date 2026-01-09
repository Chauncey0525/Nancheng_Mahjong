#!/bin/bash

# 检查游戏服务器状态
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  检查游戏服务器状态"
echo "=========================================="
echo ""

# 检查后端进程
echo "1. 检查后端进程..."
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "✅ 后端进程运行中 (PID: $BACKEND_PID)"
    else
        echo "❌ 后端进程不存在 (PID文件存在但进程已停止)"
    fi
else
    echo "⚠️  未找到后端进程ID文件"
fi

# 检查前端进程
echo ""
echo "2. 检查前端进程..."
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "✅ 前端进程运行中 (PID: $FRONTEND_PID)"
    else
        echo "❌ 前端进程不存在 (PID文件存在但进程已停止)"
    fi
else
    echo "⚠️  未找到前端进程ID文件"
fi

# 检查端口
echo ""
echo "3. 检查端口占用..."
if command -v netstat &> /dev/null; then
    if netstat -ano | grep :3001 > /dev/null 2>&1; then
        echo "✅ 端口3001已被占用（后端可能正在运行）"
    else
        echo "❌ 端口3001未被占用（后端可能未运行）"
    fi
    
    if netstat -ano | grep :5173 > /dev/null 2>&1; then
        echo "✅ 端口5173已被占用（前端可能正在运行）"
    else
        echo "❌ 端口5173未被占用（前端可能未运行）"
    fi
else
    echo "⚠️  未安装netstat，无法检查端口"
fi

# 检查日志文件
echo ""
echo "4. 检查日志文件..."
if [ -d "logs" ]; then
    if [ -f "logs/backend.log" ]; then
        BACKEND_SIZE=$(wc -l < logs/backend.log 2>/dev/null || echo "0")
        echo "✅ 后端日志存在 (行数: $BACKEND_SIZE)"
        echo "   最后几行:"
        tail -3 logs/backend.log | sed 's/^/   /'
    else
        echo "❌ 后端日志不存在"
    fi
    
    if [ -f "logs/frontend.log" ]; then
        FRONTEND_SIZE=$(wc -l < logs/frontend.log 2>/dev/null || echo "0")
        echo "✅ 前端日志存在 (行数: $FRONTEND_SIZE)"
    else
        echo "❌ 前端日志不存在"
    fi
else
    echo "❌ logs目录不存在"
fi

# 测试后端连接
echo ""
echo "5. 测试后端连接..."
if command -v curl &> /dev/null; then
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ 后端API可访问"
        curl -s http://localhost:3001/api/health | head -1
    else
        echo "❌ 无法连接到后端API"
    fi
else
    echo "⚠️  未安装curl，无法测试连接"
fi

echo ""
echo "=========================================="
echo "检查完成"
echo "=========================================="
