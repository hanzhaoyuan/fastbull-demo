@echo off
REM 将 Quant Agent 安装包复制到前端 downloads 目录
REM 使用方法：在 fastbull-demo 目录下运行此脚本

echo ======================================
echo 复制 Quant Agent 安装包
echo ======================================
echo.

REM 检查 quant-agent 安装包是否存在
if not exist "..\quant-agent\installer\output\QuantAgentSetup-0.1.0.exe" (
    echo [错误] 未找到安装包！
    echo 请先构建 Quant Agent 安装包：
    echo   cd ..\quant-agent
    echo   python build_installer.py
    echo.
    pause
    exit /b 1
)

REM 检查目标目录是否存在
if not exist "public\downloads" (
    echo [信息] 创建 downloads 目录...
    mkdir public\downloads
)

REM 复制安装包
echo [信息] 正在复制安装包...
copy "..\quant-agent\installer\output\QuantAgentSetup-0.1.0.exe" "public\downloads\" /Y

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [成功] 安装包已复制到 public\downloads\
    echo.
    echo 文件：QuantAgentSetup-0.1.0.exe

    REM 显示文件大小
    for %%A in ("public\downloads\QuantAgentSetup-0.1.0.exe") do (
        echo 大小：%%~zA 字节
    )

    echo.
    echo 下一步：
    echo   npm run build
    echo   然后部署 dist 目录
    echo.
) else (
    echo [错误] 复制失败！
    echo.
)

pause
