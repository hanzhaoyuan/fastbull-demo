/**
 * 修改说明：QuantitativeEditor.vue 的 backtest 函数
 *
 * 找到 QuantitativeEditor.vue 文件中的 backtest 函数（大约在第 806-809 行）
 * 将下面的 OLD CODE 替换为 NEW CODE
 */

// ========== OLD CODE (原代码) ==========
// 回测
const backtest = () => {
  terminalOutput.value.push('> 启动回测...');
  // TODO: 实现回测逻辑
};

// ========== NEW CODE (新代码) ==========
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
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        initial_capital: 100000,
      },
    };

    terminalOutput.value.push('> 提交回测任务到 Agent...');

    // 4. 提交回测任务
    const response = await quantAgentService.submitBacktestTask(taskRequest);

    terminalOutput.value.push(`> 任务ID: ${response.task_id}`);
    terminalOutput.value.push(`> 状态: ${response.status}`);
    terminalOutput.value.push(`> ${response.message}`);

  } catch (error) {
    console.error('回测失败:', error);
    terminalOutput.value.push(`> 回测失败: ${error}`);
  }
};


/**
 * 在文件顶部导入部分（约 370-372 行）添加导入
 */

// ========== OLD CODE (原导入) ==========
import {ref, computed, onMounted, onUnmounted, nextTick} from 'vue';
import * as monaco from 'monaco-editor';

// ========== NEW CODE (新导入) ==========
import {ref, computed, onMounted, onUnmounted, nextTick} from 'vue';
import * as monaco from 'monaco-editor';
import { quantAgentService, AgentStatus } from '../services/QuantAgentService';
