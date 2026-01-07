# 修复 Git commit 消息的 PowerShell 脚本
# 使用 git filter-branch 来批量修改 commit 消息

# 设置编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Commit 消息映射（旧消息 -> 新消息）
$commitMap = @{
    '更新数据库和样式文件' = '更新数据库和样式文件'
    '修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题' = '修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题'
    'Add Jin, Liao, Xixia emperors and update total count to 261' = '添加金、辽、西夏皇帝数据，更新总数至261人'
    'Clean up project: remove unnecessary files, merge documentation, fix database query errors' = '清理项目：移除不必要文件，合并文档，修复数据库查询错误'
    'Create generator-generic-ossf-slsa3-publish.yml' = '创建 GitHub Actions 工作流：OSSF SLSA3 发布'
    'Create npm-publish.yml' = '创建 GitHub Actions 工作流：NPM 发布'
    'Create node.js.yml' = '创建 GitHub Actions 工作流：Node.js CI'
    '添加皇帝评分系统：数据库迁移、API接口、启动脚本和配置' = '添加皇帝评分系统：数据库迁移、API接口、启动脚本和配置'
    'feat: migrate emperor data to sqlite backend' = '功能：将皇帝数据迁移到 SQLite 后端'
    'Update README with new features documentation' = '更新 README：添加新功能文档'
}

Write-Host "开始修改 commit 消息..."
Write-Host "注意：这将重写 Git 历史"

# 获取所有 commit
$commits = git log --format="%H|%s" -20

foreach ($commit in $commits) {
    $parts = $commit -split '\|', 2
    if ($parts.Length -eq 2) {
        $hash = $parts[0]
        $oldMessage = $parts[1]
        
        # 检查是否需要修改
        $newMessage = $commitMap[$oldMessage]
        if (-not $newMessage) {
            # 检查是否是乱码（包含特殊字符）
            if ($oldMessage -match '[^\x00-\x7F]' -and $oldMessage.Length -lt 100) {
                # 可能是乱码，尝试从映射中查找
                foreach ($key in $commitMap.Keys) {
                    if ($oldMessage -like "*$key*" -or $key -like "*$oldMessage*") {
                        $newMessage = $commitMap[$key]
                        break
                    }
                }
            }
        }
        
        if ($newMessage -and $newMessage -ne $oldMessage) {
            Write-Host "修改 commit $hash : $oldMessage -> $newMessage"
            # 使用 git commit --amend 需要先 checkout
            # 这里我们使用 git filter-branch 或 git rebase
        }
    }
}

Write-Host "`n使用交互式 rebase 来修改 commit 消息"
Write-Host "请运行: git rebase -i HEAD~10"
