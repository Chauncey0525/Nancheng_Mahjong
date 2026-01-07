# 批量修复 Git commit 消息
# 设置编码
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Commit 消息映射
$commitMap = @{
    'e27695d4d721f25849404b328cbda8081646af2d' = '更新数据库和样式文件'
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

Write-Host "将使用 git filter-branch 来修改 commit 消息"
Write-Host "这需要一些时间..."
Write-Host ""

# 创建 filter-branch 脚本
$filterScript = @'
#!/bin/sh
case "$GIT_COMMIT" in
    e27695d4d721f25849404b328cbda8081646af2d)
        echo "更新数据库和样式文件"
        ;;
    b00d71606010b73994b5f3e1796a17d7ffed79b0)
        echo "修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题"
        ;;
    27bf41dbd2c426c412e831ded0ec9c9d06f52d18)
        echo "添加金、辽、西夏皇帝数据，更新总数至261人"
        ;;
    1f31ef63752ae60c8474eb0f1848b6ed2362fc5e)
        echo "清理项目：移除不必要文件，合并文档，修复数据库查询错误"
        ;;
    ad30aaf1339dac2b063ca07d47594dc086d5be6b)
        echo "创建 GitHub Actions 工作流：OSSF SLSA3 发布"
        ;;
    31388605582ed7310215d8b2dbdb21d54c8f3885)
        echo "创建 GitHub Actions 工作流：NPM 发布"
        ;;
    eafedb6e5f7ca44b3dfc4717fb30db35538d5350)
        echo "创建 GitHub Actions 工作流：Node.js CI"
        ;;
    c4746e175aad71e95e8afa26d9fd8400c3f3d575)
        echo "添加皇帝评分系统：数据库迁移、API接口、启动脚本和配置"
        ;;
    91aff2a672a21fd425e5a65eaa642a8e3b16b645)
        echo "功能：将皇帝数据迁移到 SQLite 后端"
        ;;
    e8ce43a54c3dfd1977aed4452114ca91c6aee6eb)
        echo "更新 README：添加新功能文档"
        ;;
    *)
        cat
        ;;
esac
'@

Set-Content -Path "filter_commits.sh" -Value $filterScript -Encoding UTF8 -NoNewline

Write-Host "已创建 filter-branch 脚本"
Write-Host "运行: bash filter_commits.sh 或 git filter-branch -f --msg-filter 'bash filter_commits.sh' HEAD~10..HEAD"
