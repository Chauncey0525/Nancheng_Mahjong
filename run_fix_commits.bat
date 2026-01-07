@echo off
chcp 65001 >nul
echo 正在使用 Git Bash 修改 commit 消息...
echo.

REM 查找 Git Bash
set GIT_BASH=
if exist "D:\Git\bin\bash.exe" set GIT_BASH=D:\Git\bin\bash.exe
if exist "D:\Git\usr\bin\bash.exe" set GIT_BASH=D:\Git\usr\bin\bash.exe
if exist "C:\Program Files\Git\bin\bash.exe" set GIT_BASH=C:\Program Files\Git\bin\bash.exe
if exist "C:\Program Files (x86)\Git\bin\bash.exe" set GIT_BASH=C:\Program Files (x86)\Git\bin\bash.exe

if "%GIT_BASH%"=="" (
    echo 错误：未找到 Git Bash
    echo 请手动运行 fix_commits.sh 文件
    pause
    exit /b 1
)

echo 找到 Git Bash: %GIT_BASH%
echo 正在执行修复脚本...
echo.

"%GIT_BASH%" fix_commits.sh

echo.
echo 完成！
pause
