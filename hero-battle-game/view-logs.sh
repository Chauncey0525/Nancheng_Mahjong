#!/bin/bash

# 查看游戏服务器日志
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  查看游戏服务器日志"
echo "=========================================="
echo ""

# 检查日志目录
if [ ! -d "logs" ]; then
    echo "⚠️  logs目录不存在，可能服务器还未启动"
    echo "   运行 bash start-game.sh 启动服务器"
    exit 1
fi

echo "选择要查看的日志："
echo "  1) 后端日志 (backend.log)"
echo "  2) 前端日志 (frontend.log)"
echo "  3) 实时查看后端日志 (tail -f)"
echo "  4) 实时查看前端日志 (tail -f)"
echo "  5) 查看所有日志文件"
echo ""
read -p "请选择 (1-5): " choice

case $choice in
    1)
        if [ -f "logs/backend.log" ]; then
            echo ""
            echo "=== 后端日志 (最后50行) ==="
            tail -50 logs/backend.log
        else
            echo "❌ logs/backend.log 不存在"
        fi
        ;;
    2)
        if [ -f "logs/frontend.log" ]; then
            echo ""
            echo "=== 前端日志 (最后50行) ==="
            tail -50 logs/frontend.log
        else
            echo "❌ logs/frontend.log 不存在"
        fi
        ;;
    3)
        if [ -f "logs/backend.log" ]; then
            echo ""
            echo "=== 实时查看后端日志 (按Ctrl+C退出) ==="
            tail -f logs/backend.log
        else
            echo "❌ logs/backend.log 不存在"
            echo "   运行 bash start-game.sh 启动服务器"
        fi
        ;;
    4)
        if [ -f "logs/frontend.log" ]; then
            echo ""
            echo "=== 实时查看前端日志 (按Ctrl+C退出) ==="
            tail -f logs/frontend.log
        else
            echo "❌ logs/frontend.log 不存在"
            echo "   运行 bash start-game.sh 启动服务器"
        fi
        ;;
    5)
        echo ""
        echo "=== 所有日志文件 ==="
        ls -lh logs/ 2>/dev/null || echo "logs目录为空"
        ;;
    *)
        echo "无效选择"
        exit 1
        ;;
esac
