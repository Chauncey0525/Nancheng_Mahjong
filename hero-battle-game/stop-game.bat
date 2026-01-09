@echo off
chcp 65001 >nul
title 停止游戏服务器

echo ==========================================
echo   停止游戏服务器
echo ==========================================
echo.

REM 停止占用端口的进程
echo 正在停止后端服务器（端口3001）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo 正在停止前端服务器（端口5173）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ==========================================
echo ✅ 停止完成！
echo ==========================================
echo.
pause
