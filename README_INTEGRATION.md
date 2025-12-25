# 前端集成完成 - 文件清单

## 已创建的文件

### 1. 核心服务文件
**`src/services/QuantAgentService.ts`**
- Agent 检测、唤起和通信的核心服务
- 提供三种主要方法：
  - `checkAgentStatus()` - 检测 Agent 状态
  - `launchAgent()` - 通过自定义协议唤起 Agent
  - `ensureAgentRunning()` - 确保 Agent 运行（自动检测+唤起）
  - `submitBacktestTask()` - 提交回测任务

### 2. 集成指南
**`AGENT_INTEGRATION_GUIDE.md`**
- 完整的集成步骤说明
- 包含代码示例和最佳实践
- Agent 状态指示器的实现方案
- 调试建议和扩展方向

### 3. 修改对比文件
**`BACKTEST_MODIFICATION.ts`**
- 清晰展示需要修改的地方
- 原代码 vs 新代码对比
- 包含导入语句的修改

### 4. 独立测试页面
**`agent_test.html`**
- 可独立运行的测试页面
- 直接在浏览器中打开即可测试
- 包含完整的UI和日志输出
- 用于验证 Agent 检测逻辑

## 快速开始

### 步骤 1: 测试 Agent 是否正常运行

1. 启动 quant-agent 服务：
```bash
cd quant-agent
python scripts/run_dev.py
```

2. 在浏览器中打开测试页面：
```bash
# 在浏览器中打开
fastbull-demo/agent_test.html
```

3. 点击 "检测 Agent 状态" 按钮，应该看到：
   - 状态显示: "Agent 正在运行"
   - 日志显示: "✅ Agent 正在运行 - quant-agent v0.1.0"

### 步骤 2: 修改前端代码

1. 打开 `QuantitativeEditor.vue`

2. 在文件顶部（约 370-372 行）添加导入：
```typescript
import { quantAgentService, AgentStatus } from '../services/QuantAgentService';
```

3. 找到 `backtest` 函数（约 806 行），完整替换为 `BACKTEST_MODIFICATION.ts` 中的新代码

### 步骤 3: 测试集成

1. 启动前端项目：
```bash
cd fastbull-demo
npm run dev
```

2. 打开浏览器，进入"量化"标签

3. 打开一个策略文件（如 `MAPlus.py`）

4. 点击"回测"按钮

5. 观察 Terminal 面板的输出：
   - "正在检测 Quant Agent..."
   - "Agent 已就绪"
   - "提交回测任务到 Agent..."
   - "任务状态: not_implemented"
   - "Task API is under development. Coming soon!"

## 三种状态的测试方法

### 测试状态 1: Agent 正在运行
1. 确保 quant-agent 服务正在运行
2. 点击回测
3. **预期结果**: 立即检测成功并提交任务

### 测试状态 2: Agent 已安装但未运行
1. 关闭 quant-agent 服务
2. 确保已注册自定义协议（安装包会自动注册）
3. 点击回测
4. **预期结果**:
   - 尝试通过 `quant-agent://launch` 唤起
   - 等待 2 秒后重新检测
   - 如果成功启动，继续提交任务

### 测试状态 3: Agent 未安装
1. 关闭 quant-agent 服务
2. 取消注册自定义协议
3. 点击回测
4. **预期结果**:
   - 检测失败
   - 显示"请先下载并安装 Quant Agent 客户端"
   - 弹出确认对话框询问是否下载

## 工作流程

```
用户点击"回测"
    ↓
检测 Agent 是否运行 (HTTP GET /health)
    ├─ 是 → 提交任务
    └─ 否 → 尝试唤起
          ↓
    唤起 Agent (quant-agent://launch)
          ↓
    等待 2 秒
          ↓
    再次检测
          ├─ 成功 → 提交任务
          └─ 失败 → 提示下载安装
```

## 文件结构

```
fastbull-demo/
├── src/
│   ├── services/
│   │   └── QuantAgentService.ts          ✨ 新增 - Agent 通信服务
│   └── components/
│       └── QuantitativeEditor.vue         📝 需要修改 - 添加回测逻辑
│
├── AGENT_INTEGRATION_GUIDE.md            📚 新增 - 完整集成指南
├── BACKTEST_MODIFICATION.ts              📝 新增 - 修改对比文件
└── agent_test.html                       🧪 新增 - 独立测试页面

quant-agent/
├── agent/
│   └── main.py                           ✅ 已完成 - 提供 /health 接口
├── README.md                             ✅ 已完成 - 包含打包说明
└── build.py                              ✅ 已完成 - 打包脚本
```

## 调试技巧

### 1. 检查 Agent 是否运行
```bash
# 方法1: 直接访问
curl http://127.0.0.1:17633/health

# 方法2: 浏览器访问
http://127.0.0.1:17633/docs
```

### 2. 浏览器控制台查看日志
```javascript
// 打开控制台 (F12)
// 会看到详细的检测日志:
// - "Quant Agent 正在运行 - 版本: 0.1.0"
// - "Agent 未运行: AbortError"
```

### 3. 测试自定义协议
```
在浏览器地址栏输入: quant-agent://launch
```

### 4. Network 面板查看请求
- 打开 DevTools -> Network
- 查看对 `/health` 和 `/tasks` 的请求
- 查看响应内容和状态码

## 常见问题

### Q: 点击回测后没有反应？
A: 打开浏览器控制台，查看是否有错误信息。可能原因：
   - QuantAgentService.ts 路径不对
   - 导入语句有误
   - 函数语法错误

### Q: 一直显示"Agent 未运行"？
A: 检查：
   1. quant-agent 服务是否真的在运行
   2. 端口是否是 17633
   3. 是否被防火墙拦截
   4. 使用 `curl` 命令测试 `/health` 接口

### Q: 唤起协议不工作？
A:
   1. 确保已经安装了带有协议注册的安装包
   2. 查看 Windows 注册表: `HKEY_CLASSES_ROOT\quant-agent`
   3. 尝试手动访问: `quant-agent://launch`

### Q: 任务返回 501 错误？
A: 这是正常的！当前 Agent 的 `/tasks` 接口还未实现完整逻辑，返回 501 Not Implemented 是预期行为。

## 下一步工作

1. **完善 Agent 后端**
   - 实现真实的回测逻辑
   - 添加任务队列管理
   - 实现 WebSocket 实时通信

2. **增强前端功能**
   - 添加回测参数配置界面
   - 显示回测进度条
   - 可视化回测结果（收益曲线、指标等）

3. **打包与分发**
   - 使用 `python build.py` 打包 quant-agent
   - 使用 Inno Setup 制作安装程序
   - 分发给用户测试

## 技术支持

如有问题，请检查：
1. `agent_test.html` 测试页面的日志输出
2. 浏览器控制台的错误信息
3. quant-agent 服务的日志输出
4. README.md 中的详细文档

---

**所有文件已创建完成！现在可以开始测试了。** 🎉
