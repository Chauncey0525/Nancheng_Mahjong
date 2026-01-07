# 最终版本的 commit 消息修复脚本
# 使用 git commit --amend 逐个修改最近的 commit

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "开始修复 commit 消息..."
Write-Host ""

# 修改最近的 commit
Write-Host "修改最近的 commit..."
git commit --amend -m "更新数据库和样式文件" --no-edit

# 现在需要修改更早的 commit，使用 rebase
Write-Host "`n准备使用交互式 rebase 修改更早的 commit"
Write-Host "请手动运行: git rebase -i HEAD~10"
Write-Host "然后在编辑器中："
Write-Host "  - 将 'pick b00d716' 改为 'reword b00d716'"
Write-Host "  - 将 'pick 27bf41d' 改为 'reword 27bf41d'"
Write-Host "  - 将 'pick 1f31ef6' 改为 'reword 1f31ef6'"
Write-Host "  - 将 'pick ad30aaf' 改为 'reword ad30aaf'"
Write-Host "  - 将 'pick 3138860' 改为 'reword 3138860'"
Write-Host "  - 将 'pick eafedb6' 改为 'reword eafedb6'"
Write-Host "  - 将 'pick c4746e1' 改为 'reword c4746e1'"
Write-Host "  - 将 'pick 91aff2a' 改为 'reword 91aff2a'"
Write-Host "  - 将 'pick e8ce43a' 改为 'reword e8ce43a'"
Write-Host ""
Write-Host "保存后，Git 会逐个提示你修改每个 commit 的消息"
