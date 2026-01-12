# 快速配置指南

## 🚀 5 分钟配置完成

### 本地开发 → 云端 API

```bash
# .env.development 已配置为：
VITE_API_BASE_URL=http://43.138.248.158:8080/api

# 直接启动即可
npm run dev
```

### 云端部署 → 本地 API

```bash
# .env.production 已配置为：
VITE_API_BASE_URL=/api

# 构建并部署
npm run build
scp -r dist/* root@43.138.248.158:/var/www/html/fastbull-demo/dist/
```

---

## Nginx 最小配置

```nginx
server {
    listen 80;
    server_name 43.138.248.158;

    # 前端
    location / {
        root /var/www/html/fastbull-demo/dist;
        try_files $uri /index.html;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
    }
}
```

---

## 验证

```bash
# 1. 测试前端
curl http://43.138.248.158

# 2. 测试 API
curl http://43.138.248.158/api/code-file/list?type=strategy&userId=1
```

**完成！** 🎉

详细说明见 [DEPLOYMENT_CONFIG.md](DEPLOYMENT_CONFIG.md)
