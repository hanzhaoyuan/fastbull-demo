# 自定义量化 API 补全功能使用指南

## 功能概述

已成功为 Monaco Editor 实现了完整的 Python 代码补全功能，包含：

### 1. 标准库（69+ 个补全项）
- **Python 内置函数**：print, len, range, enumerate, zip, map, filter, sum, max, min 等 16 个
- **NumPy**：array, zeros, ones, mean, std, reshape 等 18 个常用函数
- **Pandas**：DataFrame, Series, read_csv, merge, groupby 等 24 个数据处理函数
- **TA-Lib**：SMA, EMA, MACD, RSI, BBANDS 等 19 个技术分析指标

### 2. 自定义量化 API（60+ 个补全项）
根据你提供的文档格式，已实现以下分类的补全：

#### 内置变量（35 个）
- **行情数据**：`open`, `close`, `high`, `low`, `hl2`, `hlc3`, `hlcc4`, `ohlc4`, `volume`
- **K线索引**：`bar_index`, `last_bar_index`, `bar_time`, `last_bar_time`
- **K线状态**：`barstate.ishistory`, `barstate.islast`, `barstate.isnew`, `barstate.isrealtime` 等
- **行情数据**：`ask`, `bid`
- **主图信息**：`chart_code`, `chart_timeframe`, `chart_type`, `chart_divident_type`, `chart_market`, `chart_symbol`
- **时间数据**：`current_time`, `bar_time_open`, `bar_time_close`, `bar_tradingday`, `bar_weekday`

#### 数据获取函数（3 个）
- `all_symbol(type, date)` - 获取所有合约代码
- `market_price(code, timeframe, fields, adjust_type)` - 获取标的行情
- `symbol(code)` - 获取标的基础信息

#### 参数输入函数（7 个）
- `input_int()` - 整数参数输入
- `input_float()` - 浮点数参数输入
- `input_bool()` - 布尔参数输入
- `input_string()` - 字符串参数输入
- `input_color()` - 颜色参数输入
- `input_symbol()` - 标的参数输入
- `input_source()` - 数据源参数输入

#### 画图函数（9 个）
- `plot()` - 绘制连续数组图形（折线图、面积图、直方图等）
- `plotcandle()` - 绘制K线图
- `plotchar()` - 绘制字符符号
- `plotshape()` - 绘制可视化形状
- `plotarrow()` - 绘制箭头
- `hline()` - 绘制水平线
- `line.new()` - 创建线条对象
- `line.copy()` - 复制线条对象
- `line.delete()` - 删除线条对象

## 智能补全功能

### 1. 基础补全
直接输入代码，会自动弹出相关补全建议：

```python
# 输入 "pr" 会提示 print 函数
print(value)

# 输入 "op" 会提示 open 变量
open
```

### 2. 上下文智能过滤

系统会根据输入的前缀智能过滤，只显示相关的补全项：

```python
# 输入 "np." - 只显示 NumPy 相关
np.array()
np.mean()
np.std()

# 输入 "pd." - 只显示 Pandas 相关
pd.DataFrame()
pd.read_csv()
pd.merge()

# 输入 "df." - 显示 DataFrame 方法
df.head()
df.groupby()
df.describe()

# 输入 "talib." - 显示 TA-Lib 指标
talib.SMA()
talib.MACD()
talib.RSI()

# 输入 "barstate." - 显示 K线状态属性
barstate.ishistory
barstate.islast
barstate.isnew

# 输入 "chart_" - 显示主图信息变量
chart_code
chart_timeframe
chart_type

# 输入 "bar_" - 显示 K线相关变量
bar_index
bar_time
bar_tradingday

# 输入 "input_" - 显示参数输入函数
input_int()
input_float()
input_string()

# 输入 "plot" - 显示画图函数
plot()
plotcandle()
plotchar()

# 输入 "line." - 显示线条方法
line.new()
line.copy()
line.delete()
```

### 3. 代码片段（Snippets）

所有函数都支持参数占位符，按 Tab 键可以快速跳转到下一个参数：

```python
# 输入 market_price 并选择补全后：
market_price(code, timeframe, fields, adjust_type)
#            ^^^^^  按 Tab 跳到下一个参数
```

### 4. 文档提示

鼠标悬停在补全项上可以查看：
- 函数/变量的详细说明
- 参数列表和类型
- 返回值类型

## 使用示例

### 示例 1：访问行情数据
```python
# 获取当前K线的开盘价
current_open = open

# 获取平均价格
average_price = ohlc4  # (开盘价 + 最高价 + 最低价 + 收盘价)/4

# 获取成交量
vol = volume

# 检查是否是最后一根K线
if barstate.islast:
    print("这是最后一根K线")
```

### 示例 2：获取数据
```python
# 获取所有股票代码
all_stocks = all_symbol('stock', current_time)

# 获取特定标的的行情数据
price_data = market_price('000001.XSHE', 'm1', ['open', 'close', 'high', 'low'], 'front')

# 获取标的基础信息
stock_info = symbol('000001.XSHE')
```

### 示例 3：创建参数输入
```python
# 整数参数
period = input_int("周期", defval=14)

# 浮点数参数
threshold = input_float("阈值", defval=0.5)

# 布尔参数
enable_signal = input_bool("启用信号", defval=True)

# 颜色参数
line_color = input_color("线条颜色", defval="blue")
```

### 示例 4：画图
```python
# 绘制简单折线图
plot(close, "收盘价", color="blue", style="line")

# 绘制K线图
plotcandle(open, high, low, close, "价格")

# 绘制水平线
hline(100, "目标价", color="red", linestyle="dashed")

# 绘制自定义线条
line1 = line.new(bar_index[10], low[10], bar_index, high, color="green")
```

## 扩展自定义 API

### 方法 1：直接编辑补全数据文件

编辑 `src/services/CustomApiParser.ts` 文件，在对应的数组中添加你的 API：

```typescript
// 添加到 builtinVariables 数组
{
  label: 'my_variable',
  kind: 10, // Property
  insertText: 'my_variable',
  documentation: '我的自定义变量',
  detail: 'float'
}

// 添加到 dataFunctions 数组
{
  label: 'my_function',
  kind: 14, // Function
  insertText: 'my_function(${1:param1}, ${2:param2})',
  documentation: '我的自定义函数',
  detail: 'my_function(param1: str, param2: int) -> DataFrame'
}
```

### 方法 2：使用文档解析器（推荐）

如果你有大量的 API 需要添加，可以使用 `parseCustomApiDocument` 函数来解析文档：

```typescript
import { parseCustomApiDocument, updateCustomApiCompletions } from '@/services/CustomApiParser';

// 你的 API 文档内容（按照你的格式）
const apiDoc = `
1.custom_indicator
自定义指标函数
类型：function

2.custom_variable
自定义变量
类型：series float
`;

// 解析并更新补全项
const newCompletions = parseCustomApiDocument(apiDoc);
updateCustomApiCompletions([...customApiCompletions, ...newCompletions]);
```

### 方法 3：从外部文件加载

```typescript
// 从服务器加载 API 文档
fetch('/api/custom-api-docs')
  .then(response => response.text())
  .then(docContent => {
    const completions = parseCustomApiDocument(docContent);
    updateCustomApiCompletions(completions);
  });
```

## 文件结构

```
src/services/
├── PythonCompletionData.ts       # 基础补全数据（Python、NumPy、Pandas、TA-Lib）
├── CustomApiParser.ts            # 自定义 API 解析器和补全数据
├── PythonCompletionProvider.ts   # 补全提供器实现（智能过滤）
├── CodeFileService.ts            # 代码文件服务
└── QuantAgentService.ts          # Agent 服务
```

## 补全项类型

Monaco Editor 支持的补全项类型：

- `14` - Function (函数)
- `7` - Class (类)
- `10` - Property (属性/变量)
- `21` - Constant (常量)
- `17` - Keyword (关键字)
- `6` - Variable (变量)
- `4` - Field (字段)
- `2` - Method (方法)

## 后续改进建议

1. **集成 Pyright 语言服务器**
   - 实现更准确的类型推断
   - 提供更智能的补全建议

2. **SignatureHelp 参数提示**
   - 实时显示函数参数信息
   - 高亮当前参数位置

3. **Hover 悬停文档**
   - 显示更详细的 API 文档
   - 支持富文本格式（Markdown）

4. **Go to Definition 跳转定义**
   - 支持跳转到函数/变量定义位置
   - 查看源代码实现

5. **代码模板（Snippets）**
   - 添加常用策略模板
   - 添加指标计算模板

## 常见问题

### Q: 如何添加更多的自定义 API？
A: 有三种方式：
1. 直接编辑 `CustomApiParser.ts` 文件
2. 使用 `parseCustomApiDocument()` 函数解析文档
3. 使用 `updateCustomApiCompletions()` 函数动态更新

### Q: 补全不显示怎么办？
A: 检查以下几点：
1. 确认补全提供器已注册（在 `onMounted` 中）
2. 检查浏览器控制台是否有错误
3. 确认输入的前缀是否正确（如 `np.` 而不是 `np`）

### Q: 如何修改智能过滤规则？
A: 编辑 `PythonCompletionProvider.ts` 文件，在 `provideCompletionItems` 方法中添加或修改过滤逻辑。

### Q: 能否支持多语言？
A: 可以。参考 `PythonCompletionProvider` 的实现，为其他语言创建对应的 CompletionItemProvider。

## 技术栈

- **Monaco Editor**: 代码编辑器
- **TypeScript**: 类型安全开发
- **Vue 3**: UI 框架
- **Vite**: 构建工具

## 总结

本次实现提供了：
✅ **130+ 个补全项**（69 个标准库 + 60+ 个自定义 API）
✅ **智能上下文过滤**（11 种场景）
✅ **代码片段支持**（函数参数占位符）
✅ **文档提示**（鼠标悬停显示）
✅ **可扩展架构**（支持动态添加 API）

所有代码已编译通过，可以直接使用！
