#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成TabBar占位图标
使用PIL库创建简单的图标文件
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("需要安装PIL库: pip install Pillow")
    exit(1)

# 图标配置
ICON_SIZE = 81
ICON_CONFIG = [
    {
        "name": "home",
        "text": "🏠",
        "normal_color": (122, 126, 131),  # #7A7E83
        "active_color": (15, 52, 96)      # #0f3460
    },
    {
        "name": "simulation",
        "text": "🎮",
        "normal_color": (122, 126, 131),
        "active_color": (15, 52, 96)
    },
    {
        "name": "replay",
        "text": "📊",
        "normal_color": (122, 126, 131),
        "active_color": (15, 52, 96)
    },
    {
        "name": "knowledge",
        "text": "📚",
        "normal_color": (122, 126, 131),
        "active_color": (15, 52, 96)
    },
    {
        "name": "profile",
        "text": "👤",
        "normal_color": (122, 126, 131),
        "active_color": (15, 52, 96)
    }
]

def create_icon(name, text, color, output_path):
    """创建图标"""
    # 创建透明背景
    img = Image.new('RGBA', (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制圆形背景
    margin = 10
    draw.ellipse(
        [margin, margin, ICON_SIZE - margin, ICON_SIZE - margin],
        fill=color
    )
    
    # 尝试使用系统字体显示emoji（可能不支持）
    # 如果emoji显示不出来，可以改为绘制简单图形
    try:
        # 使用默认字体
        font_size = 40
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        # 如果找不到字体，使用默认字体
        font = ImageFont.load_default()
    
    # 计算文字位置（居中）
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = (
        (ICON_SIZE - text_width) // 2,
        (ICON_SIZE - text_height) // 2
    )
    
    # 绘制文字（白色）
    draw.text(position, text, fill=(255, 255, 255, 255), font=font)
    
    # 保存图片
    img.save(output_path, 'PNG')
    print(f"已创建: {output_path}")

def main():
    """主函数"""
    # 确保输出目录存在
    output_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 生成所有图标
    for config in ICON_CONFIG:
        # 普通状态图标
        normal_path = os.path.join(output_dir, f"{config['name']}.png")
        create_icon(
            config['name'],
            config['text'],
            config['normal_color'],
            normal_path
        )
        
        # 激活状态图标
        active_path = os.path.join(output_dir, f"{config['name']}-active.png")
        create_icon(
            config['name'],
            config['text'],
            config['active_color'],
            active_path
        )
    
    print("\n所有图标已生成完成！")
    print("如果emoji显示不正常，请使用图标设计工具手动创建图标。")

if __name__ == "__main__":
    main()
