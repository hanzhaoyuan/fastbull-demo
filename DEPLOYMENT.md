# 部署说明

本项目支持两种部署模式：

## 1. 本地开发模式

本地开发模式下，回测功能依赖本地运行的 Quant Agent 客户端。

### 配置文件：`.env` 或 `.env.development`

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_LOCAL_AGENT=true
```

### 使用步骤：
1. 确保本地安装并运行了 Quant Agent 客户端（监听在 http://127.0.0.1:17633）
2. 启动后端服务（默认 http://localhost:8080）
3. 运行前端开发服务器：`npm run dev`
4. 访问应用后，点击"回测"按钮会自动检测和唤起本地 Agent

## 2. 云端部署模式

云端部署模式下，前端完全独立运行，不依赖本地 Quant Agent。回测功能将调用云端 API。

### 配置文件：`.env.production`

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_USE_LOCAL_AGENT=false
```

### 部署步骤：

1. **修改配置文件**
   - 编辑 `.env.production`
   - 将 `VITE_API_BASE_URL` 替换为你的云端后端 API 地址
   - 确保 `VITE_USE_LOCAL_AGENT=false`

2. **构建生产版本**
   ```bash
   npm run build
   ```

3. **部署到云服务器**
   - 将 `dist` 目录部署到你的 Web 服务器（Nginx、Apache等）
   - 或使用云服务商的静态网站托管服务（如阿里云 OSS、腾讯云 COS、AWS S3 等）

4. **配置后端 CORS**
   - 确保后端 API 允许来自前端域名的跨域请求
   - 配置合适的 CORS 策略

### 验证部署

访问部署后的网址，点击策略文件的"回测"按钮：
- **本地模式**：会提示检测 Quant Agent，如果未安装会提示下载
- **云端模式**：直接显示"云端回测模式"，不会检测本地 Agent

## 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 基础地址 | `http://localhost:8080/api` |
| `VITE_USE_LOCAL_AGENT` | 是否使用本地 Agent<br>true: 本地模式<br>false: 云端模式 | `true` / `false` |

## 常见问题

### Q: 云端部署后仍提示"需要本地 Quant Agent 支持"？

**A:** 检查以下几点：
1. 确认 `.env.production` 中 `VITE_USE_LOCAL_AGENT=false`
2. 确认使用 `npm run build` 重新构建了项目
3. 确认部署的是最新构建的 `dist` 目录
4. 清除浏览器缓存后重试

### Q: 如何在同一份代码中同时支持本地和云端？

**A:** 通过环境变量区分：
- 开发环境使用 `.env.development`（本地模式）
- 生产环境使用 `.env.production`（云端模式）
- 构建时 Vite 会自动选择对应的环境配置

### Q: 云端模式下如何实现回测功能？

**A:** 需要在后端实现回测 API 接口，前端代码中已预留了调用位置：

```typescript
// 在 QuantitativeEditor.vue 的 backtest 函数中
if (!quantAgentService.isLocalAgentEnabled()) {
  // TODO: 调用云端回测 API
  // const result = await codeFileService.runBacktest(currentFile.value.id);
}
```

你需要在 `CodeFileService.ts` 中添加 `runBacktest` 方法，调用后端的回测 API。
