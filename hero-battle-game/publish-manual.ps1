# 手动发布脚本 - 需要先设置GITHUB_TOKEN环境变量

Write-Host "=== 发布到GitHub Packages ===" -ForegroundColor Cyan
Write-Host ""

# 检查环境变量
$token = [System.Environment]::GetEnvironmentVariable("GITHUB_TOKEN", "User")
if (-not $token) {
    Write-Host "错误: GITHUB_TOKEN 环境变量未设置!" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先设置环境变量:" -ForegroundColor Yellow
    Write-Host '  [System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "your_token_here", "User")' -ForegroundColor White
    Write-Host ""
    Write-Host "然后重启PowerShell并重新运行此脚本" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ GITHUB_TOKEN 已设置" -ForegroundColor Green
Write-Host ""

# 设置当前会话的环境变量
$env:GITHUB_TOKEN = $token

# 发布后端
Write-Host "正在发布后端包..." -ForegroundColor Cyan
Set-Location "backend"
try {
    npm publish
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 后端包发布成功!" -ForegroundColor Green
    } else {
        Write-Host "✗ 后端包发布失败" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
} catch {
    Write-Host "✗ 后端包发布失败: $_" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Set-Location ".."
Write-Host ""

# 发布前端
Write-Host "正在发布前端包..." -ForegroundColor Cyan
Set-Location "frontend"
try {
    npm publish
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 前端包发布成功!" -ForegroundColor Green
    } else {
        Write-Host "✗ 前端包发布失败" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
} catch {
    Write-Host "✗ 前端包发布失败: $_" -ForegroundColor Red
    Set-Location ".."
    exit 1
}
Set-Location ".."
Write-Host ""

Write-Host "=== 发布完成 ===" -ForegroundColor Green
Write-Host "查看已发布的包: https://github.com/Chauncey0525/myGit/packages" -ForegroundColor Cyan
