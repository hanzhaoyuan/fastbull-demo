export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  time: number;
  value: number;
  color: string;
}

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
      const time = now - i * interval;

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
