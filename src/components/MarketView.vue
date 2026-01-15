<template>
  <div class="market-view">
    <!-- 顶部工具栏 -->
    <div class="market-toolbar">
      <div class="symbol-selector">
        <label>交易品种:</label>
        <select v-model="selectedSymbol" @change="onSymbolChange">
          <option value="EURUSD">EURUSD - 欧元/美元</option>
          <option value="GBPUSD">GBPUSD - 英镑/美元</option>
          <option value="XAUUSD">XAUUSD - 黄金</option>
          <option value="USDX">USDX - 美元指数</option>
        </select>
      </div>

      <div class="timeframe-selector">
        <label>时间周期:</label>
        <select v-model="selectedTimeframe" @change="onTimeframeChange">
          <option value="1d">日线</option>
          <option value="4h">4小时</option>
          <option value="1h">1小时</option>
          <option value="15m">15分钟</option>
          <option value="5m">5分钟</option>
          <option value="1m">1分钟</option>
        </select>
      </div>

      <div class="data-range">
        <label>数据量:</label>
        <select v-model="dataLimit" @change="loadKlineData">
          <option :value="100">最近100条</option>
          <option :value="200">最近200条</option>
          <option :value="500">最近500条</option>
          <option :value="1000">全部数据</option>
        </select>
      </div>

      <div class="realtime-price" v-if="realtimeTick">
        <span class="label">实时价格:</span>
        <span class="price">{{ realtimeTick.lastPrice.toFixed(5) }}</span>
        <span class="spread">点差: {{ realtimeTick.spread.toFixed(5) }}</span>
      </div>

      <button class="refresh-btn" @click="refreshData" :disabled="loading">
        {{ loading ? '加载中...' : '刷新数据' }}
      </button>
    </div>

    <!-- K线图表容器 -->
    <div class="chart-container" ref="chartContainer"></div>

    <!-- 数据统计 -->
    <div class="market-stats" v-if="klineData.length > 0">
      <div class="stat-item">
        <span class="stat-label">数据条数:</span>
        <span class="stat-value">{{ klineData.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">时间范围:</span>
        <span class="stat-value">
          {{ formatDate(klineData[0].time) }} ~ {{ formatDate(klineData[klineData.length - 1].time) }}
        </span>
      </div>
      <div class="stat-item" v-if="currentBar">
        <span class="stat-label">当前K线:</span>
        <span class="stat-value">
          O: {{ currentBar.open.toFixed(5) }} |
          H: {{ currentBar.high.toFixed(5) }} |
          L: {{ currentBar.low.toFixed(5) }} |
          C: {{ currentBar.close.toFixed(5) }}
        </span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import MarketDataService, { KlineData, MarketTick } from '../services/MarketDataService';

// 状态
const selectedSymbol = ref('EURUSD');
const selectedTimeframe = ref('1d');
const dataLimit = ref(100);
const klineData = ref<KlineData[]>([]);
const realtimeTick = ref<MarketTick | null>(null);
const currentBar = ref<KlineData | null>(null);
const loading = ref(false);
const error = ref('');

// 图表相关
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let candleSeries: ISeriesApi<'Candlestick'> | null = null;
let updateInterval: number | null = null;

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;

  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 600,
    layout: {
      background: { color: '#1e1e1e' },
      textColor: '#d1d4dc',
    },
    grid: {
      vertLines: { color: '#2B2B43' },
      horzLines: { color: '#363C4E' },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
  });

  candleSeries = chart.addCandlestickSeries({
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: false,
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
  });

  // 响应式调整大小
  window.addEventListener('resize', handleResize);
};

// 处理窗口大小调整
const handleResize = () => {
  if (chart && chartContainer.value) {
    chart.applyOptions({
      width: chartContainer.value.clientWidth,
    });
  }
};

// 加载K线数据
const loadKlineData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const data = await MarketDataService.queryKline({
      symbol: selectedSymbol.value,
      timeframe: selectedTimeframe.value,
      limit: dataLimit.value,
    });

    klineData.value = data;

    // 更新图表
    if (candleSeries && data.length > 0) {
      const chartData: CandlestickData[] = data.map(item => ({
        time: item.time / 1000, // lightweight-charts使用秒级时间戳
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      candleSeries.setData(chartData);
      currentBar.value = data[data.length - 1];
    }
  } catch (err: any) {
    error.value = err.message || '加载K线数据失败';
    console.error('加载K线数据失败:', err);
  } finally {
    loading.value = false;
  }
};

// 加载实时报价
const loadRealtimeTick = async () => {
  try {
    const tick = await MarketDataService.getTickBySymbol(selectedSymbol.value);
    realtimeTick.value = tick;
  } catch (err) {
    console.error('加载实时报价失败:', err);
  }
};

// 刷新数据
const refreshData = () => {
  loadKlineData();
  loadRealtimeTick();
};

// 品种切换
const onSymbolChange = () => {
  loadKlineData();
  loadRealtimeTick();
};

// 周期切换
const onTimeframeChange = () => {
  loadKlineData();
};

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN');
};

// 组件挂载
onMounted(() => {
  initChart();
  loadKlineData();
  loadRealtimeTick();

  // 定时刷新实时报价（每10秒）
  updateInterval = window.setInterval(() => {
    loadRealtimeTick();
  }, 10000);
});

// 组件卸载
onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  if (chart) {
    chart.remove();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.market-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background: #1e1e1e;
  color: #d1d4dc;
}

.market-toolbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: #2a2a2a;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.symbol-selector,
.timeframe-selector,
.data-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.market-toolbar label {
  font-weight: 500;
  color: #d1d4dc;
}

.market-toolbar select {
  padding: 6px 12px;
  background: #1e1e1e;
  color: #d1d4dc;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.market-toolbar select:hover {
  border-color: #6a6a6a;
}

.realtime-price {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background: #363636;
  border-radius: 4px;
  margin-left: auto;
}

.realtime-price .label {
  color: #888;
}

.realtime-price .price {
  font-size: 18px;
  font-weight: bold;
  color: #26a69a;
}

.realtime-price .spread {
  font-size: 12px;
  color: #aaa;
}

.refresh-btn {
  padding: 8px 16px;
  background: #4a9eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #3a8eef;
}

.refresh-btn:disabled {
  background: #555;
  cursor: not-allowed;
}

.chart-container {
  flex: 1;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.market-stats {
  display: flex;
  gap: 30px;
  padding: 15px;
  background: #2a2a2a;
  border-radius: 8px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  gap: 8px;
}

.stat-label {
  color: #888;
  font-size: 14px;
}

.stat-value {
  color: #d1d4dc;
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  padding: 12px;
  background: #ff5252;
  color: white;
  border-radius: 4px;
  margin-top: 10px;
  text-align: center;
}
</style>
