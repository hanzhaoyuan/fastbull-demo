# 云服务部署后无法拉起本地 Agent 问题排查指南

## 🔍 问题诊断步骤

### 步骤 1：查看浏览器控制台日志

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 点击"回测"按钮
4. 查看控制台输出

**正常情况下的日志：**
```
=== 开始唤起 Agent ===
当前环境: { protocol: "https:", host: "your-domain.com", ... }
尝试通过自定义协议唤起 Agent: quant-agent://launch
✓ 自定义协议调用已发送
已发送唤起请求，等待 Agent 启动...
第 1/3 次检查 Agent 状态...
✓ Agent 启动成功！
```

**异常情况的日志会显示具体原因**

---

## ⚠️ 常见问题和解决方案

### 问题 1：HTTPS 网站阻止自定义协议（最常见）

**症状：**
- 日志显示 `protocol: "https:"`
- 控制台可能有安全警告
- 自定义协议没有反应

**原因：**
大多数现代浏览器在 HTTPS 网站上会阻止 `quant-agent://` 等自定义协议调用，这是浏览器的安全限制。

**解决方案 A：使用 iframe 绕过限制**

修改 `QuantAgentService.ts` 的 `launchAgent` 方法：

```typescript
async launchAgent(): Promise<boolean> {
  try {
    console.log('=== 开始唤起 Agent ===');
    console.log('当前环境:', {
      protocol: window.location.protocol,
      host: window.location.host,
      userAgent: navigator.userAgent
    });

    console.log('尝试通过自定义协议唤起 Agent:', this.AGENT_PROTOCOL);

    // 在 HTTPS 环境下，使用 iframe 方式可能绕过某些限制
    if (window.location.protocol === 'https:') {
      console.log('检测到 HTTPS 环境，使用 iframe 方式尝试唤起');
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = this.AGENT_PROTOCOL;
      document.body.appendChild(iframe);

      // 2秒后移除 iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);

      console.log('✓ 已通过 iframe 发送协议调用');
    } else {
      // HTTP 环境，直接使用 window.location.href
      window.location.href = this.AGENT_PROTOCOL;
      console.log('✓ 自定义协议调用已发送');
    }

    console.log('已发送唤起请求，等待 Agent 启动...');

    // 初始等待时间
    await this.delay(this.INITIAL_WAIT);

    // ... 其余代码保持不变
  } catch (error) {
    console.error('唤起 Agent 失败:', error);
    return false;
  }
}
```

**解决方案 B：提示用户手动启动**

如果自动唤起失败，显示友好的提示：

1. 在 `QuantitativeEditor.vue` 中修改 Agent 未安装弹窗：

```vue
<!-- Agent 未安装提示对话框 -->
<div v-if="showAgentNotInstalledDialog" class="dialog-overlay" @click="showAgentNotInstalledDialog = false">
  <div class="dialog-container" @click.stop>
    <div class="dialog-header">
      <h3 class="dialog-title">Quant Agent 未运行</h3>
      <button class="dialog-close" @click="showAgentNotInstalledDialog = false">×</button>
    </div>
    <div class="dialog-body">
      <p>检测到 Quant Agent 未运行，请按以下步骤操作：</p>
      <ol style="margin: 16px 0; padding-left: 20px;">
        <li><strong>方式一：</strong>点击下方链接尝试自动启动
          <a :href="'quant-agent://launch'" style="color: #2962ff; text-decoration: underline;">
            启动 Quant Agent
          </a>
        </li>
        <li><strong>方式二：</strong>手动从"开始菜单"或"应用程序"中启动 Quant Agent</li>
        <li><strong>方式三：</strong>如果尚未安装，请先
          <a :href="quantAgentService.getDownloadUrl()" target="_blank"
             style="color: #2962ff; text-decoration: underline;">
            下载安装
          </a>
        </li>
      </ol>
      <p style="color: #666; font-size: 13px;">
        💡 提示：如果点击链接没有反应，可能是浏览器安全限制，请手动启动应用。
      </p>
    </div>
    <div class="dialog-footer">
      <button class="dialog-btn" @click="showAgentNotInstalledDialog = false">知道了</button>
      <button class="dialog-btn primary" @click="recheckAgent">我已启动，重新检测</button>
    </div>
  </div>
</div>
```

2. 添加重新检测方法：

```typescript
// 重新检测 Agent 状态
const recheckAgent = async () => {
  showAgentNotInstalledDialog.value = false;
  isCheckingAgent.value = true;

  const result = await quantAgentService.ensureAgentRunning();

  if (result.success) {
    terminalOutput.value.push('> ✓ Agent 已就绪');
    // 继续执行回测
    backtest();
  } else {
    terminalOutput.value.push('> ✗ Agent 仍未运行');
  }

  isCheckingAgent.value = false;
};
```

**解决方案 C：使用 HTTP 部署（开发/内部环境）**

如果是内部使用或开发环境，可以考虑使用 HTTP 部署：

```nginx
# Nginx 配置示例（仅内部网络使用）
server {
    listen 80;
    server_name quant.internal.company.com;

    location / {
        root /path/to/fastbull-demo/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 问题 2：跨域问题（CORS）

**症状：**
- 控制台显示 CORS 错误
- 对 `http://127.0.0.1:17633/health` 的请求被阻止

**原因：**
从 HTTPS 网站访问 HTTP 本地服务会被浏览器阻止（Mixed Content）

**解决方案：**

修改 `QuantAgentService.ts`，支持在 HTTPS 环境下的特殊处理：

```typescript
class QuantAgentService {
  private readonly AGENT_URL = 'http://127.0.0.1:17633';

  async checkAgentStatus(): Promise<AgentStatus> {
    try {
      // 检测是否是 HTTPS 环境
      if (window.location.protocol === 'https:') {
        console.warn('检测到 HTTPS 环境，可能无法直接访问本地 HTTP 服务');
        console.warn('建议：配置 Agent 使用 HTTPS 或使用浏览器扩展程序');
      }

      const response = await this.fetchWithTimeout(
        `${this.AGENT_URL}/health`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        this.HEALTH_CHECK_TIMEOUT
      );

      if (response.ok) {
        const data: HealthResponse = await response.json();
        if (data.ok) {
          console.log(`Quant Agent 正在运行 - 版本: ${data.version}`);
          return AgentStatus.RUNNING;
        }
      }
    } catch (error) {
      console.log('Agent 未运行或无法访问:', error);

      if (window.location.protocol === 'https:' && error instanceof TypeError) {
        console.error('可能是 Mixed Content 错误：HTTPS 页面无法访问 HTTP 服务');
      }
    }

    return AgentStatus.STOPPED;
  }
}
```

---

### 问题 3：Agent 未安装或未运行

**症状：**
- 日志显示"Agent 未能启动"
- 健康检查一直失败

**解决方案：**

1. **确认 Agent 已安装：**
   - Windows: 检查 `C:\Program Files\QuantAgent\`
   - Mac: 检查 `/Applications/QuantAgent.app`

2. **手动启动 Agent：**
   - Windows: 从开始菜单启动
   - Mac: 从应用程序文件夹启动

3. **验证 Agent 运行：**
   ```bash
   # 在浏览器或命令行测试
   curl http://127.0.0.1:17633/health

   # 期望返回：
   # {"ok":true,"name":"quant-agent","version":"0.1.0"}
   ```

---

### 问题 4：防火墙阻止

**症状：**
- Agent 已启动但健康检查失败
- 端口 17633 无法访问

**解决方案：**

Windows 防火墙：
```powershell
# 允许端口 17633
New-NetFirewallRule -DisplayName "Quant Agent" -Direction Inbound -Protocol TCP -LocalPort 17633 -Action Allow
```

Mac 防火墙：
```bash
# 系统偏好设置 > 安全性与隐私 > 防火墙 > 防火墙选项
# 添加 QuantAgent.app 到允许列表
```

---

## 🎯 推荐的生产环境解决方案

### 方案 1：浏览器扩展程序（推荐）

创建一个浏览器扩展来处理自定义协议和本地通信，绕过浏览器限制。

### 方案 2：本地代理服务

创建一个本地 HTTPS 代理服务，使用自签名证书：

```javascript
// 在 quant-agent 中添加 HTTPS 支持
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(17633);
```

然后在前端使用 `https://localhost:17633`（需要用户信任自签名证书）

### 方案 3：混合模式

1. HTTPS 网站用于公开访问
2. 提供一个内网 HTTP 版本用于本地开发和 Agent 交互
3. 在 HTTPS 网站上显示引导，让用户访问 HTTP 版本进行交易操作

---

## 📋 快速诊断检查表

请按顺序检查：

- [ ] Agent 是否已安装？
- [ ] Agent 是否正在运行？（检查系统托盘/任务栏）
- [ ] 本地访问 `http://127.0.0.1:17633/health` 是否返回正常？
- [ ] 前端是 HTTP 还是 HTTPS 部署？
- [ ] 浏览器控制台有什么错误信息？
- [ ] 是否有防火墙/杀毒软件阻止？
- [ ] 在本地运行前端（`npm run dev`）时是否正常？

---

## 💡 临时解决方案（立即可用）

如果需要立即使用，可以：

1. **临时使用 HTTP 部署**（仅内网）
2. **用户手动启动 Agent**，然后刷新页面
3. **提供清晰的操作指引**，引导用户完成设置

---

## 🔧 需要帮助？

请提供以下信息以便进一步诊断：

1. 前端部署地址（HTTP/HTTPS）
2. 浏览器控制台完整日志
3. 操作系统（Windows/Mac）
4. 浏览器类型和版本
5. Agent 是否已安装和运行
