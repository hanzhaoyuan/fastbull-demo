/**
 * 指标存储
 * 用于在编辑器和图表之间共享指标数据
 */

import { reactive } from 'vue';
import { PlotConfig } from '../services/PineScriptParser';

export interface ActiveIndicator {
  id: string;
  name: string;
  script: string;
  overlay: boolean;
  plots: PlotConfig[];
  createdAt: number;
}

interface IndicatorStore {
  activeIndicators: Map<string, ActiveIndicator>;
  currentSymbol: string;
}

const store = reactive<IndicatorStore>({
  activeIndicators: new Map(),
  currentSymbol: 'EURUSD',
});

export const indicatorStore = {
  /**
   * 添加指标到图表
   */
  addIndicator(indicator: ActiveIndicator) {
    store.activeIndicators.set(indicator.id, indicator);
  },

  /**
   * 移除指标
   */
  removeIndicator(id: string) {
    store.activeIndicators.delete(id);
  },

  /**
   * 获取所有激活的指标
   */
  getActiveIndicators(): ActiveIndicator[] {
    return Array.from(store.activeIndicators.values());
  },

  /**
   * 获取指定品种的指标
   */
  getIndicatorsForSymbol(symbol: string): ActiveIndicator[] {
    // 目前所有指标都应用到当前品种
    // 后续可以扩展为每个品种独立的指标配置
    if (symbol === store.currentSymbol) {
      return this.getActiveIndicators();
    }
    return [];
  },

  /**
   * 清空所有指标
   */
  clearAll() {
    store.activeIndicators.clear();
  },

  /**
   * 设置当前品种
   */
  setCurrentSymbol(symbol: string) {
    store.currentSymbol = symbol;
  },

  /**
   * 订阅指标变化
   */
  subscribe(callback: () => void) {
    // Vue 的 reactive 会自动触发组件更新
    // 这里提供手动订阅接口以备不时之需
    return callback;
  },
};
