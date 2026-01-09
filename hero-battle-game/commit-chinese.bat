@echo off
chcp 65001 >nul
REM Git Bash提交脚本 - 确保中文commit信息正确
REM 使用方法: commit-chinese.bat "你的中文commit信息"

if "%1"=="" (
    echo 使用方法: commit-chinese.bat "你的中文commit信息"
    exit /b 1
)

REM 使用Git Bash来提交，确保编码正确
bash -c "git add -A && git commit -m '%1' && git push origin main"
