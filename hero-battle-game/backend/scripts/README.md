# 数据库管理脚本

这些脚本用于管理玩家账户和密码。

## ⚠️ 重要安全提示

**密码是使用 bcrypt 单向加密存储的，无法解密回明文。这是安全设计，保护用户密码不被泄露。**

## 可用脚本

### 1. 列出所有玩家

查看所有玩家信息（不显示密码）：

```bash
cd backend
node scripts/list-players.js
```

### 2. 验证密码

验证某个玩家的密码是否正确：

```bash
cd backend
node scripts/check-password.js <用户名> <要测试的密码>
```

示例：
```bash
node scripts/check-password.js zcx123 mypassword
```

### 3. 重置密码

重置某个玩家的密码：

```bash
cd backend
node scripts/reset-password.js <用户名> <新密码>
```

示例：
```bash
node scripts/reset-password.js zcx123 newpassword123
```

## 为什么不能查看明文密码？

1. **安全设计**：密码使用 bcrypt 单向哈希加密，无法逆向解密
2. **保护用户**：即使数据库泄露，攻击者也无法获取用户密码
3. **最佳实践**：这是现代应用的标准安全做法

## 如何验证密码？

使用 `check-password.js` 脚本可以验证密码是否正确，但无法显示原始密码。

## 如何重置密码？

如果玩家忘记密码，使用 `reset-password.js` 脚本重置为新密码。
