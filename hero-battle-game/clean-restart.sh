#!/bin/bash

# 完全清理并重启服务器
# 在Git Bash中运行此脚本

echo "=========================================="
echo "  完全清理并重启游戏服务器"
echo "=========================================="
echo ""

# 1. 停止所有服务
echo "1. 停止所有服务..."
bash stop-game.sh 2>/dev/null
sleep 2

# 2. 强制清理占用端口的进程
echo ""
echo "2. 强制清理占用端口的进程..."
if command -v netstat &> /dev/null; then
    # Windows Git Bash使用netstat
    echo "   查找占用3001端口的进程..."
    PIDS_3001=$(netstat -ano | grep :3001 | awk '{print $5}' | sort -u | grep -v "PID" | grep -v "^$")
    if [ ! -z "$PIDS_3001" ]; then
        for pid in $PIDS_3001; do
            echo "   停止进程 $pid (占用3001端口)"
            taskkill //F //PID $pid 2>/dev/null || kill -9 $pid 2>/dev/null
        done
    else
        echo "   ✅ 端口3001未被占用"
    fi
    
    echo "   查找占用5173端口的进程..."
    PIDS_5173=$(netstat -ano | grep :5173 | awk '{print $5}' | sort -u | grep -v "PID" | grep -v "^$")
    if [ ! -z "$PIDS_5173" ]; then
        for pid in $PIDS_5173; do
            echo "   停止进程 $pid (占用5173端口)"
            taskkill //F //PID $pid 2>/dev/null || kill -9 $pid 2>/dev/null
        done
    else
        echo "   ✅ 端口5173未被占用"
    fi
fi

sleep 3

# 3. 清理旧的PID文件
echo ""
echo "3. 清理旧的PID文件..."
rm -f logs/backend.pid logs/frontend.pid
echo "✅ PID文件已清理"

# 4. 备份并清理旧日志
echo ""
echo "4. 备份旧日志..."
if [ -f "logs/backend.log" ]; then
    mv logs/backend.log "logs/backend.log.$(date +%Y%m%d_%H%M%S).bak" 2>/dev/null
    echo "✅ 后端日志已备份"
fi
if [ -f "logs/frontend.log" ]; then
    mv logs/frontend.log "logs/frontend.log.$(date +%Y%m%d_%H%M%S).bak" 2>/dev/null
    echo "✅ 前端日志已备份"
fi

# 5. 强制重新安装后端依赖
echo ""
echo "5. 强制重新安装后端依赖..."
cd backend
echo "   删除旧的 node_modules 和 package-lock.json..."
rm -rf node_modules package-lock.json
echo "   重新安装所有依赖（这可能需要几分钟）..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    cd ..
    exit 1
fi

# 验证 bcrypt 是否安装成功
if [ -d "node_modules/bcrypt" ]; then
    echo "✅ bcrypt 模块已成功安装"
else
    echo "⚠️  警告：bcrypt 模块可能未正确安装"
    echo "   尝试单独安装 bcrypt..."
    npm install bcrypt
fi
cd ..

# 6. 检查后端代码
echo ""
echo "6. 检查后端代码..."
cd backend
if node -c server.js 2>/dev/null; then
    echo "✅ server.js 语法正确"
else
    echo "❌ server.js 有语法错误"
    node -c server.js
    cd ..
    exit 1
fi
cd ..

# 7. 重新启动服务器
echo ""
echo "7. 重新启动服务器..."
bash start-game.sh

echo ""
echo "=========================================="
echo "完成！等待5秒后检查状态..."
echo "=========================================="
sleep 5

# 8. 检查状态
bash check-status.sh
