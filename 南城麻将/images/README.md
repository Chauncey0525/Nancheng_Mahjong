# TabBar 图标说明

本目录包含微信小程序TabBar所需的图标文件。

## 图标文件

1. **算分页面图标**
   - `calculator.png` - 未选中状态的图标（灰色）
   - `calculator-active.png` - 选中状态的图标（蓝色）

2. **历史页面图标**
   - `history.png` - 未选中状态的图标（灰色）
   - `history-active.png` - 选中状态的图标（蓝色）

## 图标规格

- **格式**: PNG（支持透明背景）
- **尺寸**: 81px × 81px
- **颜色**:
  - 未选中: 灰色 (#7A7E83)
  - 选中: 蓝色 (#4A90E2)

## 重新生成图标

如果需要重新生成图标，可以运行：

```bash
cd images
python generate_icons.py
```

**要求**：
- Python 3.x
- Pillow 库：`pip install Pillow`

**图标设计**：
- 算分图标：计算器样式，带显示屏和按钮网格
- 历史图标：时钟样式，带时针和分针
