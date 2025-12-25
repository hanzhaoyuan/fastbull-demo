# 回测功能 - Agent 集成说明

## 功能概述

点击"回测"按钮时，系统会自动检测并处理 Quant Agent 的三种状态。

## 三种状态处理

### 1. Agent 正在运行 ✅
- **检测方式**: 访问 `http://127.0.0.1:17633/health`
- **响应时间**: 3 秒超时
- **处理逻辑**: 直接提交回测任务

**Terminal 输出示例**:
```
> 正在检测 Quant Agent...
> Agent 已就绪
> 正在启动回测: MAPlus.py
> 回测任务已提交，等待执行...
```

### 2. Agent 已安装但未运行 🔄
- **检测方式**: Health 检查失败
- **唤起方式**: 通过自定义协议 `quant-agent://launch`
- **等待时间**: 唤起后等待 2 秒
- **重试检测**: 再次访问 /health 确认启动成功

**Terminal 输出示例**:
```
> 正在检测 Quant Agent...
> Agent 未运行，尝试唤起...
> 已发送唤起请求，等待 Agent 启动...
> Agent 已成功启动
> 正在启动回测: MAPlus.py
> 回测任务已提交，等待执行...
```

### 3. Agent 未安装 ⚠️
- **检测方式**: 唤起失败后判定为未安装
- **UI 响应**: 弹出安装提示对话框
- **下载入口**: "立即下载" 按钮

**Terminal 输出示例**:
```
> 正在检测 Quant Agent...
> Agent 未运行，尝试唤起...
> 已发送唤起请求，等待 Agent 启动...
> 请先下载并安装 Quant Agent 客户端
```

**对话框内容**:
- 标题: "需要安装 Quant Agent"
- 功能特点:
  - ✓ 本地执行，数据安全
  - ✓ 高性能回测引擎
  - ✓ 无需配置环境
- 操作按钮:
  - "稍后再说" (关闭对话框)
  - "立即下载" (打开下载页面)

## UI 交互细节

### 回测按钮状态
- **正常状态**: 显示 "回测"
- **检测中**: 显示 "检测中..."，按钮禁用
- **禁用样式**: 灰色背景，不可点击

### Terminal 输出
- 实时显示检测进度
- 显示 Agent 状态和操作结果
- 错误信息以红色 "错误:" 前缀显示

### 对话框样式
- 居中显示，半透明遮罩
- 包含图标、说明文字、功能特点列表
- 蓝色主按钮 + 灰色次要按钮
- 点击遮罩或关闭按钮可关闭

## 代码实现

### 核心服务
**文件**: `src/services/QuantAgentService.ts`

主要方法:
- `checkAgentStatus()`: 检测 Agent 状态
- `launchAgent()`: 唤起 Agent
- `ensureAgentRunning()`: 确保 Agent 运行（组合方法）
- `submitBacktestTask()`: 提交回测任务

### 组件集成
**文件**: `src/components/QuantitativeEditor.vue`

关键函数:
```typescript
const backtest = async () => {
  // 1. 验证当前文件
  // 2. 检测 Agent 状态
  // 3. 根据状态执行相应操作
  // 4. 显示结果或提示
}
```

## 测试步骤

### 测试场景 1: Agent 正在运行
1. 启动 `quant-agent.exe`
2. 打开策略文件 (如 MAPlus.py)
3. 点击"回测"按钮
4. **预期**: 直接提交回测任务

### 测试场景 2: Agent 已安装但未运行
1. 确保已安装但未运行 Agent
2. 打开策略文件
3. 点击"回测"按钮
4. **预期**:
   - 看到"检测中..."状态
   - Agent 自动启动
   - 提交回测任务

### 测试场景 3: Agent 未安装
1. 确保未安装 Agent（或无法通过协议唤起）
2. 打开策略文件
3. 点击"回测"按钮
4. **预期**:
   - 看到"检测中..."状态
   - 弹出安装提示对话框
   - 点击"立即下载"跳转到下载页面

### 测试场景 4: 非策略文件
1. 打开指标文件 (如 MATrader.py) 或库文件
2. **预期**: 不显示"回测"按钮

### 测试场景 5: 未选择文件
1. 不打开任何文件
2. **预期**: 不显示"回测"按钮

## 配置说明

### Agent URL
默认地址: `http://127.0.0.1:17633`
修改位置: `src/services/QuantAgentService.ts:33`

### 自定义协议
默认协议: `quant-agent://launch`
修改位置: `src/services/QuantAgentService.ts:34`

### 超时设置
- Health 检查超时: 3000ms (3秒)
- 唤起后等待: 2000ms (2秒)
修改位置: `src/services/QuantAgentService.ts:35-36`

### 下载 URL
默认值: `https://your-company.com/downloads/quant-agent-setup.exe`
修改位置: `src/services/QuantAgentService.ts:183`

## 错误处理

### 网络错误
- 超时或连接失败 → 判定为 Agent 未运行
- 尝试唤起 → 如果唤起失败，提示安装

### 协议注册失败
- 协议未注册 → 唤起无响应
- 等待超时后 → 判定为未安装
- 提示用户下载安装

### 回测任务提交失败
- HTTP 错误 → 显示错误信息到 Terminal
- 保持 Agent 连接 → 可以重试

## 后续开发

### TODO
- [ ] 实现实际的回测任务提交接口（目前是注释代码）
- [ ] 添加回测任务状态查询
- [ ] 添加回测结果展示
- [ ] 优化 Agent 启动等待时间（可能需要轮询）
- [ ] 添加 Agent 版本检查和更新提示
- [ ] 更新实际的下载 URL

### 扩展功能
- 实时查看回测进度
- 回测结果可视化
- 多策略批量回测
- 回测参数配置界面

## 注意事项

1. **自定义协议必须预先注册**: Agent 安装时需要注册 `quant-agent://` 协议
2. **跨域问题**: Agent 必须配置 CORS 允许本地前端访问
3. **健康检查轻量化**: /health 接口应该快速响应，不执行耗时操作
4. **用户体验**: 检测过程应该有明确的状态提示和进度反馈
5. **错误恢复**: 网络错误或超时后应该允许用户重试

## 相关文档

- [Quant Agent API 文档](../quant-agent/README.md)
- [Agent 集成指南](./AGENT_INTEGRATION_GUIDE.md)
- [前端 Agent 服务](./src/services/QuantAgentService.ts)
