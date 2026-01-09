@echo off
chcp 65001 >nul
title 历史英雄养成游戏启动器（后台）

echo ==========================================
echo   历史英雄养成游戏 - 启动器（后台）
echo ==========================================
echo.

REM 检查Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js版本:
node -v
echo.

REM 检查npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到npm
    pause
    exit /b 1
)

echo ✅ npm版本:
npm -v
echo.

REM 检查依赖
if not exist "backend\node_modules" (
    echo 📦 后端依赖未安装，正在安装...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
    cd ..
    echo.
)

if not exist "frontend\node_modules" (
    echo 📦 前端依赖未安装，正在安装...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
    cd ..
    echo.
)

REM 创建日志目录
if not exist "logs" mkdir logs

echo 🚀 启动后端服务器（后台运行）...
cd backend
start /B npm start > ..\logs\backend.log 2>&1
cd ..

REM 等待后端启动（缩短到1秒）
echo 等待后端启动...
timeout /t 1 /nobreak >nul

echo 🚀 启动前端开发服务器（后台运行）...
cd frontend
start /B npm run dev > ..\logs\frontend.log 2>&1
cd ..

REM 等待前端启动（缩短到3秒）
echo.
echo 等待前端服务器启动...
timeout /t 3 /nobreak >nul

REM 自动打开浏览器
echo 正在自动打开浏览器...
start "" "http://localhost:5173"

echo.
echo ==========================================
echo ✅ 启动完成！
echo.
echo 📱 前端地址: http://localhost:5173
echo 🔧 后端API: http://localhost:3001
echo.
echo 💡 提示：
echo    - 服务器在后台运行，不会弹出窗口
echo    - 日志文件：logs\backend.log 和 logs\frontend.log
echo    - 停止服务：运行 stop-game.bat
echo ==========================================
echo.
echo 按任意键退出此窗口（服务器将继续运行）...
pause >nul
