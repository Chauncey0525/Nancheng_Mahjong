# 发布前后端到GitHub Packages的脚本

Write-Host "开始发布到GitHub Packages..." -ForegroundColor Green

# 检查环境变量
if (-not $env:GITHUB_TOKEN) {
    Write-Host "错误: GITHUB_TOKEN 环境变量未设置!" -ForegroundColor Red
    Write-Host "请先运行: [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')" -ForegroundColor Yellow
    Write-Host "然后重启PowerShell" -ForegroundColor Yellow
    exit 1
}

Write-Host "GITHUB_TOKEN 已设置" -ForegroundColor Green

# 发布后端
Write-Host "`n发布后端包..." -ForegroundColor Cyan
Set-Location "backend"
try {
    npm publish
    Write-Host "后端包发布成功!" -ForegroundColor Green
} catch {
    Write-Host "后端包发布失败: $_" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Set-Location ".."

# 发布前端
Write-Host "`n发布前端包..." -ForegroundColor Cyan
Set-Location "frontend"
try {
    npm publish
    Write-Host "前端包发布成功!" -ForegroundColor Green
} catch {
    Write-Host "前端包发布失败: $_" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Set-Location ".."

Write-Host "`n所有包发布完成!" -ForegroundColor Green
Write-Host "查看已发布的包: https://github.com/Chauncey0525/myGit/packages" -ForegroundColor Cyan
