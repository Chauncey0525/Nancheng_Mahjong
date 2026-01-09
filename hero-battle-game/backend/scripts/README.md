# 数据库管理脚本

这些脚本用于管理游戏数据和玩家账户。

## ⚠️ 重要安全提示

**密码是使用 bcrypt 单向加密存储的，无法解密回明文。这是安全设计，保护用户密码不被泄露。**

## 可用脚本

### 1. 导入英雄数据

导入预设的历史名人英雄数据：

```bash
cd backend
npm run import-heroes
# 或
node scripts/importHeroes.js
```

**包含的英雄：**
- **5星英雄**：秦始皇、汉武帝、唐太宗、成吉思汗
- **4星英雄**：汉高祖、明太祖、康熙帝、白起、韩信、霍去病、岳飞、关羽
- **3星英雄**：诸葛亮、张良、张衡、祖冲之、李时珍
- **2星英雄**：项羽、吕布、花木兰、穆桂英
- **1星英雄**：荆轲、扁鹊

**英雄属性：**
- 每个英雄都有五行属性（金、木、水、火、土）
- 不同星级有不同的基础属性值
- 包含历史信息（朝代、庙号、谥号、年号、简介等）

### 2. 列出所有玩家

查看所有玩家信息（不显示密码）：

```bash
cd backend
node scripts/list-players.js
```

### 3. 验证密码

验证某个玩家的密码是否正确：

```bash
cd backend
node scripts/check-password.js <用户名> <要测试的密码>
```

示例：
```bash
node scripts/check-password.js zcx123 mypassword
```

### 4. 重置密码

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
