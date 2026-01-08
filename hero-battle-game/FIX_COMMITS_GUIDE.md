# 修复乱码Commit信息指南

## 需要修复的Commit

以下commit信息显示为乱码，需要修复：

1. `5db7745` - 应该是：**添加Git中文支持配置**
2. `9ef4d92` - 应该是：**添加历史英雄养成游戏项目**
3. `1b0ec52` - 应该是：**删除CBDB相关文件**

## 方法1：使用交互式Rebase（推荐）

在Git Bash中运行：

```bash
# 启动交互式rebase，修改最近3个commit
git rebase -i HEAD~3
```

在打开的编辑器中：
1. 将需要修改的commit前的 `pick` 改为 `reword`（或简写 `r`）
2. 保存并关闭编辑器
3. 对每个标记为 `reword` 的commit，Git会打开编辑器让你修改commit信息
4. 依次修改每个commit信息：
   - 第一个：`添加Git中文支持配置`
   - 第二个：`添加历史英雄养成游戏项目`
   - 第三个：`删除CBDB相关文件`

完成后推送到远程：

```bash
git push origin main --force
```

⚠️ **注意**：force push会覆盖远程历史，如果多人协作需要谨慎使用。

## 方法2：逐个修改（简单但需要多次force push）

### 修改最近一次commit

```bash
git commit --amend -m "添加Git中文支持配置

- 创建Git Bash中文支持配置脚本
- 添加详细的中文支持配置指南
- 确保以后commit信息正确显示中文"

git push origin main --force
```

### 修改倒数第二个commit

```bash
# 使用交互式rebase
git rebase -i HEAD~2

# 在编辑器中将要修改的commit前的pick改为reword
# 保存后修改commit信息为：添加历史英雄养成游戏项目

git push origin main --force
```

### 修改倒数第三个commit

```bash
# 使用交互式rebase
git rebase -i HEAD~3

# 在编辑器中将要修改的commit前的pick改为reword
# 保存后修改commit信息为：删除CBDB相关文件

git push origin main --force
```

## 方法3：使用脚本（自动化）

运行修复脚本：

```bash
chmod +x fix-all-commits.sh
./fix-all-commits.sh
```

## 正确的Commit信息

### Commit 1: 添加Git中文支持配置
```
添加Git中文支持配置

- 创建Git Bash中文支持配置脚本
- 添加详细的中文支持配置指南
- 确保以后commit信息正确显示中文
```

### Commit 2: 添加历史英雄养成游戏项目
```
添加历史英雄养成游戏项目

- 创建完整的游戏框架
- 包含前后端代码
- 实现英雄系统、战斗系统、玩家系统、抽卡系统
- 配置GitHub Packages发布
```

### Commit 3: 删除CBDB相关文件
```
删除CBDB相关文件
```

## 验证修复

修复后，查看commit历史：

```bash
git log --oneline -5
```

应该看到正确的中文commit信息。

## 注意事项

1. **备份**：修改commit历史前，建议先备份或创建新分支
2. **协作**：如果多人协作，修改历史前需要通知团队成员
3. **Force Push**：修改已推送的commit必须使用 `--force`，请谨慎使用
4. **配置**：修复后，确保已配置Git中文支持，避免以后再次出现乱码

## 配置Git中文支持（避免以后乱码）

```bash
# 运行配置脚本
./setup-git-chinese.sh

# 或手动配置
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
```
