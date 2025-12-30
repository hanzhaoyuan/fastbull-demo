# 前端部署指南 - 包含 Agent 安装包

本指南说明如何将前端和 Quant Agent 安装包一起部署。

---

## 📦 准备工作

### 1. 构建 Quant Agent 安装包

```bash
# 进入 quant-agent 目录
cd quant-agent

# 构建安装包（需要安装 Inno Setup）
python build_installer.py

# 生成的文件：installer/output/QuantAgentSetup-0.1.0.exe
```

### 2. 复制安装包到前端项目

**Windows:**
```bash
cd fastbull-demo
copy-agent-installer.bat
```

**Linux/macOS:**
```bash
cd fastbull-demo
./copy-agent-installer.sh
```

**或手动复制:**
```bash
cp ../quant-agent/installer/output/QuantAgentSetup-0.1.0.exe public/downloads/
```

### 3. 验证文件

确保安装包已复制到正确位置：
```
fastbull-demo/
└── public/
    └── downloads/
        └── QuantAgentSetup-0.1.0.exe  ✅ (约 45-65 MB)
```

---

## 🚀 部署流程

### 本地测试

```bash
# 1. 启动开发服务器
npm run dev

# 2. 测试下载功能
# - 访问 http://localhost:5173
# - 点击"量化"标签
# - 点击"回测"按钮（如果未安装 Agent）
# - 应该弹出下载提示，点击"立即下载"
# - 验证能够下载 QuantAgentSetup-0.1.0.exe
```

### 生产部署

```bash
# 1. 构建前端（安装包会自动打包到 dist 中）
npm run build

# 2. 检查构建结果
# dist/downloads/QuantAgentSetup-0.1.0.exe 应该存在

# 3. 部署到服务器
# 方式一：使用 SCP
scp -r dist/* user@server:/var/www/html/

# 方式二：使用 FTP/SFTP 工具上传整个 dist 目录

# 方式三：云服务商（如阿里云 OSS、腾讯云 COS）
# - 上传整个 dist 目录
# - 配置静态网站托管

# 4. 验证部署
# 访问你的域名，测试下载功能
```

---

## 🌐 部署到云服务

### 阿里云 OSS

```bash
# 安装 ossutil
# https://help.aliyun.com/document_detail/120075.html

# 上传 dist 目录
ossutil cp -r dist/ oss://your-bucket-name/ --update

# 访问：https://your-bucket-name.oss-cn-hangzhou.aliyuncs.com/index.html
```

### 腾讯云 COS

```bash
# 安装 coscmd
pip install coscmd

# 配置
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>

# 上传
coscmd upload -r dist/ / --delete

# 访问：https://your-bucket-name.cos.ap-guangzhou.myqcloud.com/index.html
```

### Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html/dist;
    index index.html;

    # 支持 Vue Router 的 history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 下载目录，设置正确的 Content-Type
    location /downloads/ {
        alias /var/www/html/dist/downloads/;
        autoindex off;

        # 强制下载
        add_header Content-Disposition "attachment";

        # 设置缓存
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## 📋 部署检查清单

- [ ] Quant Agent 安装包已构建（QuantAgentSetup-0.1.0.exe）
- [ ] 安装包已复制到 `public/downloads/`
- [ ] 本地测试下载功能正常
- [ ] 前端已构建 (`npm run build`)
- [ ] `dist/downloads/QuantAgentSetup-0.1.0.exe` 存在
- [ ] dist 目录已上传到服务器
- [ ] 生产环境下载功能测试通过

---

## ⚠️ 注意事项

### 1. 文件大小
- Windows 安装包约 45-65 MB
- 会增加前端 dist 的总大小
- 确保服务器/CDN 有足够存储空间

### 2. 下载链接
当前配置使用**相对路径**：
```typescript
// src/services/QuantAgentService.ts
'windows': '/downloads/QuantAgentSetup-0.1.0.exe'
```

这意味着：
- 本地开发：`http://localhost:5173/downloads/QuantAgentSetup-0.1.0.exe`
- 生产环境：`http://your-domain.com/downloads/QuantAgentSetup-0.1.0.exe`

### 3. HTTPS 要求
如果前端使用 HTTPS，确保：
- 安装包也通过 HTTPS 提供
- 否则浏览器可能阻止下载（Mixed Content）

### 4. 版本更新
更新安装包时：
- 修改文件名（如 `QuantAgentSetup-0.1.1.exe`）
- 更新 `QuantAgentService.ts` 中的链接
- 重新构建和部署前端

---

## 🔄 使用 CDN 加速（可选）

如果安装包太大影响前端加载速度，可以使用 CDN：

### 1. 将安装包上传到 CDN

```bash
# 示例：阿里云 OSS
ossutil cp QuantAgentSetup-0.1.0.exe oss://cdn-bucket/downloads/
```

### 2. 修改下载链接

编辑 `src/services/QuantAgentService.ts`:
```typescript
const downloadUrls = {
  'windows': 'https://cdn.your-domain.com/downloads/QuantAgentSetup-0.1.0.exe',
  'mac': 'https://cdn.your-domain.com/downloads/QuantAgent-0.1.0.dmg',
  'linux': 'https://cdn.your-domain.com/downloads/quant-agent-0.1.0-linux.tar.gz'
};
```

### 3. 重新构建前端

```bash
npm run build
# 这次 dist 不包含安装包，体积更小
```

---

## 🐛 故障排除

### 问题：下载时显示 404

**原因**：安装包未正确部署

**解决**：
1. 检查 `dist/downloads/QuantAgentSetup-0.1.0.exe` 是否存在
2. 检查服务器上文件是否正确上传
3. 检查文件权限（应该可读）

### 问题：下载的文件无法安装

**原因**：文件损坏或传输错误

**解决**：
1. 比对文件大小和 MD5
2. 使用二进制模式上传（FTP/SCP）
3. 重新构建和上传安装包

### 问题：浏览器阻止下载

**原因**：Mixed Content（HTTPS 页面加载 HTTP 资源）

**解决**：
1. 确保前端和安装包都使用 HTTPS
2. 或配置 CDN 支持 HTTPS

---

## 📚 相关文档

- [public/downloads/README.md](public/downloads/README.md) - 安装包目录说明
- [quant-agent/README.md](../quant-agent/README.md) - Agent 构建文档
- [quant-agent/CORS_FIX.md](../quant-agent/CORS_FIX.md) - CORS 问题修复

---

**部署成功后，用户可以直接从你的网站下载并安装 Quant Agent！** 🎉
