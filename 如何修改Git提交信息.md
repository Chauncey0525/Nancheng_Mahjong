# 如何修改 Git 提交信息

由于 Windows PowerShell 的编码问题，建议使用以下方法手动修改 commit 消息：

## 方法一：使用 Git Bash（推荐）

1. 打开 Git Bash（不是 PowerShell）

2. 设置编码：
```bash
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
```

3. 使用交互式 rebase 修改最近的 10 个 commit：
```bash
git rebase -i HEAD~10
```

4. 在编辑器中，将需要修改的 commit 前面的 `pick` 改为 `reword`（或简写 `r`）：
```
reword e27695d 更新数据库和样式文件
reword b00d716 修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题
reword 27bf41d 添加金、辽、西夏皇帝数据，更新总数至261人
reword 1f31ef6 清理项目：移除不必要文件，合并文档，修复数据库查询错误
reword ad30aaf 创建 GitHub Actions 工作流：OSSF SLSA3 发布
reword 3138860 创建 GitHub Actions 工作流：NPM 发布
reword eafedb6 创建 GitHub Actions 工作流：Node.js CI
reword c4746e1 添加皇帝评分系统：数据库迁移、API接口、启动脚本和配置
reword 91aff2a 功能：将皇帝数据迁移到 SQLite 后端
reword e8ce43a 更新 README：添加新功能文档
```

5. 保存并关闭编辑器，Git 会逐个提示你修改每个 commit 的消息，输入正确的中文消息即可。

6. 修改完成后，强制推送到远程：
```bash
git push --force origin main
```

## 方法二：使用 Git GUI 工具

可以使用 SourceTree、GitKraken 等 GUI 工具，它们通常能更好地处理中文编码。

## 注意事项

- 修改 commit 历史会改变 commit hash，如果已经推送到远程，需要使用 `--force` 推送
- 如果其他人也在使用这个仓库，需要通知他们重新同步
- 建议在修改前先备份或创建新分支

## 需要修改的 Commit 列表

| Hash | 当前消息 | 新消息 |
|------|---------|--------|
| e27695d | 更新数据库和样式文件 | 更新数据库和样式文件 |
| b00d716 | 修复点击事件和DOM元素访问错误 | 修复点击事件和DOM元素访问错误：添加事件监听器安全检查，修复null元素访问问题 |
| 27bf41d | Add Jin, Liao, Xixia emperors... | 添加金、辽、西夏皇帝数据，更新总数至261人 |
| 1f31ef6 | Clean up project... | 清理项目：移除不必要文件，合并文档，修复数据库查询错误 |
| ad30aaf | Create generator-generic-ossf-slsa3-publish.yml | 创建 GitHub Actions 工作流：OSSF SLSA3 发布 |
| 3138860 | Create npm-publish.yml | 创建 GitHub Actions 工作流：NPM 发布 |
| eafedb6 | Create node.js.yml | 创建 GitHub Actions 工作流：Node.js CI |
| c4746e1 | 添加皇帝评分系统... | 添加皇帝评分系统：数据库迁移、API接口、启动脚本和配置 |
| 91aff2a | feat: migrate emperor data... | 功能：将皇帝数据迁移到 SQLite 后端 |
| e8ce43a | Update README... | 更新 README：添加新功能文档 |
