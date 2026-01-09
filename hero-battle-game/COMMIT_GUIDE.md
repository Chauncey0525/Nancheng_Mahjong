# Git提交中文Commit指南

## 问题

在PowerShell中直接使用 `git commit -m "中文"` 可能会导致乱码。

## 解决方案

### 方法1：使用Git Bash（推荐）

在Git Bash中运行：

```bash
# 先配置Git（只需一次）
bash setup-git-chinese.sh

# 然后正常提交
git add -A
git commit -m "你的中文commit信息"
git push origin main
```

### 方法2：使用commit消息文件

在PowerShell中：

```bash
# 创建commit消息文件
echo "你的中文commit信息" > commit-msg.txt

# 使用文件提交
git add -A
git commit -F commit-msg.txt
git push origin main

# 删除临时文件
del commit-msg.txt
```

### 方法3：使用批处理脚本

```bash
commit-chinese.bat "你的中文commit信息"
```

## 确保Git配置正确

运行以下命令检查：

```bash
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
```

## 修复之前的乱码commit

运行修复脚本：

```bash
bash complete-fix-commits.sh
```

脚本会引导你修复所有乱码的commit。
