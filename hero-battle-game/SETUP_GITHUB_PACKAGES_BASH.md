# GitHub Packages 配置指南（Git Bash版本）

## 步骤1：创建GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 输入token名称，例如：`npm-packages-token`
4. 选择以下权限：
   - `read:packages` - 读取包
   - `write:packages` - 写入包
   - `delete:packages` - 删除包（可选）
5. 点击 "Generate token"
6. **重要**：复制生成的token，它只会显示一次

## 步骤2：设置环境变量

### 方法1：临时设置（当前会话）

在Git Bash中运行：

```bash
export GITHUB_TOKEN="your_token_here"
```

### 方法2：永久设置（推荐）

添加到 `~/.bashrc` 或 `~/.bash_profile`：

```bash
# 编辑配置文件
nano ~/.bashrc
# 或
nano ~/.bash_profile

# 添加以下行
export GITHUB_TOKEN="your_token_here"

# 保存后重新加载
source ~/.bashrc
# 或
source ~/.bash_profile
```

### 方法3：在Windows Git Bash中永久设置

在Git Bash中运行：

```bash
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

## 步骤3：验证配置

运行以下命令验证token是否设置成功：

```bash
echo $GITHUB_TOKEN
```

如果显示token，说明设置成功。

## 步骤4：使用GitHub Packages

### 发布包

项目根目录的 `.npmrc` 文件已配置好，会自动使用环境变量中的token。

**发布后端**：
```bash
cd hero-battle-game/backend
npm publish
```

**发布前端**：
```bash
cd hero-battle-game/frontend
npm publish
```

**或使用发布脚本**：
```bash
cd hero-battle-game
chmod +x publish.sh
./publish.sh
```

### 安装包

其他项目可以通过以下方式安装：

```bash
npm install @Chauncey0525/hero-battle-game-backend
npm install @Chauncey0525/hero-battle-game-frontend
```

需要配置 `.npmrc` 文件：

```
@Chauncey0525:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## 安全提示

⚠️ **重要**：
- 不要将token提交到Git仓库
- 使用环境变量而不是硬编码token
- 定期轮换token
- 如果token泄露，立即在GitHub上撤销它

## 故障排除

### 问题：npm无法认证

**解决方案**：
1. 确认环境变量已正确设置：`echo $GITHUB_TOKEN`
2. 确认token权限正确
3. 尝试重新设置环境变量
4. 重启Git Bash

### 问题：找不到包

**解决方案**：
1. 确认包名格式正确：`@Chauncey0525/package-name`
2. 确认包已发布到GitHub Packages
3. 确认你有读取权限

### 问题：发布失败

**解决方案**：
1. 确认token有 `write:packages` 权限
2. 确认 `package.json` 中的 `publishConfig` 配置正确
3. 确认包名符合GitHub Packages的命名规范

## 参考链接

- [GitHub Packages 文档](https://docs.github.com/en/packages)
- [npm配置文档](https://docs.npmjs.com/cli/v8/configuring-npm/npmrc)
- [创建Personal Access Token](https://github.com/settings/tokens)
