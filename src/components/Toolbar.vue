<template>
  <div class="toolbar">
    <!-- 时间周期选择 -->
    <div class="toolbar-section">
      <div class="section-label">时间周期</div>
      <div class="button-group">
        <button
            v-for="interval in intervals"
            :key="interval.value"
            :class="['btn', { active: selectedInterval === interval.value }]"
            @click="$emit('interval-change', interval.value)"
        >
          {{ interval.label }}
        </button>
      </div>
    </div>

    <!-- 图表类型 -->
    <div class="toolbar-section">
      <div class="section-label">图表类型</div>
      <div class="button-group">
        <button
            :class="['btn', { active: chartType === 'candlestick' }]"
            @click="$emit('chart-type-change', 'candlestick')"
        >
          K线图
        </button>
        <button
            :class="['btn', { active: chartType === 'line' }]"
            @click="$emit('chart-type-change', 'line')"
        >
          折线图
        </button>
      </div>
    </div>

    <!-- 技术指标 -->
    <div class="toolbar-section">
      <div class="section-label">技术指标</div>
      <div class="button-group">
        <button class="btn">MA</button>
        <button class="btn">BOLL</button>
        <button class="btn">MACD</button>
        <button class="btn">KDJ</button>
      </div>
    </div>

    <!-- 绘图工具 -->
    <div class="toolbar-section">
      <div class="section-label">绘图工具</div>
      <div class="button-group">
        <button class="btn tool-btn">
          <svg class="icon" viewBox="0 0 24 24">
            <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="currentColor"/>
          </svg>
        </button>
        <button class="btn tool-btn">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3zm0 16h18v2H3zm6-8l-6 6h18z" fill="currentColor"/>
          </svg>
        </button>
        <button class="btn tool-btn">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
                  fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {TIME_INTERVALS, type TimeInterval} from '../services/MockDataService';

defineProps<{
  selectedInterval: string;
  chartType: string;
}>();

defineEmits<{
  'interval-change': [value: string];
  'chart-type-change': [value: string];
}>();

const intervals: TimeInterval[] = TIME_INTERVALS;
</script>

<style scoped>
.toolbar {
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 12px 16px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label {
  color: #666666;
  font-size: 12px;
  font-weight: 500;
  margin-right: 4px;
}

.button-group {
  display: flex;
  gap: 4px;
}

.btn {
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
  color: #333333;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:hover {
  background: #e0e0e0;
  border-color: #d0d0d0;
}

.btn.active {
  background: #2962ff;
  border-color: #2962ff;
  color: #ffffff;
}

.tool-btn {
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
