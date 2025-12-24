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

    <!-- 主图表区域（包含K线图和成交量图） -->
    <div ref="chartContainer" class="main-chart">
      <div ref="markersContainer" class="markers-overlay"></div>
    </div>

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
import { MockDataService } from '../services/MockDataService';

const props = defineProps<{
  timeframe: string;
}>();

const chartContainer = ref<HTMLDivElement>();
const markersContainer = ref<HTMLDivElement>();

let chart: IChartApi | null = null;
let candlestickSeries: ISeriesApi<'Candlestick'> | null = null;
let volumeSeries: ISeriesApi<'Histogram'> | null = null;

// 保存标记定位函数的引用，以便在resize时调用
let positionMarkersFunc: (() => void) | null = null;

const mockDataService = new MockDataService();

/**
 * 初始化图表（包含K线和成交量）
 */
const initChart = () => {
  if (!chartContainer.value) return;

  chart = createChart(chartContainer.value, {
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
        style: 0,
      },
      horzLine: {
        color: '#9598a1',
        width: 1,
        style: 0,
      },
    },
    rightPriceScale: {
      borderColor: '#e0e3eb',
      scaleMargins: {
        top: 0.1,
        bottom: 0.26, // 为成交量预留26%的空间
      },
    },
    timeScale: {
      borderColor: '#e0e3eb',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 6,
      barSpacing: 8,
      fixLeftEdge: true,
      lockVisibleTimeRangeOnResize: true,
    },
    watermark: {
      visible: false,
    },
    width: chartContainer.value.clientWidth,
    height: chartContainer.value.clientHeight,
  });

  // 添加K线系列（占据上方70%空间）
  candlestickSeries = chart.addCandlestickSeries({
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: false,
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
    lastValueVisible: true,
    priceLineVisible: true,
    priceLineColor: '#26a69a',
    priceLineWidth: 1,
    priceLineStyle: 0,
    priceFormat: { type: 'price', precision: 5, minMove: 0.00001 },
  });

  // 添加成交量系列（在同一个图表中，使用独立的价格刻度，占据下方30%空间）
  volumeSeries = chart.addHistogramSeries({
    color: 'rgba(38, 166, 154, 0.5)',
    priceFormat: {
      type: 'volume',
    },
    priceScaleId: 'volume', // 使用独立的价格刻度ID
  });

  // 为成交量设置独立的价格刻度配置
  chart.priceScale('volume').applyOptions({    scaleMargins: {
      top: 0.74, // 成交量图自 74% 起
      bottom: 0,
    },
  });
};

/**
 * 创建自定义的HTML标记（空心橙色圆圈带"C"）
 */
const createCustomMarkers = (volumeData: any[]) => {
  if (!markersContainer.value || !chart) return;

  // 清空现有标记
  markersContainer.value.innerHTML = '';

  // 生成标记位置（示例：每10~22根生成一个）
  const markerIndices: number[] = [];
  for (let i = 15; i < volumeData.length; i += Math.floor(Math.random() * 12 + 10)) {
    markerIndices.push(i);
  }

  const markerData = markerIndices.map(index => ({
    index,
    time: (volumeData[index] && volumeData[index].time) || 0,
  }));

  // 创建HTML标记元素
  markerData.forEach((data) => {
    const el = document.createElement('div');
    el.className = 'calendar-marker';
    el.textContent = 'C';
    el.setAttribute('data-time', String(data.time));
    el.style.visibility = 'hidden';
    markersContainer.value!.appendChild(el);
  });

  // 定位函数：将 time 映射为像素
  const positionMarkers = () => {
    if (!chart || !markersContainer.value || !chartContainer.value) return;
    const timeScale = chart.timeScale();
    const chartWidth = chartContainer.value.clientWidth;
    const chartHeight = chartContainer.value.clientHeight;

    // 使用成交量序列基线(0)的像素坐标，兜底用原先的近底部位置
    const baselineY = volumeSeries?.priceToCoordinate(0);
    const TIME_AXIS_PX = 28;
    const fallbackY = chartHeight - TIME_AXIS_PX;

    const nodes = markersContainer.value.querySelectorAll('.calendar-marker');
    nodes.forEach((node) => {
      const time = parseFloat((node as HTMLElement).getAttribute('data-time') || '0');
      const x = timeScale.timeToCoordinate(time as any);
      if (x != null && x >= 0 && x <= chartWidth) {
        (node as HTMLElement).style.left = x + 'px';
        (node as HTMLElement).style.top = ((baselineY ?? fallbackY)) + 'px';
        (node as HTMLElement).style.visibility = 'visible';
      } else {
        (node as HTMLElement).style.visibility = 'hidden';
      }
    });
  };

  // 保存定位函数引用，供外部调用
  positionMarkersFunc = positionMarkers;

  // 等图表完成渲染后再定位一次
  requestAnimationFrame(() => requestAnimationFrame(positionMarkers));

  // 跟随时间轴缩放滚动
  chart.timeScale().subscribeVisibleTimeRangeChange(() => {
    requestAnimationFrame(positionMarkers);
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
    // 为成交量数据添加颜色（根据涨跌）
    const coloredVolumeData = volumeData.map((item, index) => {
      const candle = candleData[index];
      const color = candle.close >= candle.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)';
      return {
        ...item,
        color: color,
      };
    });
    volumeSeries.setData(coloredVolumeData);
  }

  if (chart) {
    chart.timeScale().fitContent();
    // 设置时间范围完成后创建C事件标记
    createCustomMarkers(volumeData);
  }
};

/**
 * 处理窗口大小变化
 */
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

const handleResize = () => {
  if (!chart || !chartContainer.value) return;

  // 使用防抖优化性能
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  resizeTimeout = setTimeout(() => {
    if (chart && chartContainer.value) {
      const newWidth = chartContainer.value.clientWidth;
      const newHeight = chartContainer.value.clientHeight;

      // 更新图表尺寸
      chart.applyOptions({
        width: newWidth,
        height: newHeight,
      });

      // 强制重新适配时间轴，确保图表正确显示
      chart.timeScale().fitContent();

      // 重新定位C标记
      if (positionMarkersFunc) {
        requestAnimationFrame(() => {
          if (positionMarkersFunc) {
            positionMarkersFunc();
          }
        });
      }
    }
  }, 100); // 100ms 防抖延迟
};

// ResizeObserver 用于监听容器大小变化
let resizeObserver: ResizeObserver | null = null;

// 监听 timeframe 变化
watch(() => props.timeframe, () => {
  loadData();
});

onMounted(() => {
  initChart();
  loadData();

  // 监听 window resize
  window.addEventListener('resize', handleResize);

  // 监听容器自身大小变化（当布局改变时）
  if (chartContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(chartContainer.value);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);

  // 清理防抖定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }

  // 断开 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (chart) {
    chart.remove();
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
  bottom: 50px;
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

.markers-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
  overflow: visible;
}

:deep(.calendar-marker) {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #FF9800;
  border-radius: 50%;
  background-color: #ffffff;
  color: #FF9800;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, calc(2px - 100%));
  cursor: pointer;
  pointer-events: auto;
  visibility: hidden;
  box-sizing: border-box;
  line-height: 1;
}

:deep(.calendar-marker:hover) {
  background-color: rgba(255, 152, 0, 0.15);
}
</style>



