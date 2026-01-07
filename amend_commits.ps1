# 修改 Git commit 消息的脚本
# 使用 git commit --amend 和 git rebase 来修改

# 设置编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "开始修改 commit 消息..."
Write-Host ""

# 获取最近的 commit
$recentCommits = git log --format="%H|%s" -10

# Commit 消息映射
$commitMessages = @{
    'fc712a65b3acc67cc9dc5afda178f92cf5372571' = '更新数据库和样式文件'
    'b00d71606010b73994b5f3e1796a17d7ffed79b0' = '修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题'
    '27bf41dbd2c426c412e831ded0ec9c9d06f52d18' = '添加金、辽、西夏皇帝数据，更新总数至261人'
    '1f31ef63752ae60c8474eb0f1848b6ed2362fc5e' = '清理项目：移除不必要文件，合并文档，修复数据库查询错误'
    'ad30aaf1339dac2b063ca07d47594dc086d5be6b' = '创建 GitHub Actions 工作流：OSSF SLSA3 发布'
    '31388605582ed7310215d8b2dbdb21d54c8f3885' = '创建 GitHub Actions 工作流：NPM 发布'
    'eafedb6e5f7ca44b3dfc4717fb30db35538d5350' = '创建 GitHub Actions 工作流：Node.js CI'
    'c4746e175aad71e95e8afa26d9fd8400c3f3d575' = '添加皇帝评分系统：数据库迁移、API接口、启动脚本和配置'
    '91aff2a672a21fd425e5a65eaa642a8e3b16b645' = '功能：将皇帝数据迁移到 SQLite 后端'
    'e8ce43a54c3dfd1977aed4452114ca91c6aee6eb' = '更新 README：添加新功能文档'
}

Write-Host "将使用交互式 rebase 来修改这些 commit："
foreach ($commit in $recentCommits) {
    $parts = $commit -split '\|', 2
    if ($parts.Length -eq 2) {
        $hash = $parts[0].Substring(0, 7)
        $oldMsg = $parts[1]
        $newMsg = $commitMessages[$parts[0]]
        if ($newMsg) {
            Write-Host "  $hash : $oldMsg -> $newMsg"
        }
    }
}

Write-Host "`n请运行以下命令来修改："
Write-Host "git rebase -i HEAD~10"
Write-Host "然后在编辑器中，将需要修改的 commit 前面的 'pick' 改为 'reword'"
