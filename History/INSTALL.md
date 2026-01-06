# Node.js 安装指南

## 问题
如果遇到 `npm : 无法将"npm"项识别为 cmdlet、函数、脚本文件或可运行程序的名称` 错误，说明系统未安装 Node.js。

## 解决方案

### 方法1：从官网安装 Node.js（推荐）

1. **访问 Node.js 官网**
   - 打开浏览器访问：https://nodejs.org/
   - 或直接下载：https://nodejs.org/zh-cn/download/

2. **选择版本**
   - 推荐下载 **LTS（长期支持版本）**，通常更稳定
   - 选择 Windows Installer (.msi) 64位版本

3. **安装步骤**
   - 运行下载的 .msi 安装程序
   - 按照安装向导提示操作
   - **重要**：确保勾选 "Add to PATH" 选项（通常默认已勾选）
   - 完成安装

4. **验证安装**
   - 关闭当前 PowerShell 窗口
   - 重新打开 PowerShell
   - 运行以下命令验证：
   ```powershell
   node --version
   npm --version
   ```

### 方法2：使用包管理器安装

#### 使用 Chocolatey（如果已安装）
```powershell
choco install nodejs
```

#### 使用 Winget（Windows 10/11）
```powershell
winget install OpenJS.NodeJS.LTS
```

### 方法3：使用 nvm-windows（推荐用于需要多版本管理的用户）

1. 下载 nvm-windows：https://github.com/coreybutler/nvm-windows/releases
2. 安装 nvm-windows
3. 在 PowerShell 中运行：
   ```powershell
   nvm install lts
   nvm use lts
   ```

## 安装后验证

安装完成后，**必须重新打开 PowerShell**，然后运行：

```powershell
node --version
npm --version
```

如果显示版本号，说明安装成功。

## 常见问题

### 问题1：安装后仍然无法识别命令
**解决方案**：
1. 关闭所有 PowerShell 窗口
2. 重新打开 PowerShell
3. 如果仍然不行，检查环境变量 PATH 是否包含 Node.js 安装路径

### 问题2：如何检查 PATH 环境变量
```powershell
$env:PATH -split ';' | Select-String -Pattern 'node'
```

### 问题3：手动添加 PATH（如果自动添加失败）
1. 右键"此电脑" → "属性" → "高级系统设置"
2. 点击"环境变量"
3. 在"系统变量"中找到 Path，点击"编辑"
4. 添加 Node.js 安装路径（通常是 `C:\Program Files\nodejs\`）
5. 确定并重启 PowerShell

## 安装完成后继续项目

安装 Node.js 后，在 History 目录下运行：

```powershell
cd History
npm install
npm run init-db
npm start
```
