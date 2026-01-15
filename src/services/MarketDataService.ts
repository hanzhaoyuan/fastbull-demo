/**
 * 市场数据API服务
 */
import { apiFetch } from '../config/api';

/**
 * K线查询请求参数
 */
export interface KlineQueryRequest {
  symbol: string;      // 交易品种: EURUSD, GBPUSD, XAUUSD, USDX
  timeframe: string;   // 时间周期: 1m, 5m, 15m, 1h, 4h, 1d
  startTime?: string;  // 开始时间（可选）
  endTime?: string;    // 结束时间（可选）
  limit?: number;      // 限制条数（可选，默认100）
}

/**
 * K线数据
 */
export interface KlineData {
  time: number;        // 时间戳（毫秒）
  open: number;        // 开盘价
  high: number;        // 最高价
  low: number;         // 最低价
  close: number;       // 收盘价
  volume: number;      // 成交量
}

/**
 * 实时报价数据
 */
export interface MarketTick {
  symbol: string;      // 交易品种
  bid: number;         // 买价
  ask: number;         // 卖价
  lastPrice: number;   // 最新价
  spread: number;      // 点差
  timestamp: number;   // 报价时间（毫秒时间戳）
  changePercent?: number; // 涨跌幅
}

/**
 * API响应结构
 */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 市场数据服务类
 */
export class MarketDataService {
  /**
   * 查询K线数据
   */
  static async queryKline(request: KlineQueryRequest): Promise<KlineData[]> {
    const response = await apiFetch<ApiResponse<KlineData[]>>('/market/kline', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (response.code === 200) {
      return response.data;
    } else {
      throw new Error(response.message || '查询K线数据失败');
    }
  }

  /**
   * 获取所有实时报价
   */
  static async getAllTicks(): Promise<MarketTick[]> {
    const response = await apiFetch<ApiResponse<MarketTick[]>>('/market/tick/all', {
      method: 'GET',
    });

    if (response.code === 200) {
      return response.data;
    } else {
      throw new Error(response.message || '获取实时报价失败');
    }
  }

  /**
   * 获取指定品种的实时报价
   */
  static async getTickBySymbol(symbol: string): Promise<MarketTick> {
    const response = await apiFetch<ApiResponse<MarketTick>>(`/market/tick/${symbol}`, {
      method: 'GET',
    });

    if (response.code === 200) {
      return response.data;
    } else {
      throw new Error(response.message || `获取${symbol}实时报价失败`);
    }
  }

  /**
   * 获取所有可用的交易品种
   */
  static async getAllSymbols(): Promise<string[]> {
    const response = await apiFetch<ApiResponse<string[]>>('/market/symbols', {
      method: 'GET',
    });

    if (response.code === 200) {
      return response.data;
    } else {
      throw new Error(response.message || '获取交易品种列表失败');
    }
  }
}

export default MarketDataService;
