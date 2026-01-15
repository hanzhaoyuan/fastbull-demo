/**
 * 自定义 API 文档解析器
 * 解析特定格式的 API 文档并生成补全数据
 */

import type { CompletionItemData } from './PythonCompletionData';

/**
 * 解析函数签名，提取函数名和参数
 * 例如：market_price(code,timeframe, fields, adjust_type)
 */
function parseFunctionSignature(signature: string): { name: string; params: string[] } {
  const match = signature.match(/^([a-zA-Z_][a-zA-Z0-9_.]*)\s*\((.*?)\)/);
  if (!match) {
    return { name: signature.trim(), params: [] };
  }

  const name = match[1].trim();
  const paramsStr = match[2].trim();
  const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];

  return { name, params };
}

/**
 * 生成函数的插入文本（snippet）
 */
function generateFunctionSnippet(name: string, params: string[]): string {
  if (params.length === 0) {
    return `${name}()`;
  }

  const snippetParams = params.map((param, index) => `\${${index + 1}:${param}}`).join(', ');
  return `${name}(${snippetParams})`;
}

/**
 * 解析类型字符串，转换为 Monaco CompletionItemKind
 */
function parseType(typeStr: string): number {
  const lowerType = typeStr.toLowerCase();

  if (lowerType.includes('function') || lowerType.includes('函数')) {
    return 14; // Function
  }
  if (lowerType.includes('class') || lowerType.includes('类')) {
    return 7; // Class
  }
  if (lowerType.includes('series') || lowerType.includes('array') || lowerType.includes('list')) {
    return 10; // Property (series 变量)
  }
  if (lowerType.includes('const') || lowerType.includes('常量')) {
    return 21; // Constant
  }
  if (lowerType.includes('int') || lowerType.includes('float') || lowerType.includes('str') || lowerType.includes('bool')) {
    return 6; // Variable
  }

  return 10; // Default: Property
}

/**
 * 从自定义文档格式解析 API 补全项
 */
export function parseCustomApiDocument(docContent: string): CompletionItemData[] {
  const completions: CompletionItemData[] = [];
  const lines = docContent.split('\n');

  let currentItem: {
    name?: string;
    type?: string;
    description?: string;
    params?: string[];
  } = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 跳过空行和标题行（纯数字开头的行）
    if (!line || /^\d+\.\s*$/.test(line)) {
      continue;
    }

    // 检测是否是变量/函数定义行（包含函数签名或变量名）
    // 例如：1.open 或 1.market_price(code,timeframe, fields, adjust_type)
    const definitionMatch = line.match(/^\d+\.(.+)/);
    if (definitionMatch) {
      // 如果之前有收集的项目，先保存
      if (currentItem.name) {
        completions.push(createCompletionItem(currentItem));
      }

      // 开始新的项目
      const definition = definitionMatch[1].trim();

      // 检查是否是函数（包含括号）
      if (definition.includes('(')) {
        const { name, params } = parseFunctionSignature(definition);
        currentItem = { name, params, description: '', type: 'function' };
      } else {
        // 变量
        currentItem = { name: definition, description: '', type: 'variable' };
      }
      continue;
    }

    // 检测类型定义行
    // 例如：类型：series float
    const typeMatch = line.match(/^类型[：:]\s*(.+)/);
    if (typeMatch && currentItem.name) {
      currentItem.type = typeMatch[1].trim();
      continue;
    }

    // 如果当前有正在处理的项目，且该行不是特殊标记，则作为描述
    if (currentItem.name && line && !line.startsWith('参数名') && !line.startsWith('输入') && !line.startsWith('输出')) {
      if (!currentItem.description) {
        currentItem.description = line;
      } else {
        currentItem.description += ' ' + line;
      }
    }
  }

  // 保存最后一个项目
  if (currentItem.name) {
    completions.push(createCompletionItem(currentItem));
  }

  return completions;
}

/**
 * 创建补全项
 */
function createCompletionItem(item: {
  name?: string;
  type?: string;
  description?: string;
  params?: string[];
}): CompletionItemData {
  const name = item.name || '';
  const type = item.type || 'variable';
  const description = item.description || '';
  const params = item.params || [];

  // 判断是否是函数
  const isFunction = params.length > 0 || type.toLowerCase().includes('function');

  return {
    label: name,
    kind: isFunction ? 14 : parseType(type),
    insertText: isFunction ? generateFunctionSnippet(name, params) : name,
    documentation: description,
    detail: type
  };
}

/**
 * 预定义的内置变量补全（基于文档手工提取）
 */
export const builtinVariables: CompletionItemData[] = [
  // 行情数据
  {
    label: 'open',
    kind: 10, // Property
    insertText: 'open',
    documentation: '当前bar的open价格',
    detail: 'series float'
  },
  {
    label: 'close',
    kind: 10,
    insertText: 'close',
    documentation: '当前bar的close价格',
    detail: 'series float'
  },
  {
    label: 'high',
    kind: 10,
    insertText: 'high',
    documentation: '当前bar的high价格',
    detail: 'series float'
  },
  {
    label: 'low',
    kind: 10,
    insertText: 'low',
    documentation: '当前bar的low价格',
    detail: 'series float'
  },
  {
    label: 'hl2',
    kind: 10,
    insertText: 'hl2',
    documentation: '当前(最高价 + 最低价)/2',
    detail: 'series float'
  },
  {
    label: 'hlc3',
    kind: 10,
    insertText: 'hlc3',
    documentation: '当前(最高价 + 最低价 + 收盘价)/3',
    detail: 'series float'
  },
  {
    label: 'hlcc4',
    kind: 10,
    insertText: 'hlcc4',
    documentation: '当前(最高价 + 最低价 + 收盘价 + 收盘价)/4',
    detail: 'series float'
  },
  {
    label: 'ohlc4',
    kind: 10,
    insertText: 'ohlc4',
    documentation: '当前(开盘价 + 最高价 + 最低价 + 收盘价)/4',
    detail: 'series float'
  },
  {
    label: 'volume',
    kind: 10,
    insertText: 'volume',
    documentation: '当前K线成交量（合约量）',
    detail: 'series float'
  },
  {
    label: 'bar_index',
    kind: 10,
    insertText: 'bar_index',
    documentation: '目前的价格bar指数。编号从零开始，第一个历史bar的索引为0',
    detail: 'series int'
  },
  {
    label: 'last_bar_index',
    kind: 10,
    insertText: 'last_bar_index',
    documentation: '最新一条bar的索引号',
    detail: 'int'
  },
  {
    label: 'bar_time',
    kind: 10,
    insertText: 'bar_time',
    documentation: '目前的价格bar时间戳',
    detail: 'series datetime'
  },
  {
    label: 'last_bar_time',
    kind: 10,
    insertText: 'last_bar_time',
    documentation: '最新一条bar的UNIX格式时间',
    detail: 'datetime'
  },

  // barstate 系列
  {
    label: 'barstate.ishistory',
    kind: 10,
    insertText: 'barstate.ishistory',
    documentation: '如果当前k线为历史k线（画图时），则返回true，否则返回false',
    detail: 'bool'
  },
  {
    label: 'barstate.islast',
    kind: 10,
    insertText: 'barstate.islast',
    documentation: '如果当前k线为k线组的最后一条k线，则返回true，否则返回false',
    detail: 'bool'
  },
  {
    label: 'barstate.islastconfirmedhistory',
    kind: 10,
    insertText: 'barstate.islastconfirmedhistory',
    documentation: '如果市场收盘时脚本在数据集的最后一根K线上执行，或者脚本正在实时K线之前的K线上执行，则返回true',
    detail: 'bool'
  },
  {
    label: 'barstate.isnew',
    kind: 10,
    insertText: 'barstate.isnew',
    documentation: '如果脚本目前在新k线上计算着（画图时），则返回true，否则返回false',
    detail: 'bool'
  },
  {
    label: 'barstate.isrealtime',
    kind: 10,
    insertText: 'barstate.isrealtime',
    documentation: '如果当前k线为实时k线，则返回true，否则返回false',
    detail: 'bool'
  },
  {
    label: 'ask',
    kind: 10,
    insertText: 'ask',
    documentation: 'tick类数据 - 卖价',
    detail: 'float'
  },
  {
    label: 'bid',
    kind: 10,
    insertText: 'bid',
    documentation: 'tick类数据 - 买价',
    detail: 'float'
  },

  // 主图信息类
  {
    label: 'chart_code',
    kind: 10,
    insertText: 'chart_code',
    documentation: '当前主图标的的资产代码',
    detail: 'string'
  },
  {
    label: 'chart_timeframe',
    kind: 10,
    insertText: 'chart_timeframe',
    documentation: '当前主图的周期，例："m1"、"m3"等',
    detail: 'string'
  },
  {
    label: 'chart_type',
    kind: 10,
    insertText: 'chart_type',
    documentation: '主图行情图类别，例："bars"、"candles"、"line"、"area"、"footprint"',
    detail: 'string'
  },
  {
    label: 'chart_divident_type',
    kind: 10,
    insertText: 'chart_divident_type',
    documentation: '当前主图的复权方式：\'none\'/\'front\'/\'back\'(不复权/前复权/后复权)',
    detail: 'string'
  },
  {
    label: 'chart_market',
    kind: 10,
    insertText: 'chart_market',
    documentation: '当前主图的资产所属市场的代码',
    detail: 'string'
  },
  {
    label: 'chart_symbol',
    kind: 10,
    insertText: 'chart_symbol',
    documentation: '主图标的的基础信息',
    detail: 'instrument类'
  },

  // 时间类
  {
    label: 'current_time',
    kind: 10,
    insertText: 'current_time',
    documentation: '当前bar的UTC时间',
    detail: 'datetime.datetime'
  },
  {
    label: 'bar_time_open',
    kind: 10,
    insertText: 'bar_time_open',
    documentation: '当前bar的开盘时间戳（UTC）',
    detail: 'datetime.datetime'
  },
  {
    label: 'bar_time_close',
    kind: 10,
    insertText: 'bar_time_close',
    documentation: '当前bar的收盘时间戳（UTC）',
    detail: 'datetime.datetime'
  },
  {
    label: 'bar_tradingday',
    kind: 10,
    insertText: 'bar_tradingday',
    documentation: '当前k线所属的交易日',
    detail: 'datetime.day'
  },
  {
    label: 'bar_weekday',
    kind: 10,
    insertText: 'bar_weekday',
    documentation: '当前k线的星期几',
    detail: 'string'
  }
];

/**
 * 数据获取函数补全
 */
export const dataFunctions: CompletionItemData[] = [
  {
    label: 'all_symbol',
    kind: 14, // Function
    insertText: 'all_symbol(${1:type}, ${2:date})',
    documentation: '返回该资产类型的所有合约代码。支持输入\'currency\'、\'commodity\'、\'index\'、\'crypto\'、\'stock\'、\'future\'',
    detail: 'all_symbol(type: str, date: datetime.date) -> list[str]'
  },
  {
    label: 'market_price',
    kind: 14,
    insertText: 'market_price(${1:code}, ${2:timeframe}, ${3:fields}, ${4:adjust_type})',
    documentation: '获取标的行情。code: 标的代码, timeframe: 周期, fields: 所需行情字段(\'open\'/\'close\'/\'high\'/\'low\'/\'volume\'), adjust_type: 复权方式(\'none\'/\'front\'/\'back\')',
    detail: 'market_price(code: str, timeframe: str, fields: str|list, adjust_type: str) -> series|dataframe'
  },
  {
    label: 'symbol',
    kind: 14,
    insertText: 'symbol(${1:code})',
    documentation: '获取标的基础信息',
    detail: 'symbol(code: str) -> instrument'
  }
];

/**
 * 参数输入函数补全
 */
export const inputFunctions: CompletionItemData[] = [
  {
    label: 'input_int',
    kind: 14,
    insertText: 'input_int(${1:title}, ${2:defval})',
    documentation: '整数参数输入。创建一个整数类型的用户输入参数',
    detail: 'input_int(title: str, tooltip: str, options: list, minval: int, maxval: int, step: int, defval: int, display: str) -> int'
  },
  {
    label: 'input_float',
    kind: 14,
    insertText: 'input_float(${1:title}, ${2:defval})',
    documentation: '浮点数参数输入。创建一个浮点数类型的用户输入参数',
    detail: 'input_float(title: str, tooltip: str, options: list, minval: float, maxval: float, step: float, defval: float, display: str) -> float'
  },
  {
    label: 'input_bool',
    kind: 14,
    insertText: 'input_bool(${1:title}, ${2:defval})',
    documentation: '布尔参数输入。创建一个布尔类型的用户输入参数',
    detail: 'input_bool(title: str, tooltip: str, defval: bool, display: str) -> bool'
  },
  {
    label: 'input_string',
    kind: 14,
    insertText: 'input_string(${1:title}, ${2:defval})',
    documentation: '字符串参数输入。创建一个字符串类型的用户输入参数',
    detail: 'input_string(title: str, tooltip: str, options: list, defval: str, display: str) -> str'
  },
  {
    label: 'input_color',
    kind: 14,
    insertText: 'input_color(${1:title}, ${2:defval})',
    documentation: '颜色参数输入。创建一个颜色类型的用户输入参数',
    detail: 'input_color(title: str, tooltip: str, defval: color, display: str) -> color'
  },
  {
    label: 'input_symbol',
    kind: 14,
    insertText: 'input_symbol(${1:title}, ${2:defval})',
    documentation: '标的参数输入。创建一个标的代码类型的用户输入参数',
    detail: 'input_symbol(title: str, tooltip: str, defval: str, display: str) -> str'
  },
  {
    label: 'input_source',
    kind: 14,
    insertText: 'input_source(${1:title}, ${2:defval})',
    documentation: '数据源参数输入。创建一个数据源类型的用户输入参数',
    detail: 'input_source(title: str, tooltip: str, defval: str, display: str) -> series'
  }
];

/**
 * 画图函数补全
 */
export const plotFunctions: CompletionItemData[] = [
  {
    label: 'plot',
    kind: 14,
    insertText: 'plot(${1:series}, ${2:title})',
    documentation: '绘制连续数组图形（折线图、阶梯图、曲线图、面积图、直方图、散点图）',
    detail: 'plot(series, title: str, color, style: str, linewidth: int, ...) -> plot'
  },
  {
    label: 'plotcandle',
    kind: 14,
    insertText: 'plotcandle(${1:open}, ${2:high}, ${3:low}, ${4:close})',
    documentation: '绘制K线图',
    detail: 'plotcandle(open: series, high: series, low: series, close: series, title: str, color, ...) -> plot'
  },
  {
    label: 'plotchar',
    kind: 14,
    insertText: 'plotchar(${1:series}, ${2:title}, ${3:char})',
    documentation: '绘制单个字符符号',
    detail: 'plotchar(series, title: str, char: str, location, color, ...) -> plot'
  },
  {
    label: 'plotshape',
    kind: 14,
    insertText: 'plotshape(${1:series}, ${2:title})',
    documentation: '绘制可视化形状',
    detail: 'plotshape(series, title: str, style, location, color, ...) -> plot'
  },
  {
    label: 'plotarrow',
    kind: 14,
    insertText: 'plotarrow(${1:series}, ${2:title})',
    documentation: '绘制向上或向下的箭头',
    detail: 'plotarrow(series, title: str, colorup, colordown, ...) -> plot'
  },
  {
    label: 'hline',
    kind: 14,
    insertText: 'hline(${1:price})',
    documentation: '绘制水平线',
    detail: 'hline(price: float, title: str, color, linestyle: str, linewidth: int) -> hline'
  },
  {
    label: 'line.new',
    kind: 14,
    insertText: 'line.new(${1:x1}, ${2:y1}, ${3:x2}, ${4:y2})',
    documentation: '创建新的线条对象',
    detail: 'line.new(x1, y1, x2, y2, color, linestyle: str, linewidth: int) -> line'
  },
  {
    label: 'line.copy',
    kind: 14,
    insertText: 'line.copy(${1:id})',
    documentation: '复制线条对象',
    detail: 'line.copy(id: line) -> line'
  },
  {
    label: 'line.delete',
    kind: 14,
    insertText: 'line.delete(${1:id})',
    documentation: '删除线条对象',
    detail: 'line.delete(id: line) -> void'
  }
];

/**
 * 获取所有自定义 API 补全项
 */
export function getAllCustomCompletions(): CompletionItemData[] {
  return [
    ...builtinVariables,
    ...dataFunctions,
    ...inputFunctions,
    ...plotFunctions
  ];
}
