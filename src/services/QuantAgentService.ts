/**
 * Quant Agent 服务
 *
 * 负责检测、唤起和与本地 quant-agent 通信
 */

export interface HealthResponse {
  ok: boolean;
  name: string;
  version: string;
}

export interface TaskRequest {
  task_type: 'backtest' | 'optimize' | 'live_trade';
  strategy_id?: string;
  params?: Record<string, any>;
}

export interface TaskResponse {
  task_id: string;
  status: string;
  message: string;
}

export enum AgentStatus {
  RUNNING = 'running',           // Agent 正在运行
  STOPPED = 'stopped',           // Agent 未运行但已安装
  NOT_INSTALLED = 'not_installed', // Agent 未安装
  CHECKING = 'checking'          // 正在检测中
}

class QuantAgentService {
  private readonly AGENT_URL = 'http://127.0.0.1:17633';
  private readonly AGENT_PROTOCOL = 'quant-agent://launch';
  private readonly HEALTH_CHECK_TIMEOUT = 3000; // 3 秒超时
  private readonly INITIAL_WAIT = 3000; // 唤起后初始等待 3 秒
  private readonly RETRY_DELAY = 2000; // 重试间隔 2 秒
  private readonly MAX_RETRIES = 3; // 最多重试 3 次再检测

  /**
   * 检测 Agent 状态
   */
  async checkAgentStatus(): Promise<AgentStatus> {
    try {
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
      console.log('Agent 未运行:', error);
    }

    return AgentStatus.STOPPED;
  }

  /**
   * 唤起 Agent（通过自定义协议）并等待启动
   */
  async launchAgent(): Promise<boolean> {
    try {
      console.log('尝试通过自定义协议唤起 Agent...');

      // 尝试通过自定义协议唤起
      window.location.href = this.AGENT_PROTOCOL;

      console.log('已发送唤起请求，等待 Agent 启动...');

      // 初始等待时间
      await this.delay(this.INITIAL_WAIT);

      // 重试检测 Agent 是否启动
      for (let i = 1; i <= this.MAX_RETRIES; i++) {
        console.log(`第 ${i}/${this.MAX_RETRIES} 次检查 Agent 状态...`);

        const status = await this.checkAgentStatus();
        if (status === AgentStatus.RUNNING) {
          console.log('✓ Agent 启动成功！');
          return true;
        }

        if (i < this.MAX_RETRIES) {
          console.log(`Agent 尚未就绪，${this.RETRY_DELAY / 1000} 秒后重试...`);
          await this.delay(this.RETRY_DELAY);
        }
      }

      console.log('✗ Agent 未能启动，可能未安装');
      return false;
    } catch (error) {
      console.error('唤起 Agent 失败:', error);
      return false;
    }
  }

  /**
   * 确保 Agent 正在运行
   *
   * @returns Agent 是否可用
   */
  async ensureAgentRunning(): Promise<{
    success: boolean;
    status: AgentStatus;
    message: string;
  }> {
    // 1. 检测 Agent 是否正在运行
    let status = await this.checkAgentStatus();

    if (status === AgentStatus.RUNNING) {
      return {
        success: true,
        status,
        message: 'Agent 已就绪',
      };
    }

    // 2. Agent 未运行，尝试唤起
    console.log('Agent 未运行，尝试唤起...');
    const launched = await this.launchAgent();

    if (launched) {
      return {
        success: true,
        status: AgentStatus.RUNNING,
        message: 'Agent 已成功启动',
      };
    }

    // 3. 唤起失败，可能未安装
    return {
      success: false,
      status: AgentStatus.NOT_INSTALLED,
      message: '请先下载并安装 Quant Agent 客户端',
    };
  }

  /**
   * 发送回测任务
   */
  async submitBacktestTask(taskRequest: TaskRequest): Promise<TaskResponse> {
    const response = await fetch(`${this.AGENT_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 带超时的 fetch
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 获取 Agent 下载链接（根据平台自动选择）
   */
  getDownloadUrl(): string {
    const platform = this.detectPlatform();

    const downloadUrls = {
      'windows': 'https://your-company.com/downloads/QuantAgentSetup-0.1.0.exe',
      'mac': 'https://your-company.com/downloads/QuantAgent-0.1.0.dmg',
      'linux': 'https://your-company.com/downloads/quant-agent-0.1.0-linux.tar.gz'
    };

    return downloadUrls[platform];
  }

  /**
   * 检测当前操作系统平台
   */
  private detectPlatform(): 'windows' | 'mac' | 'linux' {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform.toLowerCase();

    // 检测 Mac
    if (platform.includes('mac') || userAgent.includes('mac')) {
      return 'mac';
    }

    // 检测 Linux
    if (platform.includes('linux') || userAgent.includes('linux')) {
      return 'linux';
    }

    // 默认 Windows
    return 'windows';
  }

  /**
   * 获取当前平台名称（用于显示）
   */
  getPlatformName(): string {
    const platform = this.detectPlatform();
    const platformNames = {
      'windows': 'Windows',
      'mac': 'macOS',
      'linux': 'Linux'
    };
    return platformNames[platform];
  }
}

// 导出单例
export const quantAgentService = new QuantAgentService();
