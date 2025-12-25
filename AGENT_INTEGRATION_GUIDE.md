# 前端集成 Quant Agent 检测逻辑

## 步骤 1: 导入服务

在 `QuantitativeEditor.vue` 的 `<script setup lang="ts">` 部分添加导入：

```typescript
import { quantAgentService, AgentStatus } from '../services/QuantAgentService';
```

## 步骤 2: 修改 backtest 函数

找到 `backtest` 函数（大约在第 806 行），替换为以下代码：

```typescript
// 回测
const backtest = async () => {
  terminalOutput.value.push('> 正在检测 Quant Agent...');

  try {
    // 1. 确保 Agent 正在运行
    const result = await quantAgentService.ensureAgentRunning();

    if (!result.success) {
      // Agent 未安装或无法启动
      terminalOutput.value.push(`> 错误: ${result.message}`);

      if (result.status === AgentStatus.NOT_INSTALLED) {
        // 提示用户下载安装
        const downloadUrl = quantAgentService.getDownloadUrl();
        terminalOutput.value.push(`> 请访问以下链接下载 Quant Agent:`);
        terminalOutput.value.push(`> ${downloadUrl}`);

        // 可选：打开下载页面
        const shouldDownload = confirm(
          'Quant Agent 未安装。\n\n点击"确定"前往下载页面，点击"取消"继续。'
        );
        if (shouldDownload) {
          window.open(downloadUrl, '_blank');
        }
      }
      return;
    }

    // 2. Agent 已就绪
    terminalOutput.value.push(`> ${result.message}`);
    terminalOutput.value.push('> 准备启动回测...');

    // 3. 构造回测任务请求
    if (!currentFile.value) {
      terminalOutput.value.push('> 错误: 未选择策略文件');
      return;
    }

    const taskRequest = {
      task_type: 'backtest' as const,
      strategy_id: currentFile.value.id,
      params: {
        strategy_name: currentFile.value.name,
        strategy_content: currentFile.value.content,
        start_date: '2024-01-01',  // 可以从用户输入获取
        end_date: '2024-12-31',    // 可以从用户输入获取
        initial_capital: 100000,   // 初始资金
        // 其他参数...
      },
    };

    terminalOutput.value.push('> 提交回测任务到 Agent...');

    // 4. 提交回测任务（当前 Agent 返回 501，这是预期的）
    const response = await quantAgentService.submitBacktestTask(taskRequest);

    terminalOutput.value.push(`> 任务状态: ${response.status}`);
    terminalOutput.value.push(`> ${response.message}`);

    // TODO: 当 Agent 真正实现回测后，这里可以：
    // - 显示回测进度
    // - 通过 WebSocket 接收实时更新
    // - 展示回测结果（收益曲线、夏普比率等）

  } catch (error) {
    console.error('回测失败:', error);
    terminalOutput.value.push(`> 回测失败: ${error}`);
  }
};
```

## 步骤 3: 添加 Agent 状态指示器（可选）

可以在编辑器工具栏添加一个 Agent 状态指示器。在 `editor-toolbar` 部分添加：

```vue
<template>
  <div class="editor-toolbar" v-if="currentFile">
    <div class="file-info-section">
      <!-- 添加 Agent 状态指示 -->
      <div class="agent-status" :class="agentStatusClass" :title="agentStatusText">
        <svg viewBox="0 0 8 8" width="8" height="8">
          <circle cx="4" cy="4" r="4" fill="currentColor"/>
        </svg>
        <span>Agent</span>
      </div>

      <span class="file-name-display">{{ currentFile.name }}</span>
      <!-- 其他内容... -->
    </div>
    <!-- 其他内容... -->
  </div>
</template>

<script setup lang="ts">
// 添加响应式状态
const agentStatus = ref<AgentStatus>(AgentStatus.CHECKING);

// 计算状态样式
const agentStatusClass = computed(() => {
  switch (agentStatus.value) {
    case AgentStatus.RUNNING:
      return 'status-running';
    case AgentStatus.STOPPED:
      return 'status-stopped';
    case AgentStatus.NOT_INSTALLED:
      return 'status-not-installed';
    default:
      return 'status-checking';
  }
});

// 计算状态文本
const agentStatusText = computed(() => {
  switch (agentStatus.value) {
    case AgentStatus.RUNNING:
      return 'Agent 正在运行';
    case AgentStatus.STOPPED:
      return 'Agent 未运行（点击回测将自动唤起）';
    case AgentStatus.NOT_INSTALLED:
      return 'Agent 未安装';
    default:
      return '检测中...';
  }
});

// 在组件挂载时检测 Agent 状态
onMounted(async () => {
  // 检测 Agent 状态
  agentStatus.value = await quantAgentService.checkAgentStatus();
});
</script>

<style scoped>
/* Agent 状态指示器样式 */
.agent-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s;
}

.agent-status svg {
  flex-shrink: 0;
}

.status-running {
  background: #e8f5e9;
  color: #26a69a;
}

.status-stopped {
  background: #fff3e0;
  color: #ff9800;
}

.status-not-installed {
  background: #ffebee;
  color: #f44336;
}

.status-checking {
  background: #f5f5f5;
  color: #9e9e9e;
}

.agent-status:hover {
  cursor: pointer;
  opacity: 0.8;
}
</style>
```

## 工作流程说明

### 用户点击回测按钮后的流程：

```
1. 用户点击"回测"按钮
   ↓
2. 检测 Agent 是否运行
   ├─ 是 → 跳到步骤 5
   └─ 否 → 继续步骤 3
   ↓
3. 尝试通过 quant-agent://launch 唤起 Agent
   ↓
4. 等待 2 秒后再次检测
   ├─ 成功启动 → 跳到步骤 5
   └─ 仍未运行 → 提示下载安装
   ↓
5. 提交回测任务到 Agent
   ↓
6. 显示任务状态和结果
```

### Agent 三种状态的处理：

1. **Agent 正在运行** (`AgentStatus.RUNNING`)
   - ✅ 直接提交回测任务
   - 用户体验：无缝衔接

2. **Agent 已安装但未运行** (`AgentStatus.STOPPED`)
   - 🔄 自动通过 `quant-agent://launch` 唤起
   - 等待启动后提交任务
   - 用户体验：稍有延迟（2-3秒）

3. **Agent 未安装** (`AgentStatus.NOT_INSTALLED`)
   - ❌ 提示用户下载安装
   - 显示下载链接
   - 可选：自动打开下载页面
   - 用户体验：需要先安装后再试

## Web 端检测逻辑（完整示例）

```typescript
// 使用示例
import { quantAgentService, AgentStatus } from '@/services/QuantAgentService';

// 方式1: 简单检测
const status = await quantAgentService.checkAgentStatus();
console.log('Agent 状态:', status);

// 方式2: 确保 Agent 运行（推荐）
const result = await quantAgentService.ensureAgentRunning();
if (result.success) {
  console.log('Agent 已就绪，可以提交任务');
  // 提交任务...
} else {
  console.log('Agent 不可用:', result.message);
  if (result.status === AgentStatus.NOT_INSTALLED) {
    // 引导用户下载安装
    window.open(quantAgentService.getDownloadUrl(), '_blank');
  }
}

// 方式3: 直接提交任务（会自动检测和唤起）
try {
  await quantAgentService.submitBacktestTask({
    task_type: 'backtest',
    strategy_id: 'my-strategy',
    params: { /* ... */ }
  });
} catch (error) {
  // 处理错误
}
```

## 调试建议

1. 打开浏览器控制台（F12）查看日志
2. 检查 `http://127.0.0.1:17633/health` 是否可访问
3. 测试自定义协议：在浏览器地址栏输入 `quant-agent://launch`
4. 查看 Network 选项卡中的请求状态

## 下一步扩展

当 Agent 端实现完整的回测功能后，可以扩展：

1. **WebSocket 实时通信**
   - 接收回测进度更新
   - 实时显示日志输出

2. **回测结果可视化**
   - 收益曲线图表
   - 性能指标展示（夏普比率、最大回撤等）

3. **任务管理**
   - 查询历史任务
   - 取消正在运行的任务
   - 导出回测报告
