/**
 * Python 代码补全数据
 * 包含 Python 标准库、numpy、pandas、ta-lib 和自定义 API 的补全数据
 */

import type * as monaco from 'monaco-editor';
import {
  getAllCustomCompletions,
  parseCustomApiDocument
} from './CustomApiParser';

export interface CompletionItemData {
  label: string;
  kind: monaco.languages.CompletionItemKind;
  insertText: string;
  documentation?: string;
  detail?: string;
}

/**
 * Python 常用模块名称（用于 import 语句补全）
 */
export const pythonModules: CompletionItemData[] = [
  {
    label: 'numpy',
    kind: 9, // Module
    insertText: 'numpy',
    documentation: 'NumPy 数值计算库 - 通常使用 as np',
    detail: 'module numpy'
  },
  {
    label: 'pandas',
    kind: 9,
    insertText: 'pandas',
    documentation: 'Pandas 数据处理和分析库 - 通常使用 as pd',
    detail: 'module pandas'
  },
  {
    label: 'matplotlib',
    kind: 9,
    insertText: 'matplotlib',
    documentation: 'Matplotlib 绘图库',
    detail: 'module matplotlib'
  },
  {
    label: 'talib',
    kind: 9,
    insertText: 'talib',
    documentation: 'TA-Lib 技术分析库',
    detail: 'module talib'
  },
  {
    label: 'datetime',
    kind: 9,
    insertText: 'datetime',
    documentation: '日期时间处理模块',
    detail: 'module datetime'
  },
  {
    label: 'typing',
    kind: 9,
    insertText: 'typing',
    documentation: '类型提示支持模块',
    detail: 'module typing'
  },
  {
    label: 'json',
    kind: 9,
    insertText: 'json',
    documentation: 'JSON 编码和解码',
    detail: 'module json'
  },
  {
    label: 'math',
    kind: 9,
    insertText: 'math',
    documentation: '数学函数库',
    detail: 'module math'
  },
  {
    label: 'os',
    kind: 9,
    insertText: 'os',
    documentation: '操作系统接口',
    detail: 'module os'
  },
  {
    label: 'sys',
    kind: 9,
    insertText: 'sys',
    documentation: '系统相关参数和函数',
    detail: 'module sys'
  },
  {
    label: 'time',
    kind: 9,
    insertText: 'time',
    documentation: '时间访问和转换',
    detail: 'module time'
  },
  {
    label: 'random',
    kind: 9,
    insertText: 'random',
    documentation: '生成伪随机数',
    detail: 'module random'
  },
  {
    label: 'collections',
    kind: 9,
    insertText: 'collections',
    documentation: '容器数据类型',
    detail: 'module collections'
  },
  {
    label: 're',
    kind: 9,
    insertText: 're',
    documentation: '正则表达式操作',
    detail: 'module re'
  }
];

/**
 * Python 内置函数
 */
export const pythonBuiltins: CompletionItemData[] = [
  {
    label: 'print',
    kind: 14, // Function
    insertText: 'print(${1:value})',
    documentation: '打印输出到控制台',
    detail: 'print(*values, sep=" ", end="\\n", file=sys.stdout, flush=False)'
  },
  {
    label: 'len',
    kind: 14,
    insertText: 'len(${1:obj})',
    documentation: '返回对象的长度或项数',
    detail: 'len(s) -> int'
  },
  {
    label: 'range',
    kind: 14,
    insertText: 'range(${1:start}, ${2:stop}, ${3:step})',
    documentation: '返回一个可迭代的整数序列',
    detail: 'range(stop) -> range object'
  },
  {
    label: 'enumerate',
    kind: 14,
    insertText: 'enumerate(${1:iterable}, ${2:start=0})',
    documentation: '返回一个枚举对象，产生 (索引, 值) 对',
    detail: 'enumerate(iterable, start=0)'
  },
  {
    label: 'zip',
    kind: 14,
    insertText: 'zip(${1:iter1}, ${2:iter2})',
    documentation: '将多个可迭代对象打包成元组的迭代器',
    detail: 'zip(*iterables) -> zip object'
  },
  {
    label: 'map',
    kind: 14,
    insertText: 'map(${1:function}, ${2:iterable})',
    documentation: '将函数应用于可迭代对象的每个元素',
    detail: 'map(func, *iterables) -> map object'
  },
  {
    label: 'filter',
    kind: 14,
    insertText: 'filter(${1:function}, ${2:iterable})',
    documentation: '过滤可迭代对象中满足条件的元素',
    detail: 'filter(function, iterable) -> filter object'
  },
  {
    label: 'sum',
    kind: 14,
    insertText: 'sum(${1:iterable}, ${2:start=0})',
    documentation: '对可迭代对象求和',
    detail: 'sum(iterable, start=0) -> value'
  },
  {
    label: 'max',
    kind: 14,
    insertText: 'max(${1:iterable})',
    documentation: '返回可迭代对象中的最大值',
    detail: 'max(iterable, *[, key, default])'
  },
  {
    label: 'min',
    kind: 14,
    insertText: 'min(${1:iterable})',
    documentation: '返回可迭代对象中的最小值',
    detail: 'min(iterable, *[, key, default])'
  },
  {
    label: 'abs',
    kind: 14,
    insertText: 'abs(${1:x})',
    documentation: '返回数字的绝对值',
    detail: 'abs(x) -> number'
  },
  {
    label: 'round',
    kind: 14,
    insertText: 'round(${1:number}, ${2:ndigits})',
    documentation: '四舍五入到指定精度',
    detail: 'round(number, ndigits=None)'
  },
  {
    label: 'sorted',
    kind: 14,
    insertText: 'sorted(${1:iterable}, ${2:key=None}, ${3:reverse=False})',
    documentation: '返回排序后的列表',
    detail: 'sorted(iterable, *, key=None, reverse=False) -> list'
  },
  {
    label: 'reversed',
    kind: 14,
    insertText: 'reversed(${1:seq})',
    documentation: '返回反转的迭代器',
    detail: 'reversed(sequence) -> reverse iterator'
  },
  {
    label: 'isinstance',
    kind: 14,
    insertText: 'isinstance(${1:obj}, ${2:class})',
    documentation: '检查对象是否是指定类型的实例',
    detail: 'isinstance(object, classinfo) -> bool'
  },
  {
    label: 'type',
    kind: 14,
    insertText: 'type(${1:object})',
    documentation: '返回对象的类型',
    detail: 'type(object) -> the object\'s type'
  }
];

/**
 * NumPy 常用函数和类
 */
export const numpyCompletions: CompletionItemData[] = [
  {
    label: 'np.array',
    kind: 14,
    insertText: 'np.array(${1:object})',
    documentation: '创建 NumPy 数组',
    detail: 'numpy.array(object, dtype=None, copy=True)'
  },
  {
    label: 'np.zeros',
    kind: 14,
    insertText: 'np.zeros(${1:shape})',
    documentation: '创建全零数组',
    detail: 'numpy.zeros(shape, dtype=float)'
  },
  {
    label: 'np.ones',
    kind: 14,
    insertText: 'np.ones(${1:shape})',
    documentation: '创建全一数组',
    detail: 'numpy.ones(shape, dtype=float)'
  },
  {
    label: 'np.arange',
    kind: 14,
    insertText: 'np.arange(${1:start}, ${2:stop}, ${3:step})',
    documentation: '创建等差数组',
    detail: 'numpy.arange([start,] stop[, step,], dtype=None)'
  },
  {
    label: 'np.linspace',
    kind: 14,
    insertText: 'np.linspace(${1:start}, ${2:stop}, ${3:num})',
    documentation: '创建线性间隔数组',
    detail: 'numpy.linspace(start, stop, num=50)'
  },
  {
    label: 'np.mean',
    kind: 14,
    insertText: 'np.mean(${1:a})',
    documentation: '计算数组的平均值',
    detail: 'numpy.mean(a, axis=None)'
  },
  {
    label: 'np.median',
    kind: 14,
    insertText: 'np.median(${1:a})',
    documentation: '计算数组的中位数',
    detail: 'numpy.median(a, axis=None)'
  },
  {
    label: 'np.std',
    kind: 14,
    insertText: 'np.std(${1:a})',
    documentation: '计算标准差',
    detail: 'numpy.std(a, axis=None, ddof=0)'
  },
  {
    label: 'np.var',
    kind: 14,
    insertText: 'np.var(${1:a})',
    documentation: '计算方差',
    detail: 'numpy.var(a, axis=None, ddof=0)'
  },
  {
    label: 'np.sum',
    kind: 14,
    insertText: 'np.sum(${1:a})',
    documentation: '对数组元素求和',
    detail: 'numpy.sum(a, axis=None)'
  },
  {
    label: 'np.max',
    kind: 14,
    insertText: 'np.max(${1:a})',
    documentation: '返回数组的最大值',
    detail: 'numpy.max(a, axis=None)'
  },
  {
    label: 'np.min',
    kind: 14,
    insertText: 'np.min(${1:a})',
    documentation: '返回数组的最小值',
    detail: 'numpy.min(a, axis=None)'
  },
  {
    label: 'np.argmax',
    kind: 14,
    insertText: 'np.argmax(${1:a})',
    documentation: '返回最大值的索引',
    detail: 'numpy.argmax(a, axis=None)'
  },
  {
    label: 'np.argmin',
    kind: 14,
    insertText: 'np.argmin(${1:a})',
    documentation: '返回最小值的索引',
    detail: 'numpy.argmin(a, axis=None)'
  },
  {
    label: 'np.where',
    kind: 14,
    insertText: 'np.where(${1:condition}, ${2:x}, ${3:y})',
    documentation: '根据条件从 x 或 y 中选择元素',
    detail: 'numpy.where(condition, [x, y])'
  },
  {
    label: 'np.concatenate',
    kind: 14,
    insertText: 'np.concatenate(${1:arrays})',
    documentation: '沿指定轴连接数组序列',
    detail: 'numpy.concatenate((a1, a2, ...), axis=0)'
  },
  {
    label: 'np.reshape',
    kind: 14,
    insertText: 'np.reshape(${1:a}, ${2:newshape})',
    documentation: '改变数组的形状',
    detail: 'numpy.reshape(a, newshape)'
  },
  {
    label: 'np.transpose',
    kind: 14,
    insertText: 'np.transpose(${1:a})',
    documentation: '转置数组',
    detail: 'numpy.transpose(a, axes=None)'
  }
];

/**
 * Pandas 常用函数和类
 */
export const pandasCompletions: CompletionItemData[] = [
  {
    label: 'pd.DataFrame',
    kind: 7, // Class
    insertText: 'pd.DataFrame(${1:data})',
    documentation: '创建 DataFrame 对象',
    detail: 'pandas.DataFrame(data=None, index=None, columns=None)'
  },
  {
    label: 'pd.Series',
    kind: 7,
    insertText: 'pd.Series(${1:data})',
    documentation: '创建 Series 对象',
    detail: 'pandas.Series(data=None, index=None, dtype=None, name=None)'
  },
  {
    label: 'pd.read_csv',
    kind: 14,
    insertText: 'pd.read_csv(${1:filepath})',
    documentation: '读取 CSV 文件',
    detail: 'pandas.read_csv(filepath_or_buffer, sep=",")'
  },
  {
    label: 'pd.read_excel',
    kind: 14,
    insertText: 'pd.read_excel(${1:filepath})',
    documentation: '读取 Excel 文件',
    detail: 'pandas.read_excel(io, sheet_name=0)'
  },
  {
    label: 'pd.concat',
    kind: 14,
    insertText: 'pd.concat(${1:objs})',
    documentation: '连接 pandas 对象',
    detail: 'pandas.concat(objs, axis=0, join="outer")'
  },
  {
    label: 'pd.merge',
    kind: 14,
    insertText: 'pd.merge(${1:left}, ${2:right})',
    documentation: '合并 DataFrame',
    detail: 'pandas.merge(left, right, how="inner", on=None)'
  },
  {
    label: 'pd.to_datetime',
    kind: 14,
    insertText: 'pd.to_datetime(${1:arg})',
    documentation: '将参数转换为 datetime',
    detail: 'pandas.to_datetime(arg, format=None)'
  },
  {
    label: 'df.head',
    kind: 14,
    insertText: 'df.head(${1:n=5})',
    documentation: '返回前 n 行数据',
    detail: 'DataFrame.head(n=5)'
  },
  {
    label: 'df.tail',
    kind: 14,
    insertText: 'df.tail(${1:n=5})',
    documentation: '返回后 n 行数据',
    detail: 'DataFrame.tail(n=5)'
  },
  {
    label: 'df.shape',
    kind: 10, // Property
    insertText: 'df.shape',
    documentation: '返回 DataFrame 的维度 (行数, 列数)',
    detail: 'DataFrame.shape'
  },
  {
    label: 'df.columns',
    kind: 10,
    insertText: 'df.columns',
    documentation: '返回 DataFrame 的列名',
    detail: 'DataFrame.columns'
  },
  {
    label: 'df.index',
    kind: 10,
    insertText: 'df.index',
    documentation: '返回 DataFrame 的索引',
    detail: 'DataFrame.index'
  },
  {
    label: 'df.info',
    kind: 14,
    insertText: 'df.info()',
    documentation: '打印 DataFrame 的简要信息',
    detail: 'DataFrame.info()'
  },
  {
    label: 'df.describe',
    kind: 14,
    insertText: 'df.describe()',
    documentation: '生成描述性统计',
    detail: 'DataFrame.describe()'
  },
  {
    label: 'df.dropna',
    kind: 14,
    insertText: 'df.dropna()',
    documentation: '删除缺失值',
    detail: 'DataFrame.dropna(axis=0, how="any")'
  },
  {
    label: 'df.fillna',
    kind: 14,
    insertText: 'df.fillna(${1:value})',
    documentation: '填充缺失值',
    detail: 'DataFrame.fillna(value=None, method=None)'
  },
  {
    label: 'df.sort_values',
    kind: 14,
    insertText: 'df.sort_values(${1:by})',
    documentation: '按值排序',
    detail: 'DataFrame.sort_values(by, ascending=True)'
  },
  {
    label: 'df.groupby',
    kind: 14,
    insertText: 'df.groupby(${1:by})',
    documentation: '根据列分组',
    detail: 'DataFrame.groupby(by=None)'
  },
  {
    label: 'df.apply',
    kind: 14,
    insertText: 'df.apply(${1:func})',
    documentation: '应用函数',
    detail: 'DataFrame.apply(func, axis=0)'
  },
  {
    label: 'df.merge',
    kind: 14,
    insertText: 'df.merge(${1:right})',
    documentation: '合并 DataFrame',
    detail: 'DataFrame.merge(right, how="inner", on=None)'
  },
  {
    label: 'df.pivot',
    kind: 14,
    insertText: 'df.pivot(${1:index}, ${2:columns}, ${3:values})',
    documentation: '数据透视',
    detail: 'DataFrame.pivot(index=None, columns=None, values=None)'
  },
  {
    label: 'df.to_csv',
    kind: 14,
    insertText: 'df.to_csv(${1:path})',
    documentation: '写入 CSV 文件',
    detail: 'DataFrame.to_csv(path_or_buf=None)'
  },
  {
    label: 'df.loc',
    kind: 10,
    insertText: 'df.loc[${1:row}, ${2:col}]',
    documentation: '基于标签的索引',
    detail: 'DataFrame.loc[row_indexer, column_indexer]'
  },
  {
    label: 'df.iloc',
    kind: 10,
    insertText: 'df.iloc[${1:row}, ${2:col}]',
    documentation: '基于整数位置的索引',
    detail: 'DataFrame.iloc[row_indexer, column_indexer]'
  }
];

/**
 * TA-Lib 技术指标函数
 */
export const talibCompletions: CompletionItemData[] = [
  {
    label: 'talib.SMA',
    kind: 14,
    insertText: 'talib.SMA(${1:close}, ${2:timeperiod=30})',
    documentation: '简单移动平均线',
    detail: 'talib.SMA(close, timeperiod=30) -> array'
  },
  {
    label: 'talib.EMA',
    kind: 14,
    insertText: 'talib.EMA(${1:close}, ${2:timeperiod=30})',
    documentation: '指数移动平均线',
    detail: 'talib.EMA(close, timeperiod=30) -> array'
  },
  {
    label: 'talib.WMA',
    kind: 14,
    insertText: 'talib.WMA(${1:close}, ${2:timeperiod=30})',
    documentation: '加权移动平均线',
    detail: 'talib.WMA(close, timeperiod=30) -> array'
  },
  {
    label: 'talib.MACD',
    kind: 14,
    insertText: 'talib.MACD(${1:close}, ${2:fastperiod=12}, ${3:slowperiod=26}, ${4:signalperiod=9})',
    documentation: 'MACD 指标',
    detail: 'talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9) -> (macd, signal, hist)'
  },
  {
    label: 'talib.RSI',
    kind: 14,
    insertText: 'talib.RSI(${1:close}, ${2:timeperiod=14})',
    documentation: '相对强弱指标',
    detail: 'talib.RSI(close, timeperiod=14) -> array'
  },
  {
    label: 'talib.BBANDS',
    kind: 14,
    insertText: 'talib.BBANDS(${1:close}, ${2:timeperiod=5}, ${3:nbdevup=2}, ${4:nbdevdn=2})',
    documentation: '布林带指标',
    detail: 'talib.BBANDS(close, timeperiod=5, nbdevup=2, nbdevdn=2) -> (upper, middle, lower)'
  },
  {
    label: 'talib.STOCH',
    kind: 14,
    insertText: 'talib.STOCH(${1:high}, ${2:low}, ${3:close})',
    documentation: '随机指标',
    detail: 'talib.STOCH(high, low, close, fastk_period=5, slowk_period=3, slowd_period=3) -> (slowk, slowd)'
  },
  {
    label: 'talib.ATR',
    kind: 14,
    insertText: 'talib.ATR(${1:high}, ${2:low}, ${3:close}, ${4:timeperiod=14})',
    documentation: '平均真实波幅',
    detail: 'talib.ATR(high, low, close, timeperiod=14) -> array'
  },
  {
    label: 'talib.ADX',
    kind: 14,
    insertText: 'talib.ADX(${1:high}, ${2:low}, ${3:close}, ${4:timeperiod=14})',
    documentation: '平均趋向指数',
    detail: 'talib.ADX(high, low, close, timeperiod=14) -> array'
  },
  {
    label: 'talib.CCI',
    kind: 14,
    insertText: 'talib.CCI(${1:high}, ${2:low}, ${3:close}, ${4:timeperiod=14})',
    documentation: '顺势指标',
    detail: 'talib.CCI(high, low, close, timeperiod=14) -> array'
  },
  {
    label: 'talib.MFI',
    kind: 14,
    insertText: 'talib.MFI(${1:high}, ${2:low}, ${3:close}, ${4:volume}, ${5:timeperiod=14})',
    documentation: '资金流量指标',
    detail: 'talib.MFI(high, low, close, volume, timeperiod=14) -> array'
  },
  {
    label: 'talib.OBV',
    kind: 14,
    insertText: 'talib.OBV(${1:close}, ${2:volume})',
    documentation: '能量潮指标',
    detail: 'talib.OBV(close, volume) -> array'
  },
  {
    label: 'talib.SAR',
    kind: 14,
    insertText: 'talib.SAR(${1:high}, ${2:low})',
    documentation: '抛物线指标',
    detail: 'talib.SAR(high, low, acceleration=0.02, maximum=0.2) -> array'
  },
  {
    label: 'talib.WILLR',
    kind: 14,
    insertText: 'talib.WILLR(${1:high}, ${2:low}, ${3:close}, ${4:timeperiod=14})',
    documentation: '威廉指标',
    detail: 'talib.WILLR(high, low, close, timeperiod=14) -> array'
  },
  {
    label: 'talib.STDDEV',
    kind: 14,
    insertText: 'talib.STDDEV(${1:close}, ${2:timeperiod=5})',
    documentation: '标准差',
    detail: 'talib.STDDEV(close, timeperiod=5, nbdev=1) -> array'
  },
  {
    label: 'talib.CORREL',
    kind: 14,
    insertText: 'talib.CORREL(${1:high}, ${2:low}, ${3:timeperiod=30})',
    documentation: '皮尔逊相关系数',
    detail: 'talib.CORREL(high, low, timeperiod=30) -> array'
  },
  {
    label: 'talib.LINEARREG',
    kind: 14,
    insertText: 'talib.LINEARREG(${1:close}, ${2:timeperiod=14})',
    documentation: '线性回归',
    detail: 'talib.LINEARREG(close, timeperiod=14) -> array'
  },
  {
    label: 'talib.CDLENGULFING',
    kind: 14,
    insertText: 'talib.CDLENGULFING(${1:open}, ${2:high}, ${3:low}, ${4:close})',
    documentation: '吞没形态',
    detail: 'talib.CDLENGULFING(open, high, low, close) -> array'
  },
  {
    label: 'talib.CDLDOJI',
    kind: 14,
    insertText: 'talib.CDLDOJI(${1:open}, ${2:high}, ${3:low}, ${4:close})',
    documentation: '十字星形态',
    detail: 'talib.CDLDOJI(open, high, low, close) -> array'
  }
];

/**
 * 获取所有补全项（不包含模块名，模块名在 import 上下文中单独处理）
 */
export function getAllCompletions(): CompletionItemData[] {
  return [
    ...pythonBuiltins,
    ...numpyCompletions,
    ...pandasCompletions,
    ...talibCompletions
  ];
}

/**
 * 自定义 API 补全项（从 CustomApiParser 导入）
 */
// 初始化自定义 API 补全项
export let customApiCompletions: CompletionItemData[] = getAllCustomCompletions();

/**
 * 更新自定义 API 补全项
 * @param newCompletions 新的补全项列表
 */
export function updateCustomApiCompletions(newCompletions: CompletionItemData[]) {
  customApiCompletions = newCompletions;
}

/**
 * 从 API 文档解析补全项
 * @param docContent 文档内容
 */
export function parseApiDocumentation(docContent: string): CompletionItemData[] {
  return parseCustomApiDocument(docContent);
}
