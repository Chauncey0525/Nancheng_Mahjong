# Git中文支持配置指南

## 问题

Git提交中文commit信息时出现乱码，例如：`浼樺寲鍓嶇UI鏍峰紡` 应该是 `优化前端UI样式`

## 快速配置（推荐）

在Git Bash中运行配置脚本：

```bash
bash setup-git-chinese.sh
```

## 手动配置

### 1. 配置Git编码

```bash
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
```

### 2. 设置环境变量（在Git Bash中）

在 `~/.bashrc` 或 `~/.bash_profile` 中添加：

```bash
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
```

或者每次使用Git Bash时运行：

```bash
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
```

## 修复之前的乱码commit

### 方法1：使用自动化脚本（推荐）

```bash
bash complete-fix-commits.sh
```

脚本会：
- 自动配置Git UTF-8
- 创建备份分支
- 引导你进行交互式rebase修复

### 方法2：手动修复

1. **找到需要修复的commit**：
   ```bash
   git log --oneline -20
   ```

2. **开始交互式rebase**：
   ```bash
   git rebase -i HEAD~N  # N是需要修复的commit数量
   ```

3. **在编辑器中**：
   - 将需要修改的commit的 `pick` 改为 `reword`
   - 保存并关闭

4. **输入正确的中文信息**：
   - 在打开的编辑器中输入正确的中文commit信息
   - 保存并关闭

5. **推送到远程**：
   ```bash
   git push origin main --force
   ```

⚠️ **注意**：force push会覆盖远程历史，请确保没有其他人在使用这个仓库。

## 确保以后提交都是中文

配置完成后，以后提交commit时：

```bash
git commit -m "你的中文commit信息"
```

commit信息会正确显示为中文，不会出现乱码。

## 验证配置

运行以下命令验证配置：

```bash
git config --global --get i18n.commitencoding
# 应该输出: utf-8

git config --global --get i18n.logoutputencoding
# 应该输出: utf-8

git config --global --get core.quotepath
# 应该输出: false
```
