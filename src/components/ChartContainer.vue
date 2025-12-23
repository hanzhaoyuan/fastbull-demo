<template>
  <div class="chart-container">
    <!-- 顶部信息栏 -->
    <div class="chart-header">
      <div class="symbol-section">
        <div class="symbol-icon">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <circle cx="12" cy="12" r="10" fill="#FFD700"/>
          </svg>
        </div>
        <span class="symbol-name">Australian Dollar vs US Dollar, H1,</span>
        <span class="symbol-status">不复权 ●</span>
        <span class="price-label">开 = <span class="price-value up">0.66928</span></span>
        <span class="price-label">高 = <span class="price-value up">0.66943</span></span>
        <span class="price-label">低 = <span class="price-value up">0.66921</span></span>
        <span class="price-label">收 = <span class="price-value up">0.66934</span></span>
        <span class="price-label">V <span class="volume-value">309</span></span>
        <span class="price-change up">+0.00005 (+0.01%)</span>
      </div>
      <div class="current-price">0.67045</div>
    </div>

    <!-- 主图表区域 -->
    <div ref="mainChartContainer" class="main-chart"></div>

    <!-- 成交量图表区域 -->
    <div ref="volumeChartContainer" class="volume-chart"></div>

    <!-- 图表底部标签 -->
    <div class="chart-footer">
      <div class="chart-tabs">
        <button class="chart-tab active">
          <span class="tab-close">×</span>
          AUDUSD, H1
        </button>
        <button class="chart-tab-add">+</button>
      </div>
      <div class="chart-actions">
        <button class="chart-action-btn">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <button class="chart-action-btn">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <rect x="3" y="3" width="8" height="18" fill="none" stroke="currentColor" stroke-width="2"/>
            <rect x="13" y="3" width="8" height="18" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <button class="chart-action-btn">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 设置按钮 -->
    <button class="settings-btn">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill="currentColor"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { MockDataService, type CandlestickData } from '../services/MockDataService';

const props = defineProps<{
  timeframe: string;
}>();

const mainChartContainer = ref<HTMLDivElement>();
const volumeChartContainer = ref<HTMLDivElement>();

let mainChart: IChartApi | null = null;
let volumeChart: IChartApi | null = null;
let candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
let volumeSeries: ISeriesApi<'Histogram'> | null = null;

const mockDataService = new MockDataService();

/**
 * 初始化主图表
 */
const initMainChart = () => {
  if (!mainChartContainer.value) return;

  mainChart = createChart(mainChartContainer.value, {
    layout: {
      background: { color: '#ffffff' },
      textColor: '#76808f',
    },
    grid: {
      vertLines: { color: '#f0f3fa' },
      horzLines: { color: '#f0f3fa' },
    },
    crosshair: {
      mode: 1,
      vertLine: {
        color: '#9598a1',
        width: 1,
        style: 3,
      },
      horzLine: {
        color: '#9598a1',
        width: 1,
        style: 3,
      },
    },
    rightPriceScale: {
      borderColor: '#e0e3eb',
      textColor: '#76808f',
    },
    timeScale: {
      borderColor: '#e0e3eb',
      timeVisible: true,
      secondsVisible: false,
    },
    watermark: {
      visible: false,
    },
    width: mainChartContainer.value.clientWidth,
    height: mainChartContainer.value.clientHeight,
  });

  candlestickSeries = mainChart.addCandlestickSeries({
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: false,
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
  });
};

/**
 * 初始化成交量图表
 */
const initVolumeChart = () => {
  if (!volumeChartContainer.value) return;

  volumeChart = createChart(volumeChartContainer.value, {
    layout: {
      background: { color: '#ffffff' },
      textColor: '#76808f',
    },
    grid: {
      vertLines: { color: '#f0f3fa' },
      horzLines: { color: '#f0f3fa' },
    },
    rightPriceScale: {
      borderColor: '#e0e3eb',
      scaleMargins: {
        top: 0.1,
        bottom: 0.2,
      },
    },
    timeScale: {
      borderColor: '#e0e3eb',
      visible: false,
    },
    watermark: {
      visible: false,
    },
    width: volumeChartContainer.value.clientWidth,
    height: 150,
  });

  volumeSeries = volumeChart.addHistogramSeries({
    priceFormat: {
      type: 'volume',
    },
    priceScaleId: '',
  });
};

/**
 * 加载数据
 */
const loadData = () => {
  const intervalMap: Record<string, number> = {
    'S1': 1,
    'S3': 3,
    'M1': 60,
    'M15': 900,
    'M30': 1800,
    'H1': 3600,
    'D1': 86400,
    'W1': 604800,
    'MN1': 2592000,
  };

  const interval = intervalMap[props.timeframe] || 3600;
  const candleData = mockDataService.generateCandlestickData(200, interval);
  const volumeData = mockDataService.generateVolumeData(candleData);

  if (candlestickSeries) {
    candlestickSeries.setData(candleData);
  }

  if (volumeSeries) {
    volumeSeries.setData(volumeData);

    // 在成交量图上添加带"C"的橙色圆圈标记
    const volumeMarkers = [];
    for (let i = 15; i < volumeData.length; i += Math.floor(Math.random() * 12 + 10)) {
      volumeMarkers.push({
        time: volumeData[i].time,
        position: 'aboveBar',
        color: '#FF9800',
        shape: 'circle',
        text: 'C',
      });
    }
    volumeSeries.setMarkers(volumeMarkers);
  }

  // 同步时间轴
  if (mainChart && volumeChart) {
    mainChart.timeScale().fitContent();
    volumeChart.timeScale().fitContent();

    // 同步缩放和滚动
    mainChart.timeScale().subscribeVisibleLogicalRangeChange((timeRange) => {
      if (timeRange && volumeChart) {
        volumeChart.timeScale().setVisibleLogicalRange(timeRange);
      }
    });
  }
};

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  if (mainChart && mainChartContainer.value) {
    mainChart.applyOptions({
      width: mainChartContainer.value.clientWidth,
      height: mainChartContainer.value.clientHeight,
    });
  }
  if (volumeChart && volumeChartContainer.value) {
    volumeChart.applyOptions({
      width: volumeChartContainer.value.clientWidth,
      height: 150,
    });
  }
};

// 监听 timeframe 变化
watch(() => props.timeframe, () => {
  loadData();
});

onMounted(() => {
  initMainChart();
  initVolumeChart();
  loadData();  // 在两个图表都初始化后再加载数据
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (mainChart) {
    mainChart.remove();
  }
  if (volumeChart) {
    volumeChart.remove();
  }
});
</script>

<style scoped>
.chart-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  position: relative;
  min-height: 0;
  overflow: hidden;
}

.chart-header {
  background: #ffffff;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e3eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.symbol-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.symbol-icon {
  display: flex;
  align-items: center;
}

.symbol-name {
  color: #3b4252;
  font-weight: 500;
}

.symbol-status {
  color: #76808f;
}

.price-label {
  color: #76808f;
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-value {
  color: #3b4252;
  font-weight: 600;
}

.price-value.up {
  color: #26a69a;
}

.price-value.down {
  color: #ef5350;
}

.volume-value {
  color: #3b4252;
  font-weight: 600;
}

.price-change {
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
}

.price-change.up {
  color: #26a69a;
  background: rgba(38, 166, 154, 0.1);
}

.price-change.down {
  color: #ef5350;
  background: rgba(239, 83, 80, 0.1);
}

.current-price {
  background: #26a69a;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}

.main-chart {
  flex: 1;
  min-height: 200px;
  position: relative;
}

.volume-chart {
  height: 150px;
  min-height: 150px;
  flex-shrink: 0;
  border-top: 1px solid #e0e3eb;
  background: #fafbfc;
}

.chart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #fafbfc;
  border-top: 1px solid #e0e3eb;
}

.chart-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chart-tab {
  background: #ffffff;
  border: 1px solid #e0e3eb;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #3b4252;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.chart-tab:hover {
  background: #f0f3fa;
}

.chart-tab.active {
  background: #e8f5e9;
  border-color: #26a69a;
  color: #26a69a;
}

.tab-close {
  font-size: 18px;
  line-height: 1;
  opacity: 0.5;
}

.tab-close:hover {
  opacity: 1;
}

.chart-tab-add {
  background: transparent;
  border: none;
  color: #76808f;
  font-size: 18px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.chart-tab-add:hover {
  background: #f0f3fa;
  color: #3b4252;
}

.chart-actions {
  display: flex;
  gap: 4px;
}

.chart-action-btn {
  background: transparent;
  border: none;
  color: #76808f;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.chart-action-btn:hover {
  background: #f0f3fa;
  color: #3b4252;
}

.settings-btn {
  position: absolute;
  bottom: 140px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e0e3eb;
  border-radius: 6px;
  color: #76808f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.settings-btn:hover {
  background: #f0f3fa;
  color: #3b4252;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
</style>
