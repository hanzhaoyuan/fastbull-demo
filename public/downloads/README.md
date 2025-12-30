# Agent 安装包存放说明

## 目录说明

此目录用于存放 Quant Agent 的安装包，供用户下载。

## 文件命名规范

请按照以下命名放置安装包：

```
public/downloads/
├── QuantAgentSetup-0.1.0.exe          # Windows 安装包
├── QuantAgent-0.1.0.dmg                # macOS 安装包（可选）
└── quant-agent-0.1.0-linux.tar.gz      # Linux 安装包（可选）
```

## 如何准备安装包

### 1. 构建 Windows 安装包

```bash
# 进入 quant-agent 目录
cd ../quant-agent

# 打包可执行文件
python build.py

# 制作安装程序（需要安装 Inno Setup）
python build_installer.py

# 或手动使用 Inno Setup Compiler 编译 installer/setup.iss
```

生成的安装包位于：`quant-agent/installer/output/QuantAgentSetup-0.1.0.exe`

### 2. 复制到前端 downloads 目录

```bash
# Windows CMD
copy ..\quant-agent\installer\output\QuantAgentSetup-0.1.0.exe public\downloads\

# PowerShell
Copy-Item ..\quant-agent\installer\output\QuantAgentSetup-0.1.0.exe public\downloads\

# Linux/macOS
cp ../quant-agent/installer/output/QuantAgentSetup-0.1.0.exe public/downloads/
```

## 部署流程

### 方案一：将安装包打包到前端（推荐用于本地或小型部署）

**优点**：
- 用户下载时无需额外配置
- 前端和安装包一起部署，方便管理

**缺点**：
- 会增加前端 dist 的大小（约 45-65 MB）
- 每次更新安装包需要重新构建前端

**步骤**：

```bash
# 1. 准备安装包（见上方"如何准备安装包"）

# 2. 复制到 public/downloads
cp ../quant-agent/installer/output/QuantAgentSetup-0.1.0.exe public/downloads/

# 3. 构建前端（安装包会自动包含在 dist 中）
npm run build

# 4. 部署 dist 目录到服务器
# dist/downloads/QuantAgentSetup-0.1.0.exe 会一起部署
```

### 方案二：使用 CDN 或独立文件服务器（推荐用于生产环境）

**优点**：
- 前端体积小，加载快
- 安装包可以独立更新，无需重新构建前端
- 可以使用 CDN 加速下载

**缺点**：
- 需要额外配置文件服务器或 CDN

**步骤**：

1. **将安装包上传到文件服务器或 CDN**
   ```bash
   # 示例：阿里云 OSS
   ossutil cp QuantAgentSetup-0.1.0.exe oss://your-bucket/downloads/

   # 示例：腾讯云 COS
   coscmd upload QuantAgentSetup-0.1.0.exe downloads/

   # 示例：自建文件服务器
   scp QuantAgentSetup-0.1.0.exe user@server:/var/www/downloads/
   ```

2. **修改 QuantAgentService.ts 中的下载链接**
   ```typescript
   const downloadUrls = {
     'windows': 'https://cdn.your-domain.com/downloads/QuantAgentSetup-0.1.0.exe',
     'mac': 'https://cdn.your-domain.com/downloads/QuantAgent-0.1.0.dmg',
     'linux': 'https://cdn.your-domain.com/downloads/quant-agent-0.1.0-linux.tar.gz'
   };
   ```

3. **构建并部署前端**
   ```bash
   npm run build
   # 部署 dist 到 Web 服务器
   ```

## 验证下载功能

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
# 1. 点击"量化"标签
# 2. 打开策略文件
# 3. 点击"回测"按钮
# 4. 如果未安装 Agent，会弹出下载提示
# 5. 点击"立即下载"，应该能下载安装包
```

### 生产环境测试

```bash
# 访问你的部署地址，例如 http://43.138.248.158
# 按照上述步骤测试下载功能
```

## 注意事项

1. **文件大小**：Windows 安装包约 45-65 MB，确保服务器有足够空间
2. **浏览器缓存**：更新安装包后，建议修改文件名（如 `QuantAgentSetup-0.1.1.exe`）避免缓存问题
3. **HTTPS**：如果前端使用 HTTPS，下载链接也应该使用 HTTPS，否则浏览器可能阻止下载
4. **CORS**：如果使用 CDN，确保配置了正确的 CORS 头部

## 当前配置

目前代码配置为**方案一**（安装包打包到前端）：
- 下载链接：`/downloads/QuantAgentSetup-0.1.0.exe`
- 文件位置：`public/downloads/QuantAgentSetup-0.1.0.exe`
- 构建后位置：`dist/downloads/QuantAgentSetup-0.1.0.exe`

如需切换到**方案二**，请修改 `src/services/QuantAgentService.ts` 中的 `getDownloadUrl()` 方法。
