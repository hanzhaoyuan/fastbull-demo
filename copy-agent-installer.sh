#!/bin/bash
# 将 Quant Agent 安装包复制到前端 downloads 目录
# 使用方法：在 fastbull-demo 目录下运行此脚本

echo "======================================"
echo "复制 Quant Agent 安装包"
echo "======================================"
echo

# 检查 quant-agent 安装包是否存在
if [ ! -f "../quant-agent/installer/output/QuantAgentSetup-0.1.0.exe" ]; then
    echo "[错误] 未找到安装包！"
    echo "请先构建 Quant Agent 安装包："
    echo "  cd ../quant-agent"
    echo "  python build_installer.py"
    echo
    exit 1
fi

# 检查目标目录是否存在
if [ ! -d "public/downloads" ]; then
    echo "[信息] 创建 downloads 目录..."
    mkdir -p public/downloads
fi

# 复制安装包
echo "[信息] 正在复制安装包..."
cp "../quant-agent/installer/output/QuantAgentSetup-0.1.0.exe" "public/downloads/"

if [ $? -eq 0 ]; then
    echo
    echo "[成功] 安装包已复制到 public/downloads/"
    echo
    echo "文件：QuantAgentSetup-0.1.0.exe"

    # 显示文件大小
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        ls -lh "public/downloads/QuantAgentSetup-0.1.0.exe" | awk '{print "大小：" $5}'
    else
        # Linux
        ls -lh "public/downloads/QuantAgentSetup-0.1.0.exe" | awk '{print "大小：" $5}'
    fi

    echo
    echo "下一步："
    echo "  npm run build"
    echo "  然后部署 dist 目录"
    echo
else
    echo "[错误] 复制失败！"
    echo
    exit 1
fi
