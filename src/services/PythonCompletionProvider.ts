/**
 * Python 代码补全提供器
 * 为 Monaco Editor 提供 Python 代码补全功能
 */

import * as monaco from 'monaco-editor';
import {
  getAllCompletions,
  pythonModules,
  customApiCompletions,
  type CompletionItemData
} from './PythonCompletionData';

/**
 * 创建 Monaco 补全项
 */
function createCompletionItem(
  item: CompletionItemData,
  range: monaco.IRange
): monaco.languages.CompletionItem {
  return {
    label: item.label,
    kind: item.kind,
    insertText: item.insertText,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: item.documentation,
    detail: item.detail,
    range: range
  };
}

/**
 * Python 补全提供器类
 */
export class PythonCompletionProvider implements monaco.languages.CompletionItemProvider {
  /**
   * 提供补全建议
   */
  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _context: monaco.languages.CompletionContext,
    _token: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {

    // 获取当前行的内容
    const lineContent = model.getLineContent(position.lineNumber);
    const textUntilPosition = lineContent.substring(0, position.column - 1);

    // 计算替换范围
    const word = model.getWordUntilPosition(position);
    const range: monaco.IRange = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    // ========== 上下文感知补全 ==========

    // 1. 检测 import 语句后的模块名补全
    // 匹配 "import " 或 "from " 后面
    const importMatch = textUntilPosition.match(/^\s*(import|from)\s+(\w*)$/);
    if (importMatch) {
      // 返回模块名称补全
      return {
        suggestions: pythonModules.map(item => createCompletionItem(item, range))
      };
    }

    // 2. 检测 import numpy/pandas 后的 as 补全
    const importAsMatch = textUntilPosition.match(/^\s*import\s+(numpy|pandas|matplotlib\.pyplot)\s+$/);
    if (importAsMatch) {
      const moduleName = importAsMatch[1];
      let asAlias = '';

      // 根据模块名提供常用别名
      if (moduleName === 'numpy') {
        asAlias = 'np';
      } else if (moduleName === 'pandas') {
        asAlias = 'pd';
      } else if (moduleName === 'matplotlib.pyplot') {
        asAlias = 'plt';
      }

      return {
        suggestions: [{
          label: `as ${asAlias}`,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: `as ${asAlias}`,
          documentation: `为 ${moduleName} 模块设置别名 ${asAlias}`,
          range: range,
          sortText: '0' // 确保排在最前面
        }]
      };
    }

    // 3. 检测 from module 后的 import 关键字补全
    const fromMatch = textUntilPosition.match(/^\s*from\s+\w+\s+$/);
    if (fromMatch) {
      return {
        suggestions: [{
          label: 'import',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'import ',
          documentation: '导入模块中的特定内容',
          range: range,
          sortText: '0'
        }]
      };
    }

    // 4. 检测 matplotlib. 后的子模块补全
    const matplotlibMatch = textUntilPosition.match(/^\s*(?:import|from)\s+matplotlib\.(\w*)$/);
    if (matplotlibMatch) {
      return {
        suggestions: [{
          label: 'pyplot',
          kind: monaco.languages.CompletionItemKind.Module,
          insertText: 'pyplot',
          documentation: 'Matplotlib 的绘图接口',
          detail: 'module matplotlib.pyplot',
          range: range
        }]
      };
    }

    // ========== 正常的代码补全 ==========

    // 获取所有补全数据
    const allCompletions = [
      ...getAllCompletions(),
      ...customApiCompletions
    ];

    // 转换为 Monaco 补全项
    const suggestions = allCompletions.map(item =>
      createCompletionItem(item, range)
    );

    // 添加一些关键字补全
    const keywords = [
      'def', 'class', 'if', 'elif', 'else', 'for', 'while',
      'try', 'except', 'finally', 'with', 'as', 'import',
      'from', 'return', 'yield', 'pass', 'break', 'continue',
      'and', 'or', 'not', 'is', 'in', 'True', 'False', 'None'
    ];

    keywords.forEach(keyword => {
      suggestions.push({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        range: range
      });
    });

    // 根据上下文智能过滤
    // 如果输入了 "np."，只显示 numpy 相关的补全
    // if (textUntilPosition.endsWith('np.')) {
    //   return {
    //     suggestions: suggestions.filter(s =>
    //       typeof s.label === 'string' && s.label.startsWith('np.')
    //     )
    //   };
    // }

    // 如果输入了 "pd."，只显示 pandas 相关的补全
    // if (textUntilPosition.endsWith('pd.')) {
    //   return {
    //     suggestions: suggestions.filter(s =>
    //       typeof s.label === 'string' && s.label.startsWith('pd.')
    //     )
    //   };
    // }

    // 如果输入了 "df."，显示 DataFrame 相关的方法
    // if (textUntilPosition.endsWith('df.')) {
    //   return {
    //     suggestions: suggestions.filter(s =>
    //       typeof s.label === 'string' && s.label.startsWith('df.')
    //     )
    //   };
    // }

    // 如果输入了 "talib."，只显示 ta-lib 相关的补全
    // if (textUntilPosition.endsWith('talib.')) {
    //   return {
    //     suggestions: suggestions.filter(s =>
    //       typeof s.label === 'string' && s.label.startsWith('talib.')
    //     )
    //   };
    // }

    // 如果输入了 "barstate."，显示 barstate 相关的属性
    // if (textUntilPosition.endsWith('barstate.')) {
    //   return {
    //     suggestions: suggestions.filter(s =>
    //       typeof s.label === 'string' && s.label.startsWith('barstate.')
    //     )
    //   };
    // }

    // 如果输入了 "chart_"，显示 chart 相关的变量
    if (textUntilPosition.endsWith('chart_') || /chart_\w*$/.test(textUntilPosition)) {
      return {
        suggestions: suggestions.filter(s =>
          typeof s.label === 'string' && s.label.startsWith('chart_')
        )
      };
    }

    // 如果输入了 "bar_"，显示 bar 相关的变量
    if (textUntilPosition.endsWith('bar_') || /bar_\w*$/.test(textUntilPosition)) {
      return {
        suggestions: suggestions.filter(s =>
          typeof s.label === 'string' && s.label.startsWith('bar_')
        )
      };
    }

    // 如果输入了 "input_"，显示 input 相关的函数
    if (textUntilPosition.endsWith('input_') || /input_\w*$/.test(textUntilPosition)) {
      return {
        suggestions: suggestions.filter(s =>
          typeof s.label === 'string' && s.label.startsWith('input_')
        )
      };
    }

    // 如果输入了 "plot" 开头，显示 plot 相关的函数
    if (/plot\w*$/.test(textUntilPosition)) {
      return {
        suggestions: suggestions.filter(s =>
          typeof s.label === 'string' && s.label.startsWith('plot')
        )
      };
    }

    // 如果输入了 "line."，显示 line 相关的方法
    if (textUntilPosition.endsWith('line.')) {
      return {
        suggestions: suggestions.filter(s =>
          typeof s.label === 'string' && s.label.startsWith('line.')
        )
      };
    }

    // 返回所有建议
    return {
      suggestions: suggestions
    };
  }

  /**
   * 提供补全项的详细信息（鼠标悬停时显示）
   */
  resolveCompletionItem?(
    item: monaco.languages.CompletionItem,
    _token: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.CompletionItem> {
    // 可以在这里添加更详细的文档信息
    return item;
  }
}

/**
 * 注册 Python 补全提供器
 */
export function registerPythonCompletionProvider(): monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider('python', new PythonCompletionProvider());
}
