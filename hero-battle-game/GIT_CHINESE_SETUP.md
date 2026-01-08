# Git中文支持配置指南（Git Bash版本）

## 问题

Git提交中文commit信息时出现乱码，例如：`娣诲姞鍘嗗彶鑻遍泟鍏绘垚娓告垙椤圭洰`

## 快速配置（推荐）

在Git Bash中运行配置脚本：

```bash
cd hero-battle-game
chmod +x setup-git-chinese.sh
./setup-git-chinese.sh
```

## 手动配置步骤

### 1. 配置Git编码

在Git Bash中运行：

```bash
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
```

### 2. 设置环境变量

**临时设置（当前会话）**：
```bash
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
```

**永久设置（添加到 ~/.bashrc）**：
```bash
echo '' >> ~/.bashrc
echo '# Git中文支持' >> ~/.bashrc
echo 'export LANG=zh_CN.UTF-8' >> ~/.bashrc
echo 'export LC_ALL=zh_CN.UTF-8' >> ~/.bashrc
source ~/.bashrc
```

### 3. 验证配置

```bash
# 查看Git配置
git config --global --get i18n.commitencoding
git config --global --get i18n.logoutputencoding
git config --global --get core.quotepath

# 查看环境变量
echo $LANG
echo $LC_ALL
```

### 4. 测试提交

```bash
# 创建一个测试文件
echo "test" > test.txt
git add test.txt
git commit -m "测试中文commit信息"
git log --oneline -1
```

如果显示正确的中文，说明配置成功。

## 修改已提交的乱码commit

如果已经提交了乱码的commit，可以修改：

```bash
# 修改最近一次commit
git commit --amend -m "正确的中文commit信息"

# 如果已经推送到远程，需要强制推送
git push origin main --force
```

⚠️ **注意**：强制推送会覆盖远程历史，如果多人协作需要谨慎使用。

## Windows Git Bash特殊设置

1. **设置Git Bash编码**：
   - 右键Git Bash图标 -> 属性 -> 选项
   - 取消勾选 "Use legacy console"
   - 在字体设置中选择支持中文的字体（如：Consolas、Microsoft YaHei Mono）

2. **检查Windows区域设置**：
   - 控制面板 -> 区域 -> 管理 -> 更改系统区域设置
   - 确保设置为"中文(简体，中国)"或支持UTF-8的区域

## 常见问题

### Q: 配置后仍然显示乱码？

A: 
1. 确保重新打开了Git Bash
2. 检查环境变量：`echo $LANG`
3. 尝试手动设置：`export LANG=zh_CN.UTF-8`

### Q: commit信息正确但log显示乱码？

A: 检查 `i18n.logoutputencoding` 配置：
```bash
git config --global i18n.logoutputencoding utf-8
```

### Q: 文件名中文显示乱码？

A: 检查 `core.quotepath` 配置：
```bash
git config --global core.quotepath false
```

## 验证所有配置

运行以下命令检查所有配置：

```bash
git config --global --list | grep -E "(i18n|core.quotepath)"
echo "LANG=$LANG"
echo "LC_ALL=$LC_ALL"
```

## 提交规范

配置完成后，以后提交时直接使用中文：

```bash
git commit -m "添加新功能"
git commit -m "修复bug"
git commit -m "更新文档"
```

commit信息会正确显示为中文。
