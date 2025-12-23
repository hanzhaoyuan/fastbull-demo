<template>
  <div class="app">
    <!-- 左侧导航栏 -->
    <aside class="left-sidebar">
      <div class="sidebar-icon chart-logo" title="图表">
        <svg viewBox="0 0 16 16" width="32" height="32" fill="#76808f">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </div>
      <div class="sidebar-icon" title="交易">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span class="sidebar-label">交易</span>
      </div>
      <div class="sidebar-icon" title="行情">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor"/>
        </svg>
        <span class="sidebar-label">行情</span>
      </div>
      <div class="sidebar-icon" title="跟单">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
        </svg>
        <span class="sidebar-label">跟单</span>
      </div>
      <div class="sidebar-icon badge" title="比赛">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
        </svg>
        <span class="badge-count">1</span>
        <span class="sidebar-label">比赛</span>
      </div>
      <div class="sidebar-icon" title="资讯">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
        </svg>
        <span class="sidebar-label">资讯</span>
      </div>
      <div class="sidebar-icon" title="快讯">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M7 2v11h3v9l7-12h-4l4-8z" fill="currentColor"/>
        </svg>
        <span class="sidebar-label">快讯</span>
      </div>
      <div class="sidebar-icon" title="日历">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" fill="currentColor"/>
        </svg>
        <span class="sidebar-label">日历</span>
      </div>
      <div class="sidebar-icon" title="问答">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <text x="12" y="17" text-anchor="middle" font-size="14" fill="currentColor" font-weight="bold">Ask</text>
        </svg>
        <span class="sidebar-label">问答</span>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部工具栏 -->
      <div class="top-toolbar">
        <div class="toolbar-left">
          <button class="toolbar-btn">
            图表
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
          </button>
          <button class="toolbar-btn icon-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
            </svg>
          </button>
          <button class="toolbar-btn icon-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="3" y="4" width="3" height="16" fill="currentColor"/>
              <rect x="8" y="8" width="3" height="12" fill="currentColor"/>
              <rect x="13" y="2" width="3" height="18" fill="currentColor"/>
              <rect x="18" y="10" width="3" height="10" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div class="toolbar-center">
          <button v-for="tf in timeframes" :key="tf" :class="['timeframe-btn', { active: selectedTimeframe === tf }]" @click="selectedTimeframe = tf">
            {{ tf }}
          </button>
          <button class="timeframe-btn dropdown">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div class="toolbar-right">
          <button class="toolbar-btn icon-btn">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <text x="2" y="18" font-size="16" font-weight="600" fill="currentColor" font-style="italic">f</text>
              <text x="9" y="18" font-size="10" fill="currentColor">x</text>
            </svg>
            指标
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
          </button>
          <button v-for="indicator in indicators" :key="indicator" class="toolbar-btn">{{ indicator }}</button>
          <button class="toolbar-btn icon-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button class="toolbar-btn icon-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
            </svg>
          </button>
          <button class="toolbar-btn icon-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
            </svg>
          </button>
          <button class="toolbar-btn icon-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="chart-wrapper">
        <!-- 左侧绘图工具 -->
        <div class="drawing-tools">
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            </svg>
          </button>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 13H5v-2h14v2z" fill="currentColor"/>
            </svg>
          </button>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M3 17h18v2H3v-2z" fill="currentColor"/>
            </svg>
          </button>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M3 13h8v2H3v-2zm0 4h8v2H3v-2zm0-8h8v2H3V9zm10 0v10l9-5-9-5z" fill="currentColor"/>
            </svg>
          </button>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
            </svg>
          </button>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="currentColor"/>
            </svg>
          </button>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
            </svg>
          </button>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>
            </svg>
          </button>
          <button class="tool-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" rx="2"/>
            </svg>
          </button>
        </div>

        <!-- 图表容器 -->
        <ChartContainer :timeframe="selectedTimeframe" />
      </div>

      <!-- 底部区域 -->
      <div class="bottom-section">
        <div class="bottom-tabs">
          <button class="tab-btn">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            </svg>
            添加交易账户
          </button>
          <button class="tab-btn active">持仓</button>
          <button class="tab-btn">历史</button>
          <button class="tab-btn">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            </svg>
            开户
          </button>
          <div class="tab-actions">
            <button class="action-btn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M19 13H5v-2h14v2z" fill="currentColor"/>
              </svg>
            </button>
            <button class="action-btn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="broker-cards">
          <div class="broker-card">
            <div class="broker-logo green">
              <div class="logo-text">Fast<br/>Bull</div>
            </div>
            <div class="broker-info">
              <div class="broker-name">FastBull</div>
              <div class="broker-desc">体验模拟交易</div>
            </div>
          </div>

          <div class="broker-card recommended">
            <span class="recommend-badge">推荐</span>
            <div class="broker-logo black">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <rect width="3" height="12" x="4" y="6" fill="#FFD700"/>
                <rect width="3" height="16" x="10" y="4" fill="#FFD700"/>
                <rect width="3" height="10" x="17" y="8" fill="#FFD700"/>
              </svg>
            </div>
            <div class="broker-info">
              <div class="broker-name">BeeMarkets</div>
              <div class="broker-desc">佣金 $ 1.5 起，全球最低</div>
            </div>
          </div>
        </div>

        <div class="status-bar">
          <div class="status-left">
            <span class="status-time">00:08:16</span>
            <span class="status-news">美国白宫国家经济委员会主任哈塞特：美联储降息行动远滞落于曲线。</span>
          </div>
          <div class="status-right">
            <span class="status-timezone">01:09:14 UTC+8</span>
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
            <span class="status-ping">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#26a69a"/>
              </svg>
              211ms
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChartContainer from './components/ChartContainer.vue';

const timeframes = ['S1', 'S3', 'M1', 'M15', 'M30', 'H1', 'D1', 'W1', 'MN1'];
const indicators = ['MA', 'Bollinger', 'MACD', 'RSI', 'ATR', 'Stoch', 'MFI', 'Volumes'];
const selectedTimeframe = ref('H1');
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 左侧导航栏 */
.left-sidebar {
  width: 64px;
  background: #ffffff;
  border-right: 1px solid #e0e3eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  gap: 4px;
}

.sidebar-icon {
  width: 48px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #76808f;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  position: relative;
}

.sidebar-icon:hover {
  background: #f0f3fa;
  color: #3b4252;
}

.sidebar-icon.active {
  background: #2962ff;
  color: #ffffff;
}

.sidebar-icon.chart-logo {
  background: transparent;
  cursor: default;
}

.sidebar-icon.chart-logo:hover {
  background: transparent;
  color: #76808f;
}

.sidebar-label {
  font-size: 10px;
  margin-top: 2px;
}

.sidebar-icon.badge .badge-count {
  position: absolute;
  top: 4px;
  right: 8px;
  background: #ef5350;
  color: white;
  font-size: 10px;
  border-radius: 10px;
  padding: 2px 5px;
  min-width: 16px;
  text-align: center;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部工具栏 */
.top-toolbar {
  background: #ffffff;
  border-bottom: 1px solid #e0e3eb;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 12px;
  height: 48px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  background: transparent;
  border: none;
  color: #3b4252;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}

.toolbar-btn:hover {
  background: #f0f3fa;
}

.toolbar-btn.icon-btn {
  padding: 6px;
}

.timeframe-btn {
  background: transparent;
  border: none;
  color: #76808f;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 32px;
}

.timeframe-btn:hover {
  background: #f0f3fa;
  color: #3b4252;
}

.timeframe-btn.active {
  background: #e8f5e9;
  color: #26a69a;
  font-weight: 600;
}

.timeframe-btn.dropdown {
  padding: 4px;
}

/* 图表区域 */
.chart-wrapper {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.drawing-tools {
  width: 48px;
  background: #ffffff;
  border-right: 1px solid #e0e3eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 4px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  color: #76808f;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #f0f3fa;
  color: #3b4252;
}

/* 底部区域 */
.bottom-section {
  background: #ffffff;
  border-top: 1px solid #e0e3eb;
}

.bottom-tabs {
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  border-bottom: 1px solid #e0e3eb;
  height: 40px;
}

.tab-btn {
  background: transparent;
  border: none;
  color: #76808f;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #3b4252;
}

.tab-btn.active {
  color: #2962ff;
  border-bottom-color: #2962ff;
}

.tab-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: #76808f;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f0f3fa;
}

.broker-cards {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
}

.broker-card {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e0e3eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.broker-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.broker-card.recommended {
  background: #fffef0;
  border-color: #ffd54f;
}

.recommend-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ffd54f;
  color: #3b4252;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.broker-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.broker-logo.green {
  background: #26a69a;
  color: white;
}

.broker-logo.black {
  background: #000000;
}

.logo-text {
  font-weight: 700;
  font-size: 11px;
  line-height: 1.2;
  text-align: center;
}

.broker-info {
  flex: 1;
}

.broker-name {
  font-size: 15px;
  font-weight: 600;
  color: #3b4252;
  margin-bottom: 4px;
}

.broker-desc {
  font-size: 12px;
  color: #76808f;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #ffffff;
  border-top: 1px solid #e0e3eb;
  font-size: 12px;
  color: #76808f;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-time {
  font-weight: 600;
  color: #3b4252;
}

.status-news {
  max-width: 600px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-ping {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #26a69a;
  font-weight: 600;
}
</style>
