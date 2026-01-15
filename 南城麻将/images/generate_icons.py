#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成微信小程序 TabBar 图标
需要安装 Pillow: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 图标尺寸
SIZE = 81

# 颜色定义
COLOR_UNSELECTED = (122, 126, 131)  # #7A7E83 灰色
COLOR_SELECTED = (74, 144, 226)      # #4A90E2 蓝色
COLOR_BG = (255, 255, 255, 0)       # 透明背景

def create_calculator_icon(color, output_path):
    """创建计算器图标"""
    img = Image.new('RGBA', (SIZE, SIZE), COLOR_BG)
    draw = ImageDraw.Draw(img)
    
    # 绘制计算器主体（圆角矩形）
    margin = 8
    draw.rounded_rectangle(
        [margin, margin, SIZE - margin, SIZE - margin],
        radius=6,
        fill=color,
        outline=None
    )
    
    # 绘制显示屏
    screen_margin = 12
    screen_height = 16
    draw.rounded_rectangle(
        [screen_margin, screen_margin, SIZE - screen_margin, screen_margin + screen_height],
        radius=3,
        fill=(255, 255, 255, 200),
        outline=None
    )
    
    # 绘制按钮（4x4网格）
    button_size = 8
    button_spacing = 4
    start_x = screen_margin + 4
    start_y = screen_margin + screen_height + 8
    
    for row in range(4):
        for col in range(4):
            x = start_x + col * (button_size + button_spacing)
            y = start_y + row * (button_size + button_spacing)
            draw.rounded_rectangle(
                [x, y, x + button_size, y + button_size],
                radius=2,
                fill=(255, 255, 255, 180),
                outline=None
            )
    
    img.save(output_path, 'PNG')
    print(f"已创建: {output_path}")

def create_history_icon(color, output_path):
    """创建历史记录图标"""
    img = Image.new('RGBA', (SIZE, SIZE), COLOR_BG)
    draw = ImageDraw.Draw(img)
    
    # 绘制时钟外圈
    center = SIZE // 2
    radius = 28
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        fill=None,
        outline=color,
        width=4
    )
    
    # 绘制时钟内圈
    inner_radius = 20
    draw.ellipse(
        [center - inner_radius, center - inner_radius, center + inner_radius, center + inner_radius],
        fill=color,
        outline=None
    )
    
    # 绘制时针（指向3点）
    hour_length = 12
    hour_end_x = center + hour_length
    hour_end_y = center
    draw.line([center, center, hour_end_x, hour_end_y], fill=(255, 255, 255), width=3)
    
    # 绘制分针（指向12点）
    minute_length = 16
    minute_end_x = center
    minute_end_y = center - minute_length
    draw.line([center, center, minute_end_x, minute_end_y], fill=(255, 255, 255), width=2)
    
    # 绘制中心点
    draw.ellipse(
        [center - 3, center - 3, center + 3, center + 3],
        fill=(255, 255, 255),
        outline=None
    )
    
    img.save(output_path, 'PNG')
    print(f"已创建: {output_path}")

def main():
    """主函数"""
    # 确保输出目录存在
    output_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print("开始生成图标...")
    
    # 生成计算器图标（未选中 - 灰色）
    create_calculator_icon(
        COLOR_UNSELECTED,
        os.path.join(output_dir, 'calculator.png')
    )
    
    # 生成计算器图标（选中 - 蓝色）
    create_calculator_icon(
        COLOR_SELECTED,
        os.path.join(output_dir, 'calculator-active.png')
    )
    
    # 生成历史图标（未选中 - 灰色）
    create_history_icon(
        COLOR_UNSELECTED,
        os.path.join(output_dir, 'history.png')
    )
    
    # 生成历史图标（选中 - 蓝色）
    create_history_icon(
        COLOR_SELECTED,
        os.path.join(output_dir, 'history-active.png')
    )
    
    print("\n所有图标生成完成！")
    print(f"图标保存在: {output_dir}")

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print("错误: 需要安装 Pillow 库")
        print("请运行: pip install Pillow")
    except Exception as e:
        print(f"生成图标时出错: {e}")
