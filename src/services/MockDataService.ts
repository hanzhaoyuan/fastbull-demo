import { Time } from 'lightweight-charts';

export interface CandlestickData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  time: Time;
  value: number;
  color: string;
}

export interface TimeInterval {
  value: string;
  label: string;
}

export const TIME_INTERVALS: TimeInterval[] = [
  { value: 'S1', label: '1秒' },
  { value: 'S3', label: '3秒' },
  { value: 'M1', label: '1分钟' },
  { value: 'M15', label: '15分钟' },
  { value: 'M30', label: '30分钟' },
  { value: 'H1', label: '1小时' },
  { value: 'D1', label: '1天' },
  { value: 'W1', label: '1周' },
  { value: 'MN1', label: '1月' },
];

export class MockDataService {
  private basePrice = 0.66928;
  private volatility = 0.0005;

  /**
   * 生成 AUDUSD K线数据
   */
  generateCandlestickData(count: number, interval: number): CandlestickData[] {
    const data: CandlestickData[] = [];
    const now = Math.floor(Date.now() / 1000);
    let currentPrice = this.basePrice;

    for (let i = count - 1; i >= 0; i--) {
      const time = (now - i * interval) as Time;

      const change = (Math.random() - 0.5) * this.volatility * currentPrice;
      const open = currentPrice;
      const close = currentPrice + change;

      const high = Math.max(open, close) + Math.random() * 0.00005 * currentPrice;
      const low = Math.min(open, close) - Math.random() * 0.00005 * currentPrice;

      data.push({
        time,
        open: parseFloat(open.toFixed(5)),
        high: parseFloat(high.toFixed(5)),
        low: parseFloat(low.toFixed(5)),
        close: parseFloat(close.toFixed(5)),
      });

      currentPrice = close;
    }

    return data;
  }

  /**
   * 生成成交量数据
   */
  generateVolumeData(candlestickData: CandlestickData[]): VolumeData[] {
    return candlestickData.map((candle) => ({
      time: candle.time,
      value: parseFloat((Math.random() * 500 + 200).toFixed(2)),
      color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
    }));
  }
}
