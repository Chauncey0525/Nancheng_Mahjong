@echo off
chcp 65001 >nul
title 历史英雄养成游戏启动器

echo ==========================================
echo   历史英雄养成游戏 - 启动器
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

echo 🚀 启动后端服务器...
start "后端服务器" cmd /k "cd backend && npm start"

REM 等待后端启动
timeout /t 3 /nobreak >nul

echo 🚀 启动前端开发服务器...
start "前端服务器" cmd /k "cd frontend && npm run dev"

REM 等待前端启动后打开浏览器
echo.
echo 等待前端服务器启动（约8秒）...
timeout /t 8 /nobreak >nul

REM 检测并打开浏览器（只打开一个）
echo 正在自动打开浏览器...
REM 先尝试5173端口，如果被占用Vite会自动使用5174
start "" "http://localhost:5173"

echo.
echo ==========================================
echo ✅ 启动完成！
echo.
echo 📱 前端地址: http://localhost:5173 或 http://localhost:5174
echo 🔧 后端API: http://localhost:3001
echo.
echo 💡 提示：
echo    - 两个新窗口已打开，分别运行前端和后端
echo    - 浏览器应该已自动打开，如果没有请手动访问上述地址
echo    - 关闭窗口即可停止对应的服务
echo ==========================================
echo.
echo 按任意键退出此窗口（服务器将继续运行）...
pause >nul
