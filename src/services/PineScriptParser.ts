/**
 * Pine Script 指标解析器（简化版）
 * 支持基础指标如 MA, EMA, MACD 等
 */

export interface IndicatorConfig {
  id: string;
  name: string;
  type: 'overlay' | 'separate'; // overlay: 叠加在主图, separate: 独立图表
  script: string;
  color?: string;
  lineWidth?: number;
}

export interface IndicatorData {
  time: number;
  value: number | null;
}

export interface PlotConfig {
  name: string;
  color: string;
  lineWidth: number;
  data: IndicatorData[];
}

/**
 * Pine Script 解析器
 */
export class PineScriptParser {
  /**
   * 解析Pine Script代码
   */
  static parse(script: string): {
    title: string;
    overlay: boolean;
    plots: string[];
  } {
    const lines = script.split('\n');
    let title = 'Custom Indicator';
    let overlay = true; // 默认叠加在主图
    const plots: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // 解析 indicator() 函数
      if (trimmed.startsWith('indicator(')) {
        const match = trimmed.match(/indicator\s*\(\s*["']([^"']+)["']/);
        if (match) {
          title = match[1];
        }

        // 检查overlay参数
        if (trimmed.includes('overlay')) {
          const overlayMatch = trimmed.match(/overlay\s*[=:]\s*(true|false)/);
          if (overlayMatch) {
            overlay = overlayMatch[1] === 'true';
          }
        }
      }

      // 解析 plot() 函数
      if (trimmed.includes('plot(')) {
        plots.push(trimmed);
      }
    }

    return { title, overlay, plots };
  }

  /**
   * 计算指标数据
   */
  static calculate(
    script: string,
    klineData: Array<{ time: number; open: number; high: number; low: number; close: number }>
  ): PlotConfig[] {
    const { plots } = this.parse(script);
    const results: PlotConfig[] = [];

    for (const plotLine of plots) {
      // 提取plot参数
      const match = plotLine.match(/plot\s*\(([^)]+)\)/);
      if (!match) continue;

      const param = match[1].trim();
      const plotData = this.evaluatePlot(param, klineData);

      if (plotData) {
        results.push(plotData);
      }
    }

    return results;
  }

  /**
   * 评估plot表达式
   */
  private static evaluatePlot(
    expression: string,
    klineData: Array<{ time: number; open: number; high: number; low: number; close: number }>
  ): PlotConfig | null {
    // 简单的表达式解析
    const expr = expression.toLowerCase();

    // 直接绘制价格线
    if (expr === 'close') {
      return {
        name: 'Close',
        color: '#2962FF',
        lineWidth: 2,
        data: klineData.map(k => ({ time: k.time / 1000, value: k.close })),
      };
    }

    if (expr === 'open') {
      return {
        name: 'Open',
        color: '#FF6D00',
        lineWidth: 2,
        data: klineData.map(k => ({ time: k.time / 1000, value: k.open })),
      };
    }

    if (expr === 'high') {
      return {
        name: 'High',
        color: '#00C853',
        lineWidth: 2,
        data: klineData.map(k => ({ time: k.time / 1000, value: k.high })),
      };
    }

    if (expr === 'low') {
      return {
        name: 'Low',
        color: '#D50000',
        lineWidth: 2,
        data: klineData.map(k => ({ time: k.time / 1000, value: k.low })),
      };
    }

    // SMA - 简单移动平均线
    const smaMatch = expr.match(/sma\s*\(\s*close\s*,\s*(\d+)\s*\)/);
    if (smaMatch) {
      const period = parseInt(smaMatch[1]);
      return {
        name: `SMA(${period})`,
        color: '#2962FF',
        lineWidth: 2,
        data: this.calculateSMA(klineData, period),
      };
    }

    // EMA - 指数移动平均线
    const emaMatch = expr.match(/ema\s*\(\s*close\s*,\s*(\d+)\s*\)/);
    if (emaMatch) {
      const period = parseInt(emaMatch[1]);
      return {
        name: `EMA(${period})`,
        color: '#FF6D00',
        lineWidth: 2,
        data: this.calculateEMA(klineData, period),
      };
    }

    return null;
  }

  /**
   * 计算SMA（简单移动平均）
   */
  private static calculateSMA(
    klineData: Array<{ time: number; close: number }>,
    period: number
  ): IndicatorData[] {
    const result: IndicatorData[] = [];

    for (let i = 0; i < klineData.length; i++) {
      if (i < period - 1) {
        result.push({ time: klineData[i].time / 1000, value: null });
        continue;
      }

      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += klineData[i - j].close;
      }

      result.push({
        time: klineData[i].time / 1000,
        value: sum / period,
      });
    }

    return result;
  }

  /**
   * 计算EMA（指数移动平均）
   */
  private static calculateEMA(
    klineData: Array<{ time: number; close: number }>,
    period: number
  ): IndicatorData[] {
    const result: IndicatorData[] = [];
    const multiplier = 2 / (period + 1);
    let ema = 0;

    for (let i = 0; i < klineData.length; i++) {
      if (i < period - 1) {
        result.push({ time: klineData[i].time / 1000, value: null });
        continue;
      }

      if (i === period - 1) {
        // 第一个EMA值等于SMA
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += klineData[i - j].close;
        }
        ema = sum / period;
      } else {
        // EMA = (Close - EMA(previous)) * multiplier + EMA(previous)
        ema = (klineData[i].close - ema) * multiplier + ema;
      }

      result.push({
        time: klineData[i].time / 1000,
        value: ema,
      });
    }

    return result;
  }
}
