# 将 Node.js 添加到系统 PATH 环境变量（永久配置）
# 需要管理员权限运行

$nodePath = "C:\Program Files\nodejs"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$nodePath*") {
    Write-Host "正在添加 Node.js 到用户 PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$nodePath", "User")
    Write-Host "✓ Node.js 已添加到 PATH" -ForegroundColor Green
    Write-Host ""
    Write-Host "注意：需要重新打开 PowerShell 或命令提示符才能生效" -ForegroundColor Cyan
} else {
    Write-Host "✓ Node.js 已经在 PATH 中" -ForegroundColor Green
}

# 显示当前 PATH 中的 Node.js 路径
Write-Host ""
Write-Host "当前用户 PATH 中的 Node.js 路径：" -ForegroundColor Yellow
$env:Path -split ';' | Where-Object { $_ -like '*node*' } | ForEach-Object { Write-Host "  $_" }
