# 快速发布脚本
# 使用方法: 先设置GITHUB_TOKEN环境变量，然后运行此脚本

# 从用户环境变量加载token
$token = [System.Environment]::GetEnvironmentVariable("GITHUB_TOKEN", "User")
if ($token) {
    $env:GITHUB_TOKEN = $token
    Write-Host "Token loaded" -ForegroundColor Green
} else {
    Write-Host "Error: GITHUB_TOKEN not set. Please set it first:" -ForegroundColor Red
    Write-Host '[System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "your_token", "User")' -ForegroundColor Yellow
    exit 1
}

# 发布后端
Write-Host "Publishing backend..." -ForegroundColor Cyan
Set-Location backend
npm publish
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend publish failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# 发布前端
Write-Host "Publishing frontend..." -ForegroundColor Cyan
Set-Location frontend
npm publish
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend publish failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "All packages published successfully!" -ForegroundColor Green
