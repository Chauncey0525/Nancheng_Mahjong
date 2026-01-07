# 自动化 Git rebase 修改 commit 消息
# 设置编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 创建 rebase todo 文件
$rebaseTodo = @"
reword fc712a6 更新数据库和样式文件
reword b00d716 修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题
reword 27bf41d 添加金、辽、西夏皇帝数据，更新总数至261人
reword 1f31ef6 清理项目：移除不必要文件，合并文档，修复数据库查询错误
reword ad30aaf 创建 GitHub Actions 工作流：OSSF SLSA3 发布
reword 3138860 创建 GitHub Actions 工作流：NPM 发布
reword eafedb6 创建 GitHub Actions 工作流：Node.js CI
reword c4746e1 添加皇帝评分系统：数据库迁移、API接口、启动脚本和配置
reword 91aff2a 功能：将皇帝数据迁移到 SQLite 后端
reword e8ce43a 更新 README：添加新功能文档
"@

# 创建编辑器脚本
$editorScript = @'
# Git rebase 编辑器脚本
param($file)

$content = Get-Content $file -Raw -Encoding UTF8
$newContent = $content -replace '^pick fc712a6', 'reword fc712a6 更新数据库和样式文件' `
    -replace '^pick b00d716', 'reword b00d716 修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题' `
    -replace '^pick 27bf41d', 'reword 27bf41d 添加金、辽、西夏皇帝数据，更新总数至261人' `
    -replace '^pick 1f31ef6', 'reword 1f31ef6 清理项目：移除不必要文件，合并文档，修复数据库查询错误' `
    -replace '^pick ad30aaf', 'reword ad30aaf 创建 GitHub Actions 工作流：OSSF SLSA3 发布' `
    -replace '^pick 3138860', 'reword 3138860 创建 GitHub Actions 工作流：NPM 发布' `
    -replace '^pick eafedb6', 'reword eafedb6 创建 GitHub Actions 工作流：Node.js CI' `
    -replace '^pick c4746e1', 'reword c4746e1 添加皇帝评分系统：数据库迁移、API接口、启动脚本和配置' `
    -replace '^pick 91aff2a', 'reword 91aff2a 功能：将皇帝数据迁移到 SQLite 后端' `
    -replace '^pick e8ce43a', 'reword e8ce43a 更新 README：添加新功能文档'

Set-Content $file -Value $newContent -Encoding UTF8 -NoNewline
'@

Set-Content -Path "git_editor.ps1" -Value $editorScript -Encoding UTF8

Write-Host "已创建编辑器脚本"
Write-Host "现在运行: `$env:GIT_EDITOR='powershell -File git_editor.ps1'; git rebase -i HEAD~10"
