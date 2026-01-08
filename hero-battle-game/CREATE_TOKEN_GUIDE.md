# 创建GitHub Token用于发布包

## 方法1：使用Classic Token（推荐）

1. 访问：https://github.com/settings/tokens/new
2. 选择 **"Generate new token (classic)"**
3. 填写信息：
   - Note: `npm-packages-token`
   - Expiration: 选择合适的时间（建议90天或No expiration）
4. **勾选以下权限**：
   - ✅ `read:packages` - 读取包
   - ✅ `write:packages` - 写入包
   - ✅ `delete:packages` - 删除包（可选）
5. 点击 "Generate token"
6. **复制生成的token**（只显示一次！）

## 方法2：使用Fine-grained Token

如果使用Fine-grained token：

1. 访问：https://github.com/settings/tokens/new
2. 选择 **"Generate new token (fine-grained)"**
3. 填写信息：
   - Token name: `npm-packages-token`
   - Expiration: 选择合适的时间
   - Repository access: 选择 `Only select repositories` 或 `All repositories`
4. 在权限设置中，找到 **"Repository permissions"** 或 **"Package permissions"** 部分
5. 勾选：
   - ✅ `Contents: Read` (如果需要)
   - ✅ `Metadata: Read` (如果需要)
   - 在 **"Package permissions"** 中：
     - ✅ `Read packages`
     - ✅ `Write packages`
6. 点击 "Generate token"
7. **复制生成的token**

## 设置环境变量

在PowerShell中运行：

```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "你复制的token", "User")
```

**重要**：设置后需要**重启PowerShell**才能生效。

## 验证设置

重启PowerShell后，运行：

```powershell
echo $env:GITHUB_TOKEN
```

如果显示token，说明设置成功。

## 然后发布

```powershell
cd D:\Github\myGit\hero-battle-game
.\quick-publish.ps1
```
