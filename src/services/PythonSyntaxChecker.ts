/**
 * Python 语法检查服务
 * 提供基本的 Python 语法错误检测
 */

export interface SyntaxError {
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Python 语法检查器类
 */
export class PythonSyntaxChecker {
  /**
   * 检查代码语法错误
   */
  checkSyntax(code: string): SyntaxError[] {
    const errors: SyntaxError[] = [];
    const lines = code.split('\n');

    // 检查括号匹配
    errors.push(...this.checkBrackets(lines));

    // 检查缩进
    errors.push(...this.checkIndentation(lines));

    // 检查常见语法错误
    errors.push(...this.checkCommonErrors(lines));

    // 检查未定义的变量（简单检查）
    errors.push(...this.checkUndefinedVariables(lines));

    return errors;
  }

  /**
   * 检查括号匹配
   */
  private checkBrackets(lines: string[]): SyntaxError[] {
    const errors: SyntaxError[] = [];
    const stack: Array<{ char: string; line: number; column: number }> = [];
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
    };

    lines.forEach((line, lineIndex) => {
      // 移除字符串和注释
      const cleanLine = this.removeStringsAndComments(line);

      for (let col = 0; col < cleanLine.length; col++) {
        const char = cleanLine[col];

        if (['(', '[', '{'].includes(char)) {
          stack.push({ char, line: lineIndex, column: col });
        } else if ([')', ']', '}'].includes(char)) {
          if (stack.length === 0) {
            errors.push({
              line: lineIndex + 1,
              column: col + 1,
              endLine: lineIndex + 1,
              endColumn: col + 2,
              message: `意外的闭合括号 '${char}'`,
              severity: 'error',
            });
          } else {
            const top = stack.pop()!;
            if (pairs[top.char] !== char) {
              errors.push({
                line: lineIndex + 1,
                column: col + 1,
                endLine: lineIndex + 1,
                endColumn: col + 2,
                message: `括号不匹配：期望 '${pairs[top.char]}'，但得到 '${char}'`,
                severity: 'error',
              });
            }
          }
        }
      }
    });

    // 检查未闭合的括号
    stack.forEach((item) => {
      errors.push({
        line: item.line + 1,
        column: item.column + 1,
        endLine: item.line + 1,
        endColumn: item.column + 2,
        message: `未闭合的 '${item.char}'`,
        severity: 'error',
      });
    });

    return errors;
  }

  /**
   * 检查缩进错误
   */
  private checkIndentation(lines: string[]): SyntaxError[] {
    const errors: SyntaxError[] = [];
    let expectedIndent = 0;

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();

      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      // 计算当前行的缩进
      const indent = line.length - line.trimStart().length;

      // 检查是否使用了制表符和空格混合
      if (/^\s*\t/.test(line) && /^\s* /.test(line)) {
        errors.push({
          line: lineIndex + 1,
          column: 1,
          endLine: lineIndex + 1,
          endColumn: indent + 1,
          message: '不要混合使用制表符和空格进行缩进',
          severity: 'error',
        });
      }

      // 检查缩进是否为4的倍数（Python标准）
      if (indent % 4 !== 0 && indent > 0) {
        errors.push({
          line: lineIndex + 1,
          column: 1,
          endLine: lineIndex + 1,
          endColumn: indent + 1,
          message: `缩进应该是4个空格的倍数，当前为${indent}个空格`,
          severity: 'warning',
        });
      }

      // 检查是否以冒号结尾（需要增加缩进的语句）
      const previousLine = lineIndex > 0 ? lines[lineIndex - 1].trim() : '';
      if (
        previousLine &&
        previousLine.endsWith(':') &&
        !previousLine.startsWith('#')
      ) {
        expectedIndent += 4;
      }

      // 检查是否需要减少缩进
      if (
        trimmed.startsWith('elif ') ||
        trimmed.startsWith('else:') ||
        trimmed.startsWith('except ') ||
        trimmed.startsWith('except:') ||
        trimmed.startsWith('finally:')
      ) {
        expectedIndent = Math.max(0, expectedIndent - 4);
      }

      // 如果当前行以冒号结尾，但下一行没有缩进增加，给出警告
      if (
        trimmed.endsWith(':') &&
        !trimmed.startsWith('#') &&
        lineIndex < lines.length - 1
      ) {
        const nextLine = lines[lineIndex + 1];
        const nextTrimmed = nextLine.trim();
        if (nextTrimmed && !nextTrimmed.startsWith('#')) {
          const nextIndent = nextLine.length - nextLine.trimStart().length;
          if (nextIndent <= indent) {
            errors.push({
              line: lineIndex + 2,
              column: 1,
              endLine: lineIndex + 2,
              endColumn: nextIndent + 1,
              message: '期望在此处有缩进',
              severity: 'error',
            });
          }
        }
      }
    });

    return errors;
  }

  /**
   * 检查常见语法错误
   */
  private checkCommonErrors(lines: string[]): SyntaxError[] {
    const errors: SyntaxError[] = [];

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();

      // 跳过注释
      if (trimmed.startsWith('#')) {
        return;
      }

      // 检查函数定义语法
      if (trimmed.startsWith('def ')) {
        if (!trimmed.includes('(') || !trimmed.includes(')')) {
          errors.push({
            line: lineIndex + 1,
            column: 1,
            endLine: lineIndex + 1,
            endColumn: trimmed.length + 1,
            message: '函数定义缺少括号',
            severity: 'error',
          });
        } else if (!trimmed.endsWith(':')) {
          errors.push({
            line: lineIndex + 1,
            column: trimmed.length,
            endLine: lineIndex + 1,
            endColumn: trimmed.length + 1,
            message: '函数定义缺少冒号',
            severity: 'error',
          });
        }
      }

      // 检查类定义语法
      if (trimmed.startsWith('class ')) {
        if (!trimmed.endsWith(':')) {
          errors.push({
            line: lineIndex + 1,
            column: trimmed.length,
            endLine: lineIndex + 1,
            endColumn: trimmed.length + 1,
            message: '类定义缺少冒号',
            severity: 'error',
          });
        }
      }

      // 检查 if/elif/else/for/while 语句
      if (
        /^(if|elif|else|for|while|try|except|finally|with)\s/.test(trimmed) ||
        trimmed === 'else:' ||
        trimmed === 'try:' ||
        trimmed === 'finally:'
      ) {
        if (!trimmed.endsWith(':')) {
          errors.push({
            line: lineIndex + 1,
            column: trimmed.length,
            endLine: lineIndex + 1,
            endColumn: trimmed.length + 1,
            message: '控制语句缺少冒号',
            severity: 'error',
          });
        }
      }

      // 检查赋值语句中的等号
      if (trimmed.includes('=') && !trimmed.includes('==')) {
        const parts = trimmed.split('=');
        if (parts.length > 1 && parts[0].trim() === '') {
          errors.push({
            line: lineIndex + 1,
            column: 1,
            endLine: lineIndex + 1,
            endColumn: trimmed.length + 1,
            message: '赋值语句左侧缺少变量名',
            severity: 'error',
          });
        }
      }

      // 检查 import 语句
      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        if (trimmed.startsWith('from ') && !trimmed.includes(' import ')) {
          errors.push({
            line: lineIndex + 1,
            column: 1,
            endLine: lineIndex + 1,
            endColumn: trimmed.length + 1,
            message: "from 语句缺少 'import' 关键字",
            severity: 'error',
          });
        }
      }

      // 检查 return/break/continue 后面是否有不合适的内容
      const cleanLine = this.removeStringsAndComments(trimmed);
      if (/^(break|continue)\s+\S/.test(cleanLine)) {
        errors.push({
          line: lineIndex + 1,
          column: 1,
          endLine: lineIndex + 1,
          endColumn: trimmed.length + 1,
          message: 'break/continue 后面不应该有其他内容',
          severity: 'error',
        });
      }
    });

    return errors;
  }

  /**
   * 检查未定义的变量（简单版本）
   */
  private checkUndefinedVariables(lines: string[]): SyntaxError[] {
    const errors: SyntaxError[] = [];
    const definedVars = new Set<string>([
      // Python 内置函数和关键字
      'print',
      'len',
      'range',
      'str',
      'int',
      'float',
      'list',
      'dict',
      'set',
      'tuple',
      'bool',
      'True',
      'False',
      'None',
      'abs',
      'max',
      'min',
      'sum',
      'sorted',
      'enumerate',
      'zip',
      'map',
      'filter',
      'open',
      'type',
      'isinstance',
      'hasattr',
      'getattr',
      'setattr',
    ]);

    lines.forEach((line) => {
      const trimmed = line.trim();

      // 跳过注释和空行
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      // 提取定义的变量
      // 赋值语句
      const assignMatch = trimmed.match(/^(\w+)\s*=/);
      if (assignMatch) {
        definedVars.add(assignMatch[1]);
      }

      // 函数定义
      const funcMatch = trimmed.match(/^def\s+(\w+)/);
      if (funcMatch) {
        definedVars.add(funcMatch[1]);
      }

      // 类定义
      const classMatch = trimmed.match(/^class\s+(\w+)/);
      if (classMatch) {
        definedVars.add(classMatch[1]);
      }

      // for 循环变量
      const forMatch = trimmed.match(/^for\s+(\w+)\s+in/);
      if (forMatch) {
        definedVars.add(forMatch[1]);
      }

      // import 语句
      const importMatch = trimmed.match(/^import\s+(\w+)/);
      if (importMatch) {
        definedVars.add(importMatch[1]);
      }

      const fromImportMatch = trimmed.match(/^from\s+\w+\s+import\s+(\w+)/);
      if (fromImportMatch) {
        definedVars.add(fromImportMatch[1]);
      }
    });

    return errors;
  }

  /**
   * 移除字符串和注释（辅助函数）
   */
  private removeStringsAndComments(line: string): string {
    let result = '';
    let inString = false;
    let stringChar = '';
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
        } else if (char === '#') {
          // 遇到注释，后面的都忽略
          break;
        } else {
          result += char;
        }
      } else {
        if (char === stringChar) {
          inString = false;
        }
      }
    }

    return result;
  }
}

// 导出单例
export const pythonSyntaxChecker = new PythonSyntaxChecker();
