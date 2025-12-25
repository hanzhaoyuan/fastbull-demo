<template>
  <div class="quantitative-editor">
    <!-- 左侧文件树 -->
    <div class="file-sidebar" :style="{ width: sidebarWidth + 'px' }">
      <!-- 文件树工具栏 -->
      <div class="sidebar-toolbar">
        <button class="collapse-all-btn" @click="toggleAllCategories" :title="allCollapsed ? '全部展开' : '全部折叠'">
          <!-- 全部折叠状态 - 显示展开图标（双向下箭头） -->
          <svg v-if="allCollapsed" viewBox="0 0 16 16" width="14" height="14">
            <path fill="currentColor" d="M3 4l5 5 5-5v2l-5 5-5-5V4z"/>
          </svg>
          <!-- 全部展开状态 - 显示折叠图标（双向上箭头） -->
          <svg v-else viewBox="0 0 16 16" width="14" height="14">
            <path fill="currentColor" d="M13 12l-5-5-5 5V10l5-5 5 5v2z"/>
          </svg>
        </button>
      </div>

      <!-- 指标分类 -->
      <div class="file-category">
        <div class="category-header" @click="toggleCategory('indicator')">
          <svg class="collapse-icon" :class="{ collapsed: !categoryExpanded.indicator }" viewBox="0 0 16 16" width="12"
               height="12">
            <path fill="currentColor" d="M5 6l3 3 3-3z"/>
          </svg>
          <span class="category-title">指标</span>
          <button class="add-btn" @click.stop="addFile('indicator')" title="添加指标">+</button>
        </div>
        <div class="file-list" v-show="categoryExpanded.indicator">
          <div
              v-for="file in indicatorFiles"
              :key="file.id"
              :class="['file-item', { active: currentFile?.id === file.id }]"
              @click="openFile(file)"
          >
            <svg class="file-icon" viewBox="0 0 16 16" width="16" height="16">
              <path fill="currentColor" d="M4 0h5.5L14 4.5V16H2V0h2zm0 1v14h9V5h-4V1H4z"/>
            </svg>
            <span class="file-name">{{ file.name }}</span>
            <button class="more-btn" @click.stop="showFileMenu(file)">...</button>
          </div>
        </div>
      </div>

      <!-- 策略分类 -->
      <div class="file-category">
        <div class="category-header" @click="toggleCategory('strategy')">
          <svg class="collapse-icon" :class="{ collapsed: !categoryExpanded.strategy }" viewBox="0 0 16 16" width="12"
               height="12">
            <path fill="currentColor" d="M5 6l3 3 3-3z"/>
          </svg>
          <span class="category-title">策略</span>
          <button class="add-btn" @click.stop="addFile('strategy')" title="添加策略">+</button>
        </div>
        <div class="file-list" v-show="categoryExpanded.strategy">
          <div
              v-for="file in strategyFiles"
              :key="file.id"
              :class="['file-item', { active: currentFile?.id === file.id }]"
              @click="openFile(file)"
          >
            <svg class="file-icon" viewBox="0 0 16 16" width="16" height="16">
              <path fill="currentColor" d="M4 0h5.5L14 4.5V16H2V0h2zm0 1v14h9V5h-4V1H4z"/>
            </svg>
            <span class="file-name">{{ file.name }}</span>
            <button class="more-btn" @click.stop="showFileMenu(file)">...</button>
          </div>
        </div>
      </div>

      <!-- 库分类 -->
      <div class="file-category">
        <div class="category-header" @click="toggleCategory('library')">
          <svg class="collapse-icon" :class="{ collapsed: !categoryExpanded.library }" viewBox="0 0 16 16" width="12"
               height="12">
            <path fill="currentColor" d="M5 6l3 3 3-3z"/>
          </svg>
          <span class="category-title">库</span>
          <button class="add-btn" @click.stop="addFile('library')" title="添加库">+</button>
        </div>
        <div class="file-list" v-show="categoryExpanded.library">
          <div
              v-for="file in libraryFiles"
              :key="file.id"
              :class="['file-item', { active: currentFile?.id === file.id }]"
              @click="openFile(file)"
          >
            <svg class="file-icon" viewBox="0 0 16 16" width="16" height="16">
              <path fill="currentColor" d="M4 0h5.5L14 4.5V16H2V0h2zm0 1v14h9V5h-4V1H4z"/>
            </svg>
            <span class="file-name">{{ file.name }}</span>
            <button class="more-btn" @click.stop="showFileMenu(file)">...</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 拖拽分割线 -->
    <div
        class="vertical-resize-handle"
        @mousedown="startSidebarResize"
        :class="{ 'is-resizing': isSidebarResizing }"
    >
      <div class="vertical-resize-handle-line"></div>
    </div>

    <!-- 右侧编辑区域 -->
    <div class="editor-main">
      <!-- 顶部工具栏 - 合并文件信息和按钮 -->
      <div class="editor-toolbar" v-if="currentFile">
        <div class="file-info-section">
          <span class="file-name-display">{{ currentFile.name }}</span>
          <button
              class="about-btn"
              @click="showAboutDialog = true"
              title="查看或编辑策略/指标/库信息"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <circle cx="12" cy="12" r="10" fill="currentColor"/>
              <text x="12" y="17" text-anchor="middle" font-size="14" fill="#ffffff" font-weight="bold">i</text>
            </svg>
          </button>
          <span class="file-meta">最后编辑时间 {{ currentFile.lastModified }}</span>
        </div>
        <div class="toolbar-right">
          <button class="tool-btn" @click="saveFile">保存</button>
          <button class="tool-btn" @click="checkCode">检查</button>
          <button class="tool-btn" @click="backtest">回测</button>
          <button class="tool-btn" @click="startStrategy">启动</button>
          <button class="tool-btn more">更多</button>
        </div>
      </div>

      <!-- Monaco 编辑器 -->
      <div class="editor-container" ref="editorContainer"></div>

      <!-- 底部面板拖拽分割线 -->
      <div
          v-if="isPanelOpen"
          class="horizontal-resize-handle"
          @mousedown="startPanelResize"
          :class="{ 'is-resizing': isPanelResizing }"
      >
        <div class="horizontal-resize-handle-line"></div>
      </div>

      <!-- 底部面板 -->
      <div v-if="isPanelOpen" class="bottom-panel" :style="{ height: panelHeight + 'px' }">
        <div class="panel-tabs">
          <button v-if="panelVisibility.terminal" :class="['panel-tab', { active: bottomPanel === 'terminal' }]"
                  @click="togglePanel('terminal')" @dblclick="handlePanelDblClick('terminal')">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path fill="currentColor" d="M0 2v12h16V2H0zm1 1h14v10H1V3zm2 1v1h2V4H3zm3 0v1h7V4H6z"/>
            </svg>
            Terminal
          </button>
          <button v-if="panelVisibility.problems" :class="['panel-tab', { active: bottomPanel === 'problems' }]"
                  @click="togglePanel('problems')" @dblclick="handlePanelDblClick('problems')">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path fill="currentColor" d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 11V9h2v2H7zm0-4V4h2v3H7z"/>
            </svg>
            Problems <span class="badge">{{ problems.length }}</span>
          </button>
          <div class="panel-actions">
            <button class="panel-action-btn" @click="closePanel" title="关闭所有面板">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path
                    d="M12.207 3.793l-1.414-1.414L8 5.172 5.207 2.379 3.793 3.793 6.586 6.586 3.793 9.379l1.414 1.414L8 7.999l2.793 2.794 1.414-1.414L9.414 6.586z"
                    fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="panel-content">
          <div v-if="bottomPanel === 'terminal'" class="terminal-output">
            <div v-for="(line, index) in terminalOutput" :key="index" class="terminal-line">
              {{ line }}
            </div>
          </div>
          <div v-if="bottomPanel === 'problems'" class="problems-list">
            <div v-for="(problem, index) in problems" :key="index" class="problem-item">
              <svg class="problem-icon" viewBox="0 0 16 16" width="14" height="14">
                <circle cx="8" cy="8" r="7" fill="#f48771"/>
              </svg>
              <span class="problem-text">{{ problem.message }}</span>
              <span class="problem-location">Ln {{ problem.line }}, Col {{ problem.column }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 已关闭面板的图标栏（始终显示） -->
      <div class="minimized-panel-bar">
        <button v-if="!panelVisibility.terminal" class="minimized-panel-btn" @click="togglePanel('terminal')"
                title="Terminal">
          <svg viewBox="0 0 16 16" width="16" height="16">
            <path fill="currentColor" d="M0 2v12h16V2H0zm1 1h14v10H1V3zm2 1v1h2V4H3zm3 0v1h7V4H6z"/>
          </svg>
        </button>
        <button v-if="!panelVisibility.problems" class="minimized-panel-btn" @click="togglePanel('problems')"
                title="Problems">
          <svg viewBox="0 0 16 16" width="16" height="16">
            <path fill="currentColor" d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 11V9h2v2H7zm0-4V4h2v3H7z"/>
          </svg>
          <span v-if="problems.length > 0" class="minimized-badge">{{ problems.length }}</span>
        </button>
      </div>
    </div>

    <!-- 关于弹窗 -->
    <div v-if="showAboutDialog" class="dialog-overlay" @click="showAboutDialog = false">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">关于</h3>
          <button class="dialog-close" @click="showAboutDialog = false">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="about-section">
            <label class="about-label">文件名</label>
            <input v-model="currentFile.name" class="about-input" readonly>
          </div>
          <div class="about-section">
            <label class="about-label">类型</label>
            <input v-model="currentFile.type" class="about-input" readonly>
          </div>
          <div class="about-section">
            <label class="about-label">最后编辑时间</label>
            <input v-model="currentFile.lastModified" class="about-input" readonly>
          </div>
          <div class="about-section">
            <label class="about-label">作者</label>
            <input :value="currentFile.author || '当前用户'" class="about-input" readonly>
          </div>
          <div class="about-section">
            <label class="about-label">描述</label>
            <textarea v-model="currentFile.description" class="about-textarea" placeholder="输入策略/指标/库的描述信息"
                      rows="4"></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn secondary" @click="showAboutDialog = false">取消</button>
          <button class="dialog-btn primary" @click="saveAboutInfo">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted} from 'vue';
import * as monaco from 'monaco-editor';

// 配置 Monaco 环境，禁用 Web Workers
// 创建一个最小化的 worker blob，避免加载错误
const workerBlob = new Blob([`
  self.onmessage = function() {
    // 最小化 worker，不执行任何操作
  };
`], {type: 'application/javascript'});
const workerUrl = URL.createObjectURL(workerBlob);

(self as any).MonacoEnvironment = {
  getWorker() {
    return new Worker(workerUrl);
  }
};

interface CodeFile {
  id: string;
  name: string;
  type: 'indicator' | 'strategy' | 'library';
  content: string;
  lastModified: string;
  description?: string;
  author?: string;
}

interface Problem {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

// 文件列表
const indicatorFiles = ref<CodeFile[]>([
  {
    id: '1',
    name: 'MATrader.py',
    type: 'indicator',
    content: `# MATrader.py - 移动平均线交易指标
def calculate_ma(symbol, timeframe, period, mode):
    """计算移动平均线"""
    # TODO: 实现移动平均线计算逻辑
    pass
`,
    lastModified: '2023-09-11 11:11:11'
  },
  {
    id: '2',
    name: 'FibonacciTrend.py',
    type: 'indicator',
    content: '# Fibonacci Trend Indicator\n',
    lastModified: '2023-09-10 10:00:00'
  },
  {
    id: '3',
    name: 'MACD.py',
    type: 'indicator',
    content: '# MACD Indicator\n',
    lastModified: '2023-09-09 09:00:00'
  },
  {
    id: '4',
    name: 'Golder.py',
    type: 'indicator',
    content: '# Golden Cross Indicator\n',
    lastModified: '2023-09-08 08:00:00'
  }
]);

const strategyFiles = ref<CodeFile[]>([
  {
    id: '5',
    name: 'MAPlus.py',
    type: 'strategy',
    content: '# MA Plus Strategy\n',
    lastModified: '2023-09-11 11:11:11'
  },
  {
    id: '6',
    name: 'DoubleRSILines.py',
    type: 'strategy',
    content: '# Double RSI Lines Strategy\n',
    lastModified: '2023-09-10 10:00:00'
  }
]);

const libraryFiles = ref<CodeFile[]>([
  {
    id: '7',
    name: 'TradeLib.py',
    type: 'library',
    content: '# Trade Library\n',
    lastModified: '2023-09-11 11:11:11'
  }
]);

const currentFile = ref<CodeFile | null>(null);
const editorContainer = ref<HTMLDivElement>();
const bottomPanel = ref<'terminal' | 'problems' | null>('terminal');
const showAboutDialog = ref(false);

// 控制每个面板的可见性
const panelVisibility = ref({
  terminal: true,
  problems: true
});
const categoryExpanded = ref({
  indicator: false,
  strategy: false,
  library: false
});

// 侧边栏拖拽相关状态
const sidebarWidth = ref(250);
const isSidebarResizing = ref(false);
const startSidebarX = ref(0);
const startSidebarWidth = ref(0);

// 底部面板拖拽相关状态
const panelHeight = ref(120);
const isPanelResizing = ref(false);
const startPanelY = ref(0);
const startPanelHeight = ref(0);

// 侧边栏宽度限制
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 500;

// 底部面板高度限制
const MIN_PANEL_HEIGHT = 100;
const MAX_PANEL_HEIGHT = 600;

// 计算面板是否打开（至少有一个面板可见）
const isPanelOpen = computed(() => panelVisibility.value.terminal || panelVisibility.value.problems);

// 计算是否有被关闭的面板（用于显示底部图标栏）
const hasClosedPanels = computed(() => !panelVisibility.value.terminal || !panelVisibility.value.problems);

// 计算是否所有分类都折叠
const allCollapsed = computed(() => {
  return !categoryExpanded.value.indicator &&
      !categoryExpanded.value.strategy &&
      !categoryExpanded.value.library;
});

const terminalOutput = ref<string[]>([
  '> 欢迎使用量化交易编辑器',
  '> Python 3.11.0 已就绪'
]);
const problems = ref<Problem[]>([
  {message: '未定义的变量: symbol', line: 4, column: 16, severity: 'error'}
]);

let editor: monaco.editor.IStandaloneCodeEditor | null = null;
let resizeObserver: ResizeObserver | null = null;

// 打开文件
const openFile = (file: CodeFile) => {
  currentFile.value = file;
  if (editor) {
    editor.setValue(file.content);
  }
};

// 切换分类折叠状态
const toggleCategory = (category: 'indicator' | 'strategy' | 'library') => {
  categoryExpanded.value[category] = !categoryExpanded.value[category];
};

// 切换全部折叠/展开
const toggleAllCategories = () => {
  if (allCollapsed.value) {
    // 当前全部折叠，则全部展开
    categoryExpanded.value.indicator = true;
    categoryExpanded.value.strategy = true;
    categoryExpanded.value.library = true;
  } else {
    // 当前有展开的，则全部折叠
    categoryExpanded.value.indicator = false;
    categoryExpanded.value.strategy = false;
    categoryExpanded.value.library = false;
  }
};

// 添加文件
const addFile = (type: 'indicator' | 'strategy' | 'library') => {
  const newFile: CodeFile = {
    id: Date.now().toString(),
    name: `new_${type}.py`,
    type,
    content: `# New ${type}\n`,
    lastModified: new Date().toLocaleString('zh-CN')
  };

  if (type === 'indicator') {
    indicatorFiles.value.push(newFile);
  } else if (type === 'strategy') {
    strategyFiles.value.push(newFile);
  } else {
    libraryFiles.value.push(newFile);
  }

  openFile(newFile);
};

// 显示文件菜单
const showFileMenu = (file: CodeFile) => {
  console.log('Show menu for:', file.name);
};

// 保存文件
const saveFile = () => {
  if (currentFile.value && editor) {
    currentFile.value.content = editor.getValue();
    currentFile.value.lastModified = new Date().toLocaleString('zh-CN');
    terminalOutput.value.push(`> 文件已保存: ${currentFile.value.name}`);
  }
};

// 检查代码
const checkCode = () => {
  terminalOutput.value.push('> 正在检查代码...');
  // TODO: 实现代码检查逻辑
};

// 回测
const backtest = () => {
  terminalOutput.value.push('> 启动回测...');
  // TODO: 实现回测逻辑
};

// 启动策略
const startStrategy = () => {
  terminalOutput.value.push('> 启动策略...');
  // TODO: 实现策略启动逻辑
};

// 保存关于信息
const saveAboutInfo = () => {
  if (currentFile.value) {
    showAboutDialog.value = false;
    terminalOutput.value.push(`> 已更新文件信息: ${currentFile.value.name}`);
  }
};

// 开始拖拽侧边栏
const startSidebarResize = (e: MouseEvent) => {
  isSidebarResizing.value = true;
  startSidebarX.value = e.clientX;
  startSidebarWidth.value = sidebarWidth.value;

  document.addEventListener('mousemove', handleSidebarResize);
  document.addEventListener('mouseup', stopSidebarResize);
  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';

  e.preventDefault();
};

// 处理拖拽侧边栏
const handleSidebarResize = (e: MouseEvent) => {
  if (!isSidebarResizing.value) return;

  const deltaX = e.clientX - startSidebarX.value;
  const newWidth = startSidebarWidth.value + deltaX;

  // 限制宽度范围
  sidebarWidth.value = Math.max(MIN_SIDEBAR_WIDTH, Math.min(newWidth, MAX_SIDEBAR_WIDTH));
};

// 停止拖拽侧边栏
const stopSidebarResize = () => {
  isSidebarResizing.value = false;
  document.removeEventListener('mousemove', handleSidebarResize);
  document.removeEventListener('mouseup', stopSidebarResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
};

// 切换面板
const togglePanel = (panel: 'terminal' | 'problems') => {
  // 如果该面板不可见，先设为可见
  if (!panelVisibility.value[panel]) {
    panelVisibility.value[panel] = true;
  }
  // 切换到该面板
  bottomPanel.value = panel;
};

// 双击关闭面板
const handlePanelDblClick = (panel: 'terminal' | 'problems') => {
  if (bottomPanel.value === panel) {
    // 双击当前激活的tab，隐藏该面板
    panelVisibility.value[panel] = false;

    // 检查是否还有其他可见的面板
    const otherPanel = panel === 'terminal' ? 'problems' : 'terminal';
    if (panelVisibility.value[otherPanel]) {
      // 切换到另一个可见的面板
      bottomPanel.value = otherPanel;
    } else {
      // 没有可见的面板了
      bottomPanel.value = null;
    }
  }
};

// 关闭所有面板
const closePanel = () => {
  panelVisibility.value.terminal = false;
  panelVisibility.value.problems = false;
  bottomPanel.value = null;
};

// 开始拖拽底部面板
const startPanelResize = (e: MouseEvent) => {
  isPanelResizing.value = true;
  startPanelY.value = e.clientY;
  startPanelHeight.value = panelHeight.value;

  document.addEventListener('mousemove', handlePanelResize);
  document.addEventListener('mouseup', stopPanelResize);
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';

  e.preventDefault();
};

// 处理拖拽底部面板
const handlePanelResize = (e: MouseEvent) => {
  if (!isPanelResizing.value) return;

  const deltaY = startPanelY.value - e.clientY; // 注意：向上拖是正值
  const newHeight = startPanelHeight.value + deltaY;

  // 限制高度范围
  panelHeight.value = Math.max(MIN_PANEL_HEIGHT, Math.min(newHeight, MAX_PANEL_HEIGHT));
};

// 停止拖拽底部面板
const stopPanelResize = () => {
  isPanelResizing.value = false;
  document.removeEventListener('mousemove', handlePanelResize);
  document.removeEventListener('mouseup', stopPanelResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
};

onMounted(() => {
  if (editorContainer.value) {
    // 初始化 Monaco Editor - 禁用需要 worker 的功能来避免错误
    editor = monaco.editor.create(editorContainer.value, {
      value: indicatorFiles.value[0].content,
      language: 'python',
      theme: 'vs',
      fontSize: 14,
      minimap: {enabled: true},
      automaticLayout: false, // 禁用自动布局，手动控制
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible'
      },
      // 禁用颜色装饰器（这个功能需要 worker）
      colorDecorators: false,
      // 禁用链接检测（这个功能也可能需要 worker）
      links: false
    });

    currentFile.value = indicatorFiles.value[0];

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      if (currentFile.value) {
        currentFile.value.content = editor!.getValue();
      }
    });

    // 初始化布局函数
    const updateLayout = () => {
      if (editor && editorContainer.value) {
        const width = editorContainer.value.clientWidth;
        const height = editorContainer.value.clientHeight;
        console.log('Editor layout update:', {width, height});
        editor.layout({width, height});
      }
    };

    // 多次尝试初始化布局，确保容器已经渲染
    setTimeout(updateLayout, 0);
    setTimeout(updateLayout, 100);
    setTimeout(updateLayout, 300);

    // 添加 ResizeObserver 监听容器尺寸变化
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;
        console.log('Container resized:', {width, height});
        if (editor && width > 0 && height > 0) {
          editor.layout({width, height});
        }
      }
    });
    resizeObserver.observe(editorContainer.value);
  }
});

onUnmounted(() => {
  // 断开 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // 清理侧边栏拖拽事件
  document.removeEventListener('mousemove', handleSidebarResize);
  document.removeEventListener('mouseup', stopSidebarResize);

  // 清理底部面板拖拽事件
  document.removeEventListener('mousemove', handlePanelResize);
  document.removeEventListener('mouseup', stopPanelResize);

  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped>
.quantitative-editor {
  display: flex;
  height: 100%;
  width: 100%;
  background: #f8f9fa;
}

/* 左侧文件树 */
.file-sidebar {
  background: #ffffff;
  border-right: 1px solid #e0e3eb;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

/* 垂直拖拽分割线 */
.vertical-resize-handle {
  width: 6px;
  background: transparent;
  cursor: ew-resize;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.vertical-resize-handle:hover {
  background: #e8f5e9;
}

.vertical-resize-handle.is-resizing {
  background: #26a69a;
}

.vertical-resize-handle-line {
  height: 100%;
  width: 1px;
  background: #e0e3eb;
  pointer-events: none;
}

.vertical-resize-handle:hover .vertical-resize-handle-line {
  background: #26a69a;
  width: 2px;
}

.vertical-resize-handle.is-resizing .vertical-resize-handle-line {
  background: #ffffff;
  width: 2px;
}

.sidebar-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 10px;
  border-bottom: 1px solid #e0e3eb;
  background: #ffffff;
}

.collapse-all-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #76808f;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.collapse-all-btn:hover {
  background: #f0f3fa;
  color: #3b4252;
}

.file-category {
  border-bottom: 1px solid #e0e3eb;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e3eb;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.category-header:hover {
  background: #f0f3fa;
}

.collapse-icon {
  color: #76808f;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.category-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #3b4252;
}

.add-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #2962ff;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #e8f5e9;
}

.file-list {
  padding: 4px 0;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
  gap: 8px;
}

.file-item:hover {
  background: #f0f3fa;
}

.file-item.active {
  background: #e8f5e9;
  color: #2962ff;
}

.file-icon {
  color: #2962ff;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-btn {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: #76808f;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s;
}

.file-item:hover .more-btn {
  opacity: 1;
}

.more-btn:hover {
  background: #e0e3eb;
}

/* 右侧编辑区域 */
.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e3eb;
  height: 36px;
  gap: 16px;
}

.file-info-section {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  flex: 1;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-selector {
  padding: 6px 12px;
  border: 1px solid #e0e3eb;
  border-radius: 4px;
  font-size: 13px;
  background: #ffffff;
  cursor: pointer;
  outline: none;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.tool-btn {
  padding: 4px 12px;
  background: #ffffff;
  border: 1px solid #e0e3eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #3b4252;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tool-btn:hover {
  background: #f8f9fa;
  border-color: #2962ff;
  color: #2962ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(41, 98, 255, 0.15);
}

.tool-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 启动按钮特殊样式 */
.tool-btn:nth-child(4) {
  background: linear-gradient(135deg, #26a69a 0%, #1e8e7e 100%);
  color: #ffffff;
  border-color: transparent;
}

.tool-btn:nth-child(4):hover {
  background: linear-gradient(135deg, #1e8e7e 0%, #17756a 100%);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(38, 166, 154, 0.3);
}

.tool-btn.more {
  padding: 4px 10px;
}

.file-info-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e3eb;
  font-size: 12px;
}

.file-name-display {
  font-weight: 600;
  color: #3b4252;
}

.file-meta {
  color: #76808f;
}

.about-btn {
  margin-left: -14px;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #3b4252;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.about-btn:hover {
  background: #e0e3eb;
  transform: scale(1.1);
}

.about-btn svg {
  display: block;
}

.editor-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

/* 水平拖拽分割线 */
.horizontal-resize-handle {
  height: 6px;
  background: transparent;
  cursor: ns-resize;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.horizontal-resize-handle:hover {
  background: #e8f5e9;
}

.horizontal-resize-handle.is-resizing {
  background: #26a69a;
}

.horizontal-resize-handle-line {
  width: 100%;
  height: 1px;
  background: #e0e3eb;
  pointer-events: none;
}

.horizontal-resize-handle:hover .horizontal-resize-handle-line {
  background: #26a69a;
  height: 2px;
}

.horizontal-resize-handle.is-resizing .horizontal-resize-handle-line {
  background: #ffffff;
  height: 2px;
}

/* 底部面板 */
.bottom-panel {
  flex-shrink: 0;
  background: #ffffff;
  border-top: 1px solid #e0e3eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e3eb;
  height: 36px;
}

.panel-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  font-size: 12px;
  color: #76808f;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  user-select: none;
}

.panel-tab:hover {
  color: #3b4252;
}

.panel-tab.active {
  color: #2962ff;
  border-bottom-color: #2962ff;
}

.badge {
  background: #ef5350;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  min-width: 16px;
  text-align: center;
}

.panel-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.panel-action-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #76808f;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.panel-action-btn:hover {
  background: #e0e3eb;
  color: #3b4252;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.terminal-output {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #3b4252;
}

.terminal-line {
  margin-bottom: 4px;
}

.problems-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.problem-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fff5f5;
  border-radius: 4px;
  font-size: 12px;
}

.problem-icon {
  flex-shrink: 0;
}

.problem-text {
  flex: 1;
  color: #3b4252;
}

.problem-location {
  color: #76808f;
  font-size: 11px;
}

/* 最小化面板栏 */
.minimized-panel-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #ffffff;
  border-top: 1px solid #e0e3eb;
  height: 36px;
  flex-shrink: 0;
}

.minimized-panel-btn {
  width: 32px;
  height: 28px;
  background: transparent;
  border: none;
  color: #76808f;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.minimized-panel-btn:hover {
  background: #f0f3fa;
  color: #3b4252;
}

.minimized-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef5350;
  color: white;
  padding: 1px 4px;
  border-radius: 8px;
  font-size: 9px;
  min-width: 14px;
  text-align: center;
  font-weight: 600;
  line-height: 1.2;
}


/* 关于弹窗 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog-container {
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e3eb;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #3b4252;
  margin: 0;
}

.dialog-close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: #76808f;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.dialog-close:hover {
  background: #f0f3fa;
  color: #3b4252;
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.about-section {
  margin-bottom: 16px;
}

.about-section:last-child {
  margin-bottom: 0;
}

.about-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #3b4252;
  margin-bottom: 8px;
}

.about-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e3eb;
  border-radius: 6px;
  font-size: 14px;
  color: #3b4252;
  background: #ffffff;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.about-input:focus {
  outline: none;
  border-color: #2962ff;
  box-shadow: 0 0 0 3px rgba(41, 98, 255, 0.1);
}

.about-input:read-only {
  background: #f8f9fa;
  color: #76808f;
  cursor: not-allowed;
}

.about-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e3eb;
  border-radius: 6px;
  font-size: 14px;
  color: #3b4252;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.about-textarea:focus {
  outline: none;
  border-color: #2962ff;
  box-shadow: 0 0 0 3px rgba(41, 98, 255, 0.1);
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #e0e3eb;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.dialog-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-btn.secondary {
  background: #ffffff;
  color: #3b4252;
  border: 1px solid #e0e3eb;
}

.dialog-btn.secondary:hover {
  background: #f0f3fa;
  border-color: #c4c9d4;
}

.dialog-btn.primary {
  background: linear-gradient(135deg, #2962ff 0%, #1e4fd9 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(41, 98, 255, 0.2);
}

.dialog-btn.primary:hover {
  background: linear-gradient(135deg, #1e4fd9 0%, #1a45c4 100%);
  box-shadow: 0 4px 12px rgba(41, 98, 255, 0.3);
  transform: translateY(-1px);
}

.dialog-btn.primary:active {
  transform: translateY(0);
}
</style>
