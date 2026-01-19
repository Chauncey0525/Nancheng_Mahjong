# 图片资源说明

本目录需要包含以下图片资源，用于tabBar图标：

## TabBar图标（需要提供）

- `home.png` / `home-active.png` - 首页图标
- `simulation.png` / `simulation-active.png` - 模拟练习图标
- `replay.png` / `replay-active.png` - 复盘分析图标
- `knowledge.png` / `knowledge-active.png` - 知识库图标
- `profile.png` / `profile-active.png` - 个人中心图标

## 其他图片

- `default-avatar.png` - 默认头像（可选）

## 图标规格

- 尺寸：建议 81px × 81px
- 格式：PNG
- 颜色：普通状态使用灰色，激活状态使用主题色（#0f3460）

## 快速生成占位图标

### 方法一：使用Python脚本（需要Pillow库）

```bash
# 安装依赖
pip install Pillow

# 运行脚本
python generate-icons.py
```

脚本会在当前目录生成所有需要的图标文件。

### 方法二：使用在线工具

1. 访问 [IconFont](https://www.iconfont.cn/) 或 [Flaticon](https://www.flaticon.com/)
2. 搜索相关图标并下载PNG格式（81×81px）
3. 使用图片编辑工具调整颜色

### 方法三：暂时不使用图标

目前 `app.json` 已配置为只使用文字标签，不显示图标。这样可以先让项目运行起来，等图标准备好后再添加。

## 添加图标后的配置

图标文件准备好后，在 `app.json` 中恢复图标配置：

```json
"tabBar": {
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "首页",
      "iconPath": "images/home.png",
      "selectedIconPath": "images/home-active.png"
    }
  ]
}
```
