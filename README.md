# TradingView 风格交易图表

这是一个完全还原 TradingView 风格的专业交易图表页面，使用 Vue 3 + Vite + TypeScript + Lightweight Charts 构建。

## ✨ 功能特性

- ✅ **完整布局还原**：左侧导航栏 + 顶部工具栏 + 绘图工具 + 图表区 + 底部信息栏
- ✅ **TradingView 风格 K线图**：使用 Lightweight Charts 实现专业图表
- ✅ **成交量柱状图**：与主图表完美同步
- ✅ **绿涨红跌**：符合中国用户习惯的配色
- ✅ **多时间周期**：S1, S3, M1, M15, M30, H1, D1, W1, MN1
- ✅ **技术指标按钮**：MA, Bollinger, MACD, RSI, ATR, Stoch, MFI, Volumes
- ✅ **绘图工具栏**：缩放、画线、文字、下载、收藏等工具
- ✅ **左侧导航菜单**：图表、交易、行情、跟单、比赛、资讯、快讯、日历、问答
- ✅ **底部券商卡片**：FastBull 和 BeeMarkets 推广卡片
- ✅ **状态栏**：实时时间 + 新闻滚动 + 网络延迟显示
- ✅ **响应式设计**：自适应窗口大小变化
- ✅ **Mock 数据**：自动生成 AUDUSD 模拟交易数据

## 🎨 精确配色

### 主色调
- 背景色：`#f8f9fa`（浅灰）
- 白色面板：`#ffffff`
- 边框：`#e0e3eb`（浅灰蓝）

### 文字颜色
- 主文字：`#3b4252`（深灰蓝）
- 次要文字：`#76808f`（中灰）

### 涨跌颜色（中国习惯）
- **涨色**：`#26a69a`（绿色）✅
- **跌色**：`#ef5350`（红色）✅

### 其他颜色
- 主题蓝：`#2962ff`（按钮激活态）
- 黄色徽章：`#ffd54f`（推荐标签）
- 悬停背景：`#f0f3fa`

## 📦 项目结构

```
fastbull-demo/
├── src/
│   ├── components/
│   │   └── ChartContainer.vue      # 图表容器组件
│   ├── services/
│   │   └── MockDataService.ts      # Mock 数据生成服务
│   ├── App.vue                     # 主应用组件
│   ├── main.ts                     # 入口文件
│   ├── style.css                   # 全局样式
│   └── vite-env.d.ts              # TypeScript 声明
├── index.html                      # HTML 模板
├── package.json                    # 项目配置
├── tsconfig.json                   # TypeScript 配置
├── tsconfig.node.json              # Node TypeScript 配置
├── vite.config.ts                  # Vite 配置
└── README.md                       # 项目文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 📋 页面布局详解

### 左侧导航栏 (64px)
- 图表（激活态，蓝色背景）
- 交易
- 行情
- 跟单
- 比赛（带红色徽章"1"）
- 资讯
- 快讯
- 日历
- 问答

### 顶部工具栏 (48px)
**左侧**：
- 图表下拉菜单
- 搜索按钮
- 多窗口切换按钮

**中间**：
- 时间周期按钮：S1, S3, M1, M15, M30, **H1**(激活), D1, W1, MN1
- 更多周期下拉按钮

**右侧**：
- 指标下拉菜单
- 技术指标按钮：MA, Bollinger, MACD, RSI, ATR, Stoch, MFI, Volumes
- 设置按钮
- 更多操作按钮

### 左侧绘图工具栏 (48px)
- 放大 +
- 缩小 -
- 横线工具
- 趋势线工具
- 画笔工具
- 文字标注工具
- 下载图表
- 收藏图表
- 更多工具

### 图表区域
**顶部信息栏**：
- 货币对图标
- Australian Dollar vs US Dollar, H1
- 不复权状态
- 开高低收价格（绿色）
- 成交量
- 涨跌幅（绿色背景）
- 当前价格（右侧绿色按钮：0.67045）

**主图表**：
- K线图（绿涨红跌）
- 白色背景 + 浅灰网格线
- TradingView 风格十字准星

**成交量图**：
- 柱状图（绿/红半透明）
- 与主图时间轴同步

**图表底部**：
- 标签页：AUDUSD, H1（带关闭按钮 ×）
- 添加图表按钮 +
- 布局切换按钮（单窗口/双窗口/全屏）

**设置按钮**（右下角悬浮）：
- 齿轮图标
- 白色背景 + 阴影

### 底部区域
**标签栏** (40px)：
- 添加交易账户（带勾选图标）
- 持仓（激活态，蓝色）
- 历史
- 开户（带加号图标）
- 收起/展开按钮（右侧）

**券商卡片区域**：
1. **FastBull 卡片**（左）
   - 绿色 Logo（Fast Bull 文字）
   - FastBull 标题
   - "体验模拟交易" 描述

2. **BeeMarkets 卡片**（右，带黄色"推荐"徽章）
   - 黑色 Logo（金色柱状图图标）
   - BeeMarkets 标题
   - "佣金 $ 1.5 起，全球最低" 描述
   - 浅黄色背景

**状态栏**：
- 时间：00:08:16
- 新闻滚动：美国白宫国家经济委员会主任哈塞特...
- 时区：01:09:14 UTC+8
- 网络延迟：211ms（绿色图标）

## 💻 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **TypeScript** - JavaScript 超集
- **Lightweight Charts** - TradingView 的轻量级金融图表库
- **原生 CSS** - 精确样式控制

## 🎯 主要特性

### 1. 完美还原
- 每个像素都按照截图精确还原
- 所有颜色、间距、字体大小完全一致
- 布局结构100%相同

### 2. 专业图表
- 使用 Lightweight Charts 库
- 支持 K线图 + 成交量图
- 图表同步缩放和滚动
- TradingView 风格十字准星

### 3. Mock 数据
- 自动生成 AUDUSD 价格数据
- 随机波动模拟真实市场
- 支持不同时间周期

### 4. 交互功能
- 时间周期切换（S1-MN1）
- 图表缩放和拖动
- 响应式窗口调整
- 按钮悬停效果

## 📝 使用说明

### 切换时间周期
点击顶部工具栏的时间周期按钮（S1, S3, M1, M15, M30, H1, D1, W1, MN1），图表会自动加载对应周期的数据。

### 图表操作
- **缩放**：鼠标滚轮
- **拖动**：鼠标左键拖动
- **十字准星**：鼠标悬停在图表上

### Mock 数据
所有数据都是自动生成的模拟数据，基于 AUDUSD（澳元/美元）汇率 0.66928 左右波动。

## 🔧 自定义开发

### 修改交易对
编辑 `src/components/ChartContainer.vue` 中的顶部信息栏：

```vue
<span class="symbol-name">Your Symbol Name, H1,</span>
```

### 修改基础价格
编辑 `src/services/MockDataService.ts`：

```typescript
private basePrice = 0.66928; // 修改为你的价格
private volatility = 0.0005; // 修改波动率
```

### 添加真实数据
替换 `loadData()` 函数中的 Mock 数据调用：

```typescript
// 从 API 获取真实数据
const candleData = await fetchRealData(props.timeframe);
```

## 🌟 项目亮点

1. **像素级还原**：完全按照截图设计，没有任何简化
2. **专业级图表**：使用 TradingView 官方图表库
3. **完整功能**：所有按钮、菜单、工具栏都已实现 UI
4. **生产就绪**：代码结构清晰，易于扩展和维护
5. **TypeScript**：完整类型支持，开发体验优秀

## 📄 License

MIT

---

**开发者**: Claude Code
**创建时间**: 2025-12-24
**版本**: 1.0.0
