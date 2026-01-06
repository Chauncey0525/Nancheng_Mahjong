@echo off
chcp 65001 >nul
echo 正在启动服务器...
cd /d "%~dp0"
set "PATH=%PATH%;C:\Program Files\nodejs"
node server.js
pause
