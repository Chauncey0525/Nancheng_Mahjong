#!/bin/bash

# 修复乱码commit信息的脚本
# 在Git Bash中运行此脚本

echo "=== 修复乱码commit信息 ==="
echo ""

# 显示最近的commit
echo "最近的commit历史："
git log --oneline -5
echo ""

# 修改最近一次commit
echo "修改最近一次commit信息..."
git commit --amend -m "添加Git中文支持配置

- 创建Git Bash中文支持配置脚本
- 添加详细的中文支持配置指南
- 确保以后commit信息正确显示中文"

echo ""
echo "修改完成！"
echo ""
echo "如果需要修改更早的commit，可以使用交互式rebase："
echo "  git rebase -i HEAD~3"
echo ""
echo "然后推送到远程（需要force push）："
echo "  git push origin main --force"
echo ""
echo "⚠️ 注意：force push会覆盖远程历史，如果多人协作需要谨慎使用"
