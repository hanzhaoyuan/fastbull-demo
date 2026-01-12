# 前后端部署配置指南

## 📋 部署场景

你有两个部署场景需要配置不同的 API 地址：

| 场景 | 前端位置 | 后端位置 | API 地址 |
|------|---------|---------|----------|
| **本地开发** | localhost:5173 | 云端 43.138.248.158:8080 | `http://43.138.248.158:8080/api` |
| **云端部署** | 云端 43.138.248.158 | 云端 43.138.248.158:8080 | `/api` (相对路径) |

---

## ✅ 解决方案：使用环境变量

### 1. 开发环境配置（本地）

文件：`.env.development`

```bash
# 开发环境配置
VITE_API_BASE_URL=http://43.138.248.158:8080/api
```

### 2. 生产环境配置（云端）

文件：`.env.production`

```bash
# 生产环境配置（前后端在同一服务器）
VITE_API_BASE_URL=/api
```

**为什么用 `/api`？**
- 相对路径自动使用当前域名
- 访问 `http://43.138.248.158` 时，请求会发送到 `http://43.138.248.158/api`
- 无需硬编码 IP 或域名

---

## 🚀 使用方法

### 本地开发

```bash
# 1. 启动开发服务器（自动使用 .env.development）
npm run dev

# 2. 访问 http://localhost:5173
# 3. API 请求会发送到 http://43.138.248.158:8080/api
```

### 云端部署

```bash
# 1. 构建生产版本（自动使用 .env.production）
npm run build

# 2. dist 目录会使用相对路径 /api
# 3. 上传 dist 到服务器
```

---

## 🔧 Nginx 配置（云端服务器）

### 完整配置示例

```nginx
server {
    listen 80;
    server_name 43.138.248.158;  # 或你的域名

    # 前端静态文件
    location / {
        root /var/www/html/fastbull-demo/dist;
        index index.html;
        try_files $uri $uri/ /index.html;  # Vue Router history 模式
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;  # 代理到本地 Java 服务
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS 设置（如果后端没有设置）
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'Content-Type, Authorization';

        # OPTIONS 请求处理
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # 下载文件（Quant Agent 安装包）
    location /downloads/ {
        alias /var/www/html/fastbull-demo/dist/downloads/;
        autoindex off;
        add_header Content-Disposition "attachment";
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### 关键点说明

1. **前端路由** (`location /`)：
   - 指向 `dist` 目录
   - `try_files` 支持 Vue Router

2. **API 代理** (`location /api/`)：
   - 前端请求 `/api/xxx` → Nginx 代理到 `http://127.0.0.1:8080/api/xxx`
   - 前后端同域，无 CORS 问题

3. **下载文件** (`location /downloads/`)：
   - Quant Agent 安装包
   - 强制下载

---

## 📦 部署流程

### 步骤 1：构建前端

```bash
cd fastbull-demo

# 确保使用生产环境配置
npm run build

# 验证构建产物
ls -lh dist/
```

### 步骤 2：上传到服务器

```bash
# 方法 1：使用 SCP
scp -r dist/* root@43.138.248.158:/var/www/html/fastbull-demo/dist/

# 方法 2：使用 rsync
rsync -avz --delete dist/ root@43.138.248.158:/var/www/html/fastbull-demo/dist/

# 方法 3：使用 FTP 工具（FileZilla 等）
```

### 步骤 3：配置 Nginx

```bash
# SSH 登录服务器
ssh root@43.138.248.158

# 编辑 Nginx 配置
sudo vim /etc/nginx/sites-available/fastbull

# 粘贴上面的配置

# 创建软链接
sudo ln -s /etc/nginx/sites-available/fastbull /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl reload nginx
```

### 步骤 4：验证

```bash
# 访问前端
curl http://43.138.248.158

# 测试 API 代理
curl http://43.138.248.158/api/code-file/list?type=strategy&userId=1

# 应该返回 JSON 数据
```

---

## 🧪 测试

### 测试 API 配置

在浏览器控制台（F12）查看：

```javascript
// 开发环境
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
// 输出: http://43.138.248.158:8080/api

// 生产环境
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
// 输出: /api
```

### 测试 API 请求

```javascript
// 开发环境
fetch('http://43.138.248.158:8080/api/code-file/list?type=strategy&userId=1')
  .then(r => r.json())
  .then(console.log);

// 生产环境（自动使用相对路径）
fetch('/api/code-file/list?type=strategy&userId=1')
  .then(r => r.json())
  .then(console.log);
```

---

## ⚠️ 常见问题

### 问题 1：CORS 错误

**症状**：
```
Access to fetch at 'http://43.138.248.158:8080/api/...' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**解决方法**：

**方案 A**：后端添加 CORS 配置（推荐）

```java
// Spring Boot 配置
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:5173",      // 本地开发
                    "http://43.138.248.158"       // 云端部署
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

**方案 B**：Vite 开发服务器代理

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://43.138.248.158:8080',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});
```

使用代理后，开发环境配置改为：

```bash
# .env.development
VITE_API_BASE_URL=/api  # 使用相对路径
```

### 问题 2：部署后 404

**症状**：刷新页面或直接访问路由时 404

**原因**：Vue Router history 模式需要服务器配置

**解决**：Nginx 添加 `try_files`（已包含在上面的配置中）

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 问题 3：API 请求路径错误

**检查清单**：
- [ ] `.env.development` 是否正确
- [ ] `.env.production` 是否正确
- [ ] `npm run build` 是否使用了正确的环境
- [ ] Nginx 配置是否正确
- [ ] 后端服务是否在运行

---

## 📝 环境变量完整列表

| 变量名 | 开发环境 | 生产环境 | 说明 |
|--------|---------|---------|------|
| `VITE_API_BASE_URL` | `http://43.138.248.158:8080/api` | `/api` | 后端 API 地址 |
| `VITE_USE_LOCAL_AGENT` | `true` | `true` | 是否使用本地 Agent |

---

## 🔄 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 安装依赖（如有更新）
npm install

# 3. 构建
npm run build

# 4. 上传到服务器
scp -r dist/* root@43.138.248.158:/var/www/html/fastbull-demo/dist/

# 5. 清除浏览器缓存
# Ctrl + F5 强制刷新
```

---

## ✅ 检查清单

部署前确认：

- [ ] `.env.development` 配置正确（指向云端 API）
- [ ] `.env.production` 配置正确（使用相对路径）
- [ ] `npm run build` 构建成功
- [ ] `dist` 目录包含所有文件
- [ ] Quant Agent 安装包在 `dist/downloads/`
- [ ] Nginx 配置正确
- [ ] 后端服务正在运行
- [ ] 防火墙允许 80 端口
- [ ] API 代理工作正常
- [ ] 前端路由正常（刷新不 404）
- [ ] 下载功能正常

---

**配置完成！现在可以完美支持本地开发和云端部署！** 🎉
