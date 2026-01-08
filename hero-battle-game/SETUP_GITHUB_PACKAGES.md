# GitHub Packages 配置指南

本指南说明如何配置项目使用GitHub Packages。

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

### Windows PowerShell（当前会话）

```powershell
$env:GITHUB_TOKEN="your_token_here"
```

### Windows PowerShell（永久设置 - 用户级别）

```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "your_token_here", "User")
```

设置后需要重启PowerShell才能生效。

### Windows CMD（当前会话）

```cmd
set GITHUB_TOKEN=your_token_here
```

### Windows CMD（永久设置 - 用户级别）

```cmd
setx GITHUB_TOKEN "your_token_here"
```

### Linux/Mac

```bash
export GITHUB_TOKEN="your_token_here"
```

永久设置（添加到 `~/.bashrc` 或 `~/.zshrc`）：

```bash
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

## 步骤3：验证配置

运行以下命令验证token是否设置成功：

```powershell
# Windows PowerShell
echo $env:GITHUB_TOKEN

# Windows CMD
echo %GITHUB_TOKEN%

# Linux/Mac
echo $GITHUB_TOKEN
```

## 步骤4：使用GitHub Packages

### 安装包

项目根目录的 `.npmrc` 文件已配置好，会自动使用环境变量中的token。

安装时，npm会自动从GitHub Packages获取 `@Chauncey0525` 作用域下的包。

### 发布包

如果要在项目中发布包到GitHub Packages，需要在 `package.json` 中添加：

```json
{
  "name": "@Chauncey0525/hero-battle-game",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

然后发布：

```bash
npm publish
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
1. 确认环境变量已正确设置
2. 确认token权限正确
3. 尝试重新设置环境变量
4. 重启终端/PowerShell

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
