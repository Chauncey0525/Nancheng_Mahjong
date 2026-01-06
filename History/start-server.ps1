# PowerShell 启动服务器脚本
# 自动配置 Node.js 路径并启动服务器

$nodePath = "C:\Program Files\nodejs"
if ($env:PATH -notlike "*$nodePath*") {
    $env:PATH += ";$nodePath"
}

Write-Host "正在启动服务器..." -ForegroundColor Cyan
Set-Location $PSScriptRoot

# 检查数据库文件
if (-not (Test-Path "emperors.db")) {
    Write-Host "警告：未找到数据库文件 emperors.db" -ForegroundColor Yellow
    Write-Host "请先运行: npm run init-db" -ForegroundColor Yellow
}

# 启动服务器
node server.js
