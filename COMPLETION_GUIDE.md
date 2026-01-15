# Python 代码补全功能使用说明

## 功能概述

已为 Monaco Editor 实现了基础的 Python 代码补全功能，支持以下内容：

1. **Python 标准库函数**：print, len, range, enumerate, zip, map, filter, sum, max, min 等
2. **NumPy 库**：array, zeros, ones, arange, mean, std, reshape 等常用函数
3. **Pandas 库**：DataFrame, Series, read_csv, merge, groupby 等数据处理函数
4. **TA-Lib 技术指标**：SMA, EMA, MACD, RSI, BBANDS, ATR, ADX 等技术分析指标
5. **Python 关键字**：def, class, if, for, while, import 等
6. **自定义 API**：可扩展的自定义函数补全

## 使用方法

### 1. 基本补全

在编辑器中输入代码时，会自动弹出补全建议：

```python
# 输入 "pr" 会提示 print 函数
print(value)

# 输入 "len" 会提示 len 函数
len(obj)
```

### 2. 智能上下文补全

系统会根据输入的前缀智能过滤补全项：

```python
# 输入 "np." 只显示 NumPy 相关的补全
np.array()
np.mean()
np.std()

# 输入 "pd." 只显示 Pandas 相关的补全
pd.DataFrame()
pd.read_csv()
pd.merge()

# 输入 "df." 显示 DataFrame 方法
df.head()
df.groupby()
df.describe()

# 输入 "talib." 显示 TA-Lib 指标
talib.SMA()
talib.MACD()
talib.RSI()
```

### 3. 查看函数文档

鼠标悬停在补全项上可以看到：
- 函数的简要说明
- 函数的签名（参数列表）
- 详细的文档说明

## 扩展自定义 API

如果你有自定义的 API 或函数库，可以通过以下方式添加补全：

### 方法 1：直接修改补全数据

编辑 `src/services/PythonCompletionData.ts` 文件，在 `customApiCompletions` 数组中添加你的 API：

```typescript
export let customApiCompletions: CompletionItemData[] = [
  {
    label: 'my_custom_function',
    kind: 14, // Function
    insertText: 'my_custom_function(${1:param1}, ${2:param2})',
    documentation: '这是我的自定义函数',
    detail: 'my_custom_function(param1: str, param2: int) -> bool'
  },
  // 添加更多自定义 API...
];
```

### 方法 2：使用更新函数动态添加

在你的代码中调用 `updateCustomApiCompletions` 函数：

```typescript
import { updateCustomApiCompletions } from '@/services/PythonCompletionData';

const myApis = [
  {
    label: 'get_stock_data',
    kind: 14,
    insertText: 'get_stock_data(${1:symbol})',
    documentation: '获取股票数据',
    detail: 'get_stock_data(symbol: str) -> DataFrame'
  }
];

updateCustomApiCompletions(myApis);
```

### 方法 3：从文档自动解析（TODO）

`PythonCompletionData.ts` 中提供了 `parseApiDocumentation` 函数，你可以实现文档解析逻辑：

```typescript
/**
 * 示例：从 API 文档解析补全项
 */
export function parseApiDocumentation(docContent: string): CompletionItemData[] {
  const completions: CompletionItemData[] = [];

  // 实现你的解析逻辑
  // 例如：解析 Word 文档、Markdown 文档或其他格式
  // 提取函数名、参数、描述等信息

  return completions;
}
```

## 补全项类型 (CompletionItemKind)

Monaco Editor 支持多种补全项类型，常用的有：

- `14` - Function (函数)
- `7` - Class (类)
- `10` - Property (属性)
- `17` - Keyword (关键字)
- `6` - Variable (变量)
- `4` - Field (字段)
- `2` - Method (方法)
- `8` - Interface (接口)
- `9` - Module (模块)

## 文件结构

```
src/services/
├── PythonCompletionData.ts       # 补全数据定义
├── PythonCompletionProvider.ts   # 补全提供器实现
├── CodeFileService.ts            # 代码文件服务
└── QuantAgentService.ts          # Agent 服务
```

## 实现细节

### PythonCompletionData.ts

定义了所有的补全数据：
- `pythonBuiltins`: Python 内置函数
- `numpyCompletions`: NumPy 库函数
- `pandasCompletions`: Pandas 库函数
- `talibCompletions`: TA-Lib 技术指标
- `customApiCompletions`: 自定义 API（可动态更新）

### PythonCompletionProvider.ts

实现了 Monaco 的 `CompletionItemProvider` 接口：
- `provideCompletionItems`: 提供补全建议
- `resolveCompletionItem`: 提供补全项的详细信息

智能过滤逻辑：
- 检测输入的前缀（如 `np.`、`pd.`、`df.`、`talib.`）
- 根据前缀过滤相关的补全项
- 支持代码片段（snippets）插入

### QuantitativeEditor.vue

在 Monaco Editor 中注册补全提供器：
```typescript
import { registerPythonCompletionProvider } from '../services/PythonCompletionProvider';

// 在 onMounted 中注册
completionProviderDisposable = registerPythonCompletionProvider();

// 在 onUnmounted 中清理
if (completionProviderDisposable) {
  completionProviderDisposable.dispose();
}
```

## 后续改进建议

1. **从 Word 文档解析 API**
   - 实现 `parseApiDocumentation` 函数
   - 支持从 Word/Markdown 文档自动提取 API 信息
   - 可以使用 `mammoth.js` 解析 Word 文档

2. **增加更多库的支持**
   - scikit-learn (机器学习)
   - matplotlib (数据可视化)
   - scipy (科学计算)
   - 其他常用的量化交易库

3. **智能参数提示**
   - 实现 SignatureHelpProvider
   - 显示函数的参数提示

4. **代码片段模板**
   - 添加常用代码模板
   - 如策略模板、指标模板等

5. **类型推断**
   - 根据变量类型提供更精确的补全
   - 集成 Pyright 或 Pylance 语言服务器

## 技术栈

- **Monaco Editor**: 代码编辑器
- **TypeScript**: 类型安全的开发
- **Vue 3**: UI 框架
- **Vite**: 构建工具

## 常见问题

### Q: 补全不显示怎么办？
A: 检查以下几点：
1. 确认 Monaco Editor 已正确初始化
2. 确认 `registerPythonCompletionProvider()` 已被调用
3. 检查浏览器控制台是否有错误信息

### Q: 如何添加更多的补全项？
A: 参考上面的"扩展自定义 API"部分，可以通过三种方式添加。

### Q: 能否支持其他编程语言？
A: 可以，参考 `PythonCompletionProvider.ts` 的实现，创建其他语言的 CompletionItemProvider。

## 联系与反馈

如有问题或建议，请联系开发团队。
