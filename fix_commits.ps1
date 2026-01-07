# 修复 Git commit 消息的脚本
# 使用 git rebase 来修改 commit 消息

# 设置编码
$env:LESSCHARSET = 'utf-8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 修改最近的 commit 消息映射
$commitMessages = @{
    '8616823' = '更新数据库和样式文件'
    'b00d716' = '修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题'
    '27bf41d' = '添加金、辽、西夏皇帝数据，更新总数至261人'
    '1f31ef6' = '清理项目：移除不必要文件，合并文档，修复数据库查询错误'
    'ad30aaf' = '创建 GitHub Actions 工作流：OSSF SLSA3 发布'
    '3138860' = '创建 GitHub Actions 工作流：NPM 发布'
    'eafedb6' = '创建 GitHub Actions 工作流：Node.js CI'
    'c4746e1' = '添加皇帝评分系统：数据库迁移、API接口、启动脚本和配置'
    '91aff2a' = '功能：将皇帝数据迁移到 SQLite 后端'
    'e8ce43a' = '更新 README：添加新功能文档'
}

Write-Host "准备修改 commit 消息..."
Write-Host "注意：这将重写 Git 历史，如果已经推送到远程，需要使用 force push"
