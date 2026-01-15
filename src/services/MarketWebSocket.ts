/**
 * WebSocket 连接管理类
 * 用于实时行情数据推送
 */

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

type MessageHandler = (data: WebSocketMessage) => void;

export class MarketWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectTimeout: number = 5000; // 5秒后重连
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private heartbeatInterval: number = 30000; // 30秒发送一次心跳
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private isManualClose: boolean = false;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * 连接WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[WebSocket] 正在连接:', this.url);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] 连接成功');
          this.isManualClose = false;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('[WebSocket] 收到消息:', message.type);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] 解析消息失败:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] 连接错误:', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocket] 连接关闭:', event.code, event.reason);
          this.stopHeartbeat();

          // 非手动关闭时，自动重连
          if (!this.isManualClose) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 发送消息
   */
  send(data: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.ws.send(message);
        console.log('[WebSocket] 发送消息:', data);
        return true;
      } catch (error) {
        console.error('[WebSocket] 发送失败:', error);
        return false;
      }
    } else {
      console.warn('[WebSocket] 连接未打开，无法发送消息');
      return false;
    }
  }

  /**
   * 订阅交易品种
   */
  subscribe(symbol: string): void {
    this.send({
      action: 'subscribe',
      symbol: symbol,
    });
  }

  /**
   * 取消订阅
   */
  unsubscribe(): void {
    this.send({
      action: 'unsubscribe',
    });
  }

  /**
   * 注册消息处理器
   */
  on(messageType: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  /**
   * 移除消息处理器
   */
  off(messageType: string, handler?: MessageHandler): void {
    if (!handler) {
      this.messageHandlers.delete(messageType);
    } else {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  /**
   * 处理收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('[WebSocket] 消息处理器执行失败:', error);
        }
      });
    }

    // 处理pong消息
    if (message.type === 'pong') {
      console.log('[WebSocket] 心跳响应');
    }
  }

  /**
   * 开始心跳检测
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      this.send({ action: 'ping' });
    }, this.heartbeatInterval);
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    console.log(`[WebSocket] ${this.reconnectTimeout / 1000}秒后尝试重连...`);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      console.log('[WebSocket] 正在重连...');
      this.connect().catch((error) => {
        console.error('[WebSocket] 重连失败:', error);
      });
    }, this.reconnectTimeout);
  }

  /**
   * 关闭连接
   */
  close(): void {
    this.isManualClose = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('[WebSocket] 已手动关闭');
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// 创建全局实例
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const WS_BASE_URL = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
const MARKET_WS_URL = `${WS_BASE_URL}/ws/market`;

export const marketWebSocket = new MarketWebSocket(MARKET_WS_URL);
