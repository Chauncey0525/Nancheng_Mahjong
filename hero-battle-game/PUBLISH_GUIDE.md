# 发布到 GitHub Packages 指南

## 前提条件

1. 已设置 `GITHUB_TOKEN` 环境变量
2. 已配置 `.npmrc` 文件（项目根目录）

## 发布步骤

### 1. 设置环境变量

在PowerShell中设置GitHub Token：

```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "your_token_here", "User")
```

设置后需要**重启PowerShell**才能生效。

验证设置：

```powershell
echo $env:GITHUB_TOKEN
```

### 2. 发布后端包

```powershell
cd hero-battle-game\backend
npm publish
```

### 3. 发布前端包

```powershell
cd hero-battle-game\frontend
npm publish
```

## 注意事项

⚠️ **重要提示**：

1. **包名格式**：GitHub Packages要求包名格式为 `@username/package-name`
   - 后端：`@Chauncey0525/hero-battle-game-backend`
   - 前端：`@Chauncey0525/hero-battle-game-frontend`

2. **版本号**：每次发布需要更新版本号
   ```json
   "version": "1.0.1"  // 从1.0.0升级到1.0.1
   ```

3. **private字段**：如果 `package.json` 中有 `"private": true`，需要删除或设置为 `false` 才能发布

4. **权限要求**：GitHub Token需要以下权限：
   - `read:packages`
   - `write:packages`
   - `delete:packages`（可选）

## 安装已发布的包

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

## 更新版本

发布新版本前，更新 `package.json` 中的版本号：

```json
{
  "version": "1.0.1"  // 使用语义化版本号
}
```

然后发布：

```bash
npm publish
```

## 查看已发布的包

访问：`https://github.com/Chauncey0525/myGit/packages`

## 故障排除

### 错误：401 Unauthorized

- 检查 `GITHUB_TOKEN` 环境变量是否设置
- 确认token权限正确
- 重启PowerShell后重试

### 错误：403 Forbidden

- 确认包名格式正确：`@Chauncey0525/package-name`
- 检查token是否有 `write:packages` 权限

### 错误：包已存在

- 更新版本号后重新发布
- 或使用 `npm publish --force`（不推荐）
