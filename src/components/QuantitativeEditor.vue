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
              @contextmenu.prevent="showFileMenu(file, $event)"
          >
            <svg class="file-icon" viewBox="0 0 16 16" width="16" height="16">
              <path fill="currentColor" d="M4 0h5.5L14 4.5V16H2V0h2zm0 1v14h9V5h-4V1H4z"/>
            </svg>
            <span class="file-name">{{ file.name }}</span>
            <button class="more-btn" @click.stop="showFileMenu(file, $event)">...</button>
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
              @contextmenu.prevent="showFileMenu(file, $event)"
          >
            <svg class="file-icon" viewBox="0 0 16 16" width="16" height="16">
              <path fill="currentColor" d="M4 0h5.5L14 4.5V16H2V0h2zm0 1v14h9V5h-4V1H4z"/>
            </svg>
            <span class="file-name">{{ file.name }}</span>
            <button class="more-btn" @click.stop="showFileMenu(file, $event)">...</button>
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
              @contextmenu.prevent="showFileMenu(file, $event)"
          >
            <svg class="file-icon" viewBox="0 0 16 16" width="16" height="16">
              <path fill="currentColor" d="M4 0h5.5L14 4.5V16H2V0h2zm0 1v14h9V5h-4V1H4z"/>
            </svg>
            <span class="file-name">{{ file.name }}</span>
            <button class="more-btn" @click.stop="showFileMenu(file, $event)">...</button>
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
          <button v-if="currentFile.type === 'indicator'" class="tool-btn" @click="addIndicator">添加</button>
          <button v-if="currentFile.type === 'strategy'" class="tool-btn" @click="backtest" :disabled="isCheckingAgent">
            {{ isCheckingAgent ? '检测中...' : '回测' }}
          </button>
          <button v-if="currentFile.type === 'strategy'" class="tool-btn" @click="startStrategy">启动</button>
          <button class="tool-btn more">更多</button>
        </div>
      </div>

      <!-- 欢迎页面（无文件打开时） -->
      <div v-if="!currentFile" class="welcome-page">
        <div class="welcome-content">
          <svg viewBox="0 0 64 64" width="64" height="64" style="margin-bottom: 20px;">
            <path d="M32 8l-4 4-4-4-4 4-4-4-4 4-4-4v40l4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4V8l-4 4-4-4-4 4z" fill="none" stroke="#76808f" stroke-width="2"/>
            <line x1="16" y1="20" x2="48" y2="20" stroke="#76808f" stroke-width="2"/>
            <line x1="16" y1="28" x2="48" y2="28" stroke="#76808f" stroke-width="2"/>
            <line x1="16" y1="36" x2="40" y2="36" stroke="#76808f" stroke-width="2"/>
          </svg>
          <h3 class="welcome-title">欢迎使用量化编辑器</h3>
          <p class="welcome-subtitle">从左侧选择一个文件开始编辑，或创建一个新文件</p>
          <div class="welcome-actions">
            <button class="welcome-btn" @click="addFile('indicator')">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
              新建指标
            </button>
            <button class="welcome-btn" @click="addFile('strategy')">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
              新建策略
            </button>
            <button class="welcome-btn" @click="addFile('library')">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
              新建库
            </button>
          </div>
        </div>
      </div>

      <!-- Monaco 编辑器 -->
      <div v-if="currentFile" class="editor-container" ref="editorContainer"></div>

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
    <div v-if="showAboutDialog && currentFile" class="dialog-overlay" @click="showAboutDialog = false">
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
            <label class="about-label">版本</label>
            <input :value="currentFile.version || '1.0.0'" class="about-input" readonly>
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

    <!-- 新建文件弹窗 -->
    <div v-if="showNewFileDialog" class="dialog-overlay" @click="showNewFileDialog = false">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">新建{{ newFileType === 'indicator' ? '指标' : newFileType === 'strategy' ? '策略' : '库' }}</h3>
          <button class="dialog-close" @click="showNewFileDialog = false">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="about-section">
            <label class="about-label">名称 <span class="required">*</span></label>
            <input
              v-model="newFileName"
              :class="['about-input', { 'input-error': fileNameError }]"
              placeholder="请输入文件名（不含扩展名）"
              @input="validateFileName(newFileName)"
              maxlength="100"
            >
            <span v-if="fileNameError" class="error-message">{{ fileNameError }}</span>
            <span class="input-hint">{{ newFileName.length }}/100 字符，仅支持文字、字母、数字、下划线</span>
          </div>

          <div class="about-section">
            <label class="about-label">模板</label>
            <select v-model="newFileTemplate" class="about-select">
              <option v-for="template in getTemplateOptions(newFileType)" :key="template" :value="template">
                {{ template }}
              </option>
            </select>
          </div>

          <!-- 高级选项（默认收起） -->
          <div class="advanced-toggle" @click="showAdvancedOptions = !showAdvancedOptions">
            <svg class="collapse-icon" :class="{ collapsed: !showAdvancedOptions }" viewBox="0 0 16 16" width="12" height="12">
              <path fill="currentColor" d="M5 6l3 3 3-3z"/>
            </svg>
            <span>高级选项</span>
          </div>

          <div v-show="showAdvancedOptions" class="advanced-options">
            <div class="about-section">
              <label class="about-label">版本</label>
              <input
                v-model="newFileVersion"
                class="about-input"
                placeholder="例如：1.0.0"
                @input="() => { if (!validateVersion(newFileVersion)) newFileVersion = newFileVersion.slice(0, -1) }"
                maxlength="100"
              >
              <span class="input-hint">{{ newFileVersion.length }}/100 字符，仅支持文字、字母、数字、下划线、句号</span>
            </div>

            <div class="about-section">
              <label class="about-label">介绍</label>
              <textarea
                v-model="newFileDescription"
                class="about-textarea"
                placeholder="请输入文件介绍"
                rows="3"
                @input="() => { if (!validateDescription(newFileDescription)) newFileDescription = newFileDescription.slice(0, -1) }"
                maxlength="300"
              ></textarea>
              <span class="input-hint">{{ newFileDescription.length }}/300 字符</span>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn secondary" @click="showNewFileDialog = false">取消</button>
          <button class="dialog-btn primary" @click="createNewFile" :disabled="!!fileNameError || !newFileName">创建</button>
        </div>
      </div>
    </div>

    <!-- 文件右键菜单 -->
    <div
      v-if="showContextMenu"
      class="context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="openFileFromMenu">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path fill="currentColor" d="M4 0h5.5L14 4.5V16H2V0h2zm0 1v14h9V5h-4V1H4z"/>
        </svg>
        打开
      </div>
      <div class="context-menu-item" @click="renameFile">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path fill="currentColor" d="M12.854 1.146a.5.5 0 0 0-.708 0L10.5 2.793 13.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-2-2zM10 3.5L1.5 12v2.5H4l8.5-8.5L10 3.5z"/>
        </svg>
        重命名
      </div>
      <div class="context-menu-item" @click="copyFile">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path fill="currentColor" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z"/>
        </svg>
        复制
      </div>
      <div class="context-menu-item" @click="pasteFile" :class="{ disabled: !clipboard }">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path fill="currentColor" d="M4.5 3a.5.5 0 0 0-.5.5V14a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V3.5a.5.5 0 0 0-.5-.5h-7zM4 3.5A1.5 1.5 0 0 1 5.5 2h5A1.5 1.5 0 0 1 12 3.5V14a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 2 14V3.5z"/>
        </svg>
        粘贴
      </div>
      <div class="context-menu-item" @click="downloadFile">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path fill="currentColor" d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h4a1.5 1.5 0 0 1 1.5 1.5v1H10v-1zM2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm6.854 7.146l2 2a.5.5 0 0 1-.708.708L8.5 9.707V13.5a.5.5 0 0 1-1 0V9.707l-1.646 1.647a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0z"/>
        </svg>
        下载到本地
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item danger" @click="deleteFile">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path fill="currentColor" d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11zm1.958 1l-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916z"/>
        </svg>
        删除
      </div>
    </div>

    <!-- 重命名对话框 -->
    <div v-if="showRenameDialog" class="dialog-overlay" @click="showRenameDialog = false">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">重命名文件</h3>
          <button class="dialog-close" @click="showRenameDialog = false">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="about-section">
            <label class="about-label">新文件名 <span class="required">*</span></label>
            <input
              v-model="renameFileName"
              :class="['about-input', { 'input-error': renameFileNameError }]"
              placeholder="请输入新文件名（不含 .py 扩展名）"
              @input="validateRenameFileName"
              @keyup.enter="confirmRename"
              ref="renameInput"
              maxlength="100"
            >
            <span v-if="renameFileNameError" class="error-message">{{ renameFileNameError }}</span>
            <span class="input-hint">{{ renameFileName.length }}/100 字符，仅支持文字、字母、数字、下划线</span>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn secondary" @click="showRenameDialog = false">取消</button>
          <button class="dialog-btn primary" @click="confirmRename" :disabled="!!renameFileNameError || !renameFileName">确定</button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirmDialog" class="dialog-overlay" @click="showDeleteConfirmDialog = false">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">删除文件</h3>
          <button class="dialog-close" @click="showDeleteConfirmDialog = false">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="delete-confirm-content">
            <svg viewBox="0 0 48 48" width="48" height="48" style="color: #f44336;">
              <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="M24 14v16M24 34v2" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <p class="delete-confirm-message">
              确定要删除文件 <strong>"{{ deleteConfirmFileName }}"</strong> 吗？
            </p>
            <p class="delete-confirm-warning">此操作无法撤销。</p>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn secondary" @click="showDeleteConfirmDialog = false">取消</button>
          <button class="dialog-btn danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>

    <!-- Agent 未安装提示对话框 -->
    <div v-if="showAgentNotInstalledDialog" class="dialog-overlay" @click="showAgentNotInstalledDialog = false">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">需要安装 Quant Agent</h3>
          <button class="dialog-close" @click="showAgentNotInstalledDialog = false">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="agent-install-content">
            <svg viewBox="0 0 48 48" width="64" height="64" style="color: #2962ff;">
              <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="M24 14v2M24 20v12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              <circle cx="24" cy="36" r="1.5" fill="currentColor"/>
            </svg>
            <p class="agent-install-title">需要本地 Quant Agent 支持</p>
            <p class="agent-install-message">
              回测功能需要在本地运行 Quant Agent 客户端。<br>
              请先下载并安装 Quant Agent，然后重新点击回测。
            </p>
            <div class="agent-install-features">
              <div class="feature-item">
                <svg viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                本地执行，数据安全
              </div>
              <div class="feature-item">
                <svg viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                高性能回测引擎
              </div>
              <div class="feature-item">
                <svg viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                无需配置环境
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn secondary" @click="showAgentNotInstalledDialog = false">稍后再说</button>
          <button class="dialog-btn primary" @click="downloadAgent">立即下载</button>
        </div>
      </div>
    </div>

    <!-- Agent 已运行提示对话框 -->
    <div v-if="showAgentRunningDialog" class="dialog-overlay" @click="showAgentRunningDialog = false">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">Agent 已运行中</h3>
          <button class="dialog-close" @click="showAgentRunningDialog = false">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="agent-install-content">
            <svg viewBox="0 0 48 48" width="64" height="64" style="color: #26a69a;">
              <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="M20 24l4 4 8-8" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <p class="agent-install-title">Agent 已运行中</p>
            <p class="agent-install-message">
              Quant Agent 客户端正在运行中，可以开始回测任务。
            </p>
            <div class="agent-install-features" style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin-top: 20px;">
              <div style="color: #76808f; font-size: 13px; line-height: 1.6;">
                <strong style="color: #3b4252;">TODO: 回测功能</strong><br>
                回测功能正在开发中，敬请期待。
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn primary" @click="showAgentRunningDialog = false">知道了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, nextTick} from 'vue';
import * as monaco from 'monaco-editor';
import { quantAgentService, AgentStatus } from '../services/QuantAgentService';

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
  version?: string;
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
const bottomPanel = ref<'terminal' | 'problems' | null>(null);
const showAboutDialog = ref(false);
const showNewFileDialog = ref(false);
const newFileType = ref<'indicator' | 'strategy' | 'library'>('indicator');
const newFileName = ref('');
const newFileTemplate = ref('空白模板');
const newFileVersion = ref('1.0.0');
const newFileDescription = ref('');
const showAdvancedOptions = ref(false);
const fileNameError = ref('');

// 右键菜单相关状态
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextMenuFile = ref<CodeFile | null>(null);

// 重命名对话框状态
const showRenameDialog = ref(false);
const renameFileName = ref('');
const renameFileNameError = ref('');
const renameInput = ref<HTMLInputElement>();

// 剪贴板（用于复制粘贴）
const clipboard = ref<CodeFile | null>(null);

// 当前选中的文件（用于键盘快捷键）
const selectedFile = ref<CodeFile | null>(null);

// 删除确认对话框状态
const showDeleteConfirmDialog = ref(false);
const deleteConfirmFileName = ref('');

// Agent 未安装提示对话框
const showAgentNotInstalledDialog = ref(false);

// Agent 已运行提示对话框
const showAgentRunningDialog = ref(false);

// Agent 状态检测中
const isCheckingAgent = ref(false);

// 控制每个面板的可见性（默认都关闭）
const panelVisibility = ref({
  terminal: false,
  problems: false
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
const openFile = async (file: CodeFile) => {
  selectedFile.value = file; // 设置选中文件
  currentFile.value = file;

  // 等待 DOM 更新，确保 editorContainer 已经渲染
  await nextTick();

  // 如果编辑器还未创建，则创建编辑器
  if (!editor && editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: file.content,
      language: 'python',
      theme: 'vs',
      fontSize: 14,
      minimap: {enabled: true},
      automaticLayout: false,
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible'
      },
      colorDecorators: false,
      links: false
    });

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      if (currentFile.value) {
        currentFile.value.content = editor!.getValue();
      }
    });

    // 初始化布局
    const updateLayout = () => {
      if (editor && editorContainer.value) {
        const width = editorContainer.value.clientWidth;
        const height = editorContainer.value.clientHeight;
        editor.layout({width, height});
      }
    };

    setTimeout(updateLayout, 0);
    setTimeout(updateLayout, 100);
    setTimeout(updateLayout, 300);

    // 添加 ResizeObserver 监听容器尺寸变化
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;
        if (editor && width > 0 && height > 0) {
          editor.layout({width, height});
        }
      }
    });
    resizeObserver.observe(editorContainer.value);
  } else if (editor) {
    // 编辑器已存在，只需要更新内容
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
  newFileType.value = type;
  newFileName.value = '';
  newFileTemplate.value = '空白模板';
  newFileVersion.value = '1.0.0';
  newFileDescription.value = '';
  showAdvancedOptions.value = false;
  fileNameError.value = '';
  showNewFileDialog.value = true;
};

// 验证文件名
const validateFileName = (name: string): boolean => {
  if (!name) {
    fileNameError.value = '名称不能为空';
    return false;
  }
  if (name.length > 100) {
    fileNameError.value = '名称不能超过100个字符';
    return false;
  }
  // 只允许文字（包括中文）、英文字母、数字、下划线
  const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
  if (!validPattern.test(name)) {
    fileNameError.value = '名称只能包含文字、字母、数字和下划线';
    return false;
  }
  fileNameError.value = '';
  return true;
};

// 验证版本号
const validateVersion = (version: string): boolean => {
  if (version.length > 100) {
    return false;
  }
  // 只允许文字、字母、数字、下划线、句号
  const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_.]+$/;
  return validPattern.test(version);
};

// 验证介绍
const validateDescription = (description: string): boolean => {
  if (description.length > 300) {
    return false;
  }
  return true;
};

// 获取模板内容
const getTemplateContent = (type: 'indicator' | 'strategy' | 'library', template: string): string => {
  const templates: Record<string, Record<string, string>> = {
    indicator: {
      '空白模板': '# 新建指标\n',
      'MA指标模板': `# 移动平均线指标
def calculate_ma(data, period):
    """计算移动平均线"""
    # TODO: 实现移动平均线计算
    pass
`,
      'RSI指标模板': `# RSI指标
def calculate_rsi(data, period=14):
    """计算RSI指标"""
    # TODO: 实现RSI计算
    pass
`
    },
    strategy: {
      '空白模板': '# 新建策略\n',
      '趋势跟踪策略模板': `# 趋势跟踪策略
class TrendFollowingStrategy:
    def __init__(self):
        pass

    def on_bar(self, bar):
        """K线数据回调"""
        # TODO: 实现策略逻辑
        pass
`,
      '网格交易策略模板': `# 网格交易策略
class GridTradingStrategy:
    def __init__(self):
        self.grid_levels = []

    def on_bar(self, bar):
        """K线数据回调"""
        # TODO: 实现网格交易逻辑
        pass
`
    },
    library: {
      '空白模板': '# 新建库\n',
      '工具函数库模板': `# 工具函数库
def format_price(price, precision=2):
    """格式化价格"""
    return round(price, precision)

def calculate_profit(entry_price, exit_price, volume):
    """计算盈亏"""
    return (exit_price - entry_price) * volume
`,
      '数据处理库模板': `# 数据处理库
import pandas as pd

def process_data(data):
    """处理数据"""
    # TODO: 实现数据处理逻辑
    pass
`
    }
  };

  return templates[type][template] || templates[type]['空白模板'];
};

// 获取模板选项
const getTemplateOptions = (type: 'indicator' | 'strategy' | 'library'): string[] => {
  const options: Record<string, string[]> = {
    indicator: ['空白模板', 'MA指标模板', 'RSI指标模板'],
    strategy: ['空白模板', '趋势跟踪策略模板', '网格交易策略模板'],
    library: ['空白模板', '工具函数库模板', '数据处理库模板']
  };
  return options[type] || ['空白模板'];
};

// 创建新文件
const createNewFile = () => {
  // 验证文件名
  if (!validateFileName(newFileName.value)) {
    return;
  }

  const fileName = newFileName.value + '.py';
  const templateContent = getTemplateContent(newFileType.value, newFileTemplate.value);

  const newFile: CodeFile = {
    id: Date.now().toString(),
    name: fileName,
    type: newFileType.value,
    content: templateContent,
    lastModified: new Date().toLocaleString('zh-CN'),
    description: newFileDescription.value,
    author: '当前用户',
    version: newFileVersion.value
  };

  if (newFileType.value === 'indicator') {
    indicatorFiles.value.push(newFile);
  } else if (newFileType.value === 'strategy') {
    strategyFiles.value.push(newFile);
  } else {
    libraryFiles.value.push(newFile);
  }

  openFile(newFile);
  showNewFileDialog.value = false;
  terminalOutput.value.push(`> 已创建新文件: ${fileName}`);
};

// 显示文件右键菜单
const showFileMenu = (file: CodeFile, event?: MouseEvent) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  contextMenuFile.value = file;
  selectedFile.value = file; // 同时设置选中文件

  if (event) {
    // 计算菜单位置，确保不超出视口
    const menuWidth = 200;
    const menuHeight = 220;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = event.clientX;
    let y = event.clientY;

    // 右边界检查
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }

    // 下边界检查
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }

    contextMenuX.value = x;
    contextMenuY.value = y;
  }

  showContextMenu.value = true;
};

// 关闭右键菜单
const closeContextMenu = () => {
  showContextMenu.value = false;
};

// a. 打开文件（双击或右键菜单）
const openFileFromMenu = () => {
  if (contextMenuFile.value) {
    openFile(contextMenuFile.value);
  }
  closeContextMenu();
};

// b. 重命名文件
const renameFile = () => {
  if (!contextMenuFile.value) return;

  // 移除 .py 扩展名
  const nameWithoutExt = contextMenuFile.value.name.replace(/\.py$/, '');
  renameFileName.value = nameWithoutExt;
  renameFileNameError.value = '';

  closeContextMenu();
  showRenameDialog.value = true;

  // 等待对话框渲染后聚焦输入框
  nextTick(() => {
    renameInput.value?.focus();
    renameInput.value?.select();
  });
};

// 验证重命名文件名
const validateRenameFileName = () => {
  const name = renameFileName.value;
  if (!name) {
    renameFileNameError.value = '名称不能为空';
    return false;
  }
  if (name.length > 100) {
    renameFileNameError.value = '名称不能超过100个字符';
    return false;
  }
  const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
  if (!validPattern.test(name)) {
    renameFileNameError.value = '名称只能包含文字、字母、数字和下划线';
    return false;
  }

  // 检查是否与现有文件重名
  const newFileName = name + '.py';
  const files = contextMenuFile.value?.type === 'indicator'
    ? indicatorFiles.value
    : contextMenuFile.value?.type === 'strategy'
    ? strategyFiles.value
    : libraryFiles.value;

  const duplicate = files.some(f =>
    f.name === newFileName && f.id !== contextMenuFile.value?.id
  );

  if (duplicate) {
    renameFileNameError.value = '该名称已存在';
    return false;
  }

  renameFileNameError.value = '';
  return true;
};

// 确认重命名
const confirmRename = () => {
  if (!validateRenameFileName() || !contextMenuFile.value) return;

  const oldName = contextMenuFile.value.name;
  const newFileName = renameFileName.value + '.py';

  contextMenuFile.value.name = newFileName;
  contextMenuFile.value.lastModified = new Date().toLocaleString('zh-CN');

  terminalOutput.value.push(`> 文件已重命名: ${oldName} → ${newFileName}`);
  showRenameDialog.value = false;
};

// c. 复制文件（到剪贴板）
const copyFile = () => {
  if (!contextMenuFile.value) return;

  clipboard.value = { ...contextMenuFile.value };
  terminalOutput.value.push(`> 已复制: ${contextMenuFile.value.name}`);
  closeContextMenu();
};

// c. 粘贴文件
const pasteFile = () => {
  if (!clipboard.value) {
    terminalOutput.value.push('> 剪贴板为空，无法粘贴');
    return;
  }

  const originalName = clipboard.value.name.replace(/\.py$/, '');
  let copyNumber = 1;
  let newName = `${originalName}_copy${copyNumber}.py`;

  const files = clipboard.value.type === 'indicator'
    ? indicatorFiles.value
    : clipboard.value.type === 'strategy'
    ? strategyFiles.value
    : libraryFiles.value;

  // 找到一个不重复的名字
  while (files.some(f => f.name === newName)) {
    copyNumber++;
    newName = `${originalName}_copy${copyNumber}.py`;
  }

  const newFile: CodeFile = {
    id: Date.now().toString(),
    name: newName,
    type: clipboard.value.type,
    content: clipboard.value.content,
    lastModified: new Date().toLocaleString('zh-CN'),
    description: clipboard.value.description,
    author: clipboard.value.author || '当前用户',
    version: clipboard.value.version || '1.0.0',
  };

  if (newFile.type === 'indicator') {
    indicatorFiles.value.push(newFile);
  } else if (newFile.type === 'strategy') {
    strategyFiles.value.push(newFile);
  } else {
    libraryFiles.value.push(newFile);
  }

  terminalOutput.value.push(`> 文件已粘贴: ${newName}`);
  openFile(newFile); // 自动打开新文件
  closeContextMenu();
};

// d. 下载到本地
const downloadFile = () => {
  if (!contextMenuFile.value) return;

  const blob = new Blob([contextMenuFile.value.content], {
    type: 'text/plain;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = contextMenuFile.value.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  terminalOutput.value.push(`> 文件已下载: ${contextMenuFile.value.name}`);
  closeContextMenu();
};

// e. 删除文件
const deleteFile = () => {
  if (!contextMenuFile.value) return;

  deleteConfirmFileName.value = contextMenuFile.value.name;
  closeContextMenu();
  showDeleteConfirmDialog.value = true;
};

// 确认删除
const confirmDelete = () => {
  if (!contextMenuFile.value) return;

  const fileName = contextMenuFile.value.name;
  const fileId = contextMenuFile.value.id;

  if (contextMenuFile.value.type === 'indicator') {
    const index = indicatorFiles.value.findIndex(f => f.id === fileId);
    if (index !== -1) {
      indicatorFiles.value.splice(index, 1);
    }
  } else if (contextMenuFile.value.type === 'strategy') {
    const index = strategyFiles.value.findIndex(f => f.id === fileId);
    if (index !== -1) {
      strategyFiles.value.splice(index, 1);
    }
  } else {
    const index = libraryFiles.value.findIndex(f => f.id === fileId);
    if (index !== -1) {
      libraryFiles.value.splice(index, 1);
    }
  }

  // 如果删除的是当前打开的文件，关闭编辑器
  if (currentFile.value?.id === fileId) {
    currentFile.value = null;
    if (editor) {
      editor.setValue('');
    }
  }

  // 清空剪贴板（如果删除的是剪贴板中的文件）
  if (clipboard.value?.id === fileId) {
    clipboard.value = null;
  }

  terminalOutput.value.push(`> 文件已删除: ${fileName}`);
  showDeleteConfirmDialog.value = false;
};

// 键盘快捷键处理
const handleKeyDown = (e: KeyboardEvent) => {
  // Ctrl+C: 复制
  if (e.ctrlKey && e.key === 'c' && selectedFile.value) {
    e.preventDefault();
    contextMenuFile.value = selectedFile.value;
    copyFile();
  }

  // Ctrl+V: 粘贴
  if (e.ctrlKey && e.key === 'v') {
    e.preventDefault();
    pasteFile();
  }

  // Delete: 删除
  if (e.key === 'Delete' && selectedFile.value) {
    e.preventDefault();
    contextMenuFile.value = selectedFile.value;
    deleteFile();
  }

  // F2: 重命名
  if (e.key === 'F2' && selectedFile.value) {
    e.preventDefault();
    contextMenuFile.value = selectedFile.value;
    renameFile();
  }

  // Escape: 关闭菜单/对话框
  if (e.key === 'Escape') {
    if (showContextMenu.value) {
      closeContextMenu();
    } else if (showRenameDialog.value) {
      showRenameDialog.value = false;
    }
  }
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

// 添加指标
const addIndicator = () => {
  terminalOutput.value.push('> 添加指标到图表...');
  // TODO: 实现添加指标逻辑
};

// 回测
const backtest = async () => {
  if (!currentFile.value) {
    terminalOutput.value.push('> 错误: 未选择策略文件');
    return;
  }

  if (currentFile.value.type !== 'strategy') {
    terminalOutput.value.push('> 错误: 只能回测策略文件');
    return;
  }

  // 显示检测状态
  isCheckingAgent.value = true;
  terminalOutput.value.push('> 正在检测 Quant Agent...');

  try {
    // 1. 先检测 Agent 状态
    const status = await quantAgentService.checkAgentStatus();

    if (status === AgentStatus.RUNNING) {
      // Agent 已经运行中，显示提示对话框
      terminalOutput.value.push('> Agent 已运行中');
      showAgentRunningDialog.value = true;
    } else if (status === AgentStatus.STOPPED) {
      // Agent 已安装但未运行，直接唤起
      terminalOutput.value.push('> Agent 未运行，正在唤起...');
      const launched = await quantAgentService.launchAgent();
      
      // 检查 Agent 是否启动成功（可能 launchAgent 返回 false 但 Agent 实际已启动）
      let agentRunning = launched;
      if (!launched) {
        // 唤起后再次检测，可能 Agent 已经启动但检测时机不对
        terminalOutput.value.push('> 等待 Agent 启动完成，再次检测...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 额外等待 2 秒
        
        const finalStatus = await quantAgentService.checkAgentStatus();
        agentRunning = (finalStatus === AgentStatus.RUNNING);
      }
      
      if (agentRunning) {
        // Agent 已经启动成功
        terminalOutput.value.push('> Agent 已成功启动');
        terminalOutput.value.push('> 正在启动回测: ' + currentFile.value.name);
        // TODO: 回测功能
        terminalOutput.value.push('> TODO: 回测功能');
      } else {
        // 确实无法启动，可能未安装
        terminalOutput.value.push('> 错误: 无法启动 Agent，可能未安装');
        showAgentNotInstalledDialog.value = true;
      }
    } else {
      // Agent 未安装
      terminalOutput.value.push('> 错误: Agent 未安装');
      showAgentNotInstalledDialog.value = true;
    }
  } catch (error) {
    terminalOutput.value.push(`> 错误: ${error}`);
  } finally {
    isCheckingAgent.value = false;
  }
};

// 打开 Agent 下载页面
const downloadAgent = () => {
  const downloadUrl = quantAgentService.getDownloadUrl();
  window.open(downloadUrl, '_blank');
  showAgentNotInstalledDialog.value = false;
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
  // Monaco Editor 将在第一次打开文件时创建

  // 添加全局事件监听
  document.addEventListener('click', closeContextMenu);
  document.addEventListener('keydown', handleKeyDown);
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

  // 清理全局事件监听
  document.removeEventListener('click', closeContextMenu);
  document.removeEventListener('keydown', handleKeyDown);

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

.tool-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f0f3fa;
  border-color: #e0e3eb;
  color: #b0b5bd;
}

.tool-btn:disabled:hover {
  transform: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-color: #e0e3eb;
  color: #b0b5bd;
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

/* 欢迎页面 */
.welcome-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  min-height: 0;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #3b4252;
  margin: 0 0 12px 0;
}

.welcome-subtitle {
  font-size: 14px;
  color: #76808f;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.welcome-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.welcome-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ffffff;
  border: 1px solid #e0e3eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #3b4252;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.welcome-btn:hover {
  background: #f8f9fa;
  border-color: #2962ff;
  color: #2962ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(41, 98, 255, 0.15);
}

.welcome-btn:active {
  transform: translateY(0);
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

/* 新建文件对话框样式 */
.required {
  color: #ef5350;
  margin-left: 2px;
}

.input-error {
  border-color: #ef5350 !important;
}

.error-message {
  display: block;
  color: #ef5350;
  font-size: 12px;
  margin-top: 4px;
}

.input-hint {
  display: block;
  color: #76808f;
  font-size: 11px;
  margin-top: 4px;
}

.about-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e3eb;
  border-radius: 6px;
  font-size: 14px;
  color: #3b4252;
  background: #ffffff;
  transition: all 0.2s ease;
  box-sizing: border-box;
  cursor: pointer;
  outline: none;
}

.about-select:focus {
  border-color: #2962ff;
  box-shadow: 0 0 0 3px rgba(41, 98, 255, 0.1);
}

.advanced-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 0;
  cursor: pointer;
  user-select: none;
  color: #3b4252;
  font-size: 13px;
  font-weight: 500;
  margin-top: 8px;
  transition: color 0.2s;
}

.advanced-toggle:hover {
  color: #2962ff;
}

.advanced-toggle .collapse-icon {
  color: #76808f;
  transition: transform 0.2s ease;
}

.advanced-toggle .collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.advanced-options {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e3eb;
}

.dialog-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-btn:disabled:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(41, 98, 255, 0.2);
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: #ffffff;
  border: 1px solid #e0e3eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 180px;
  z-index: 2000;
  animation: fadeInScale 0.15s ease;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #3b4252;
  transition: background 0.15s;
  user-select: none;
}

.context-menu-item:hover {
  background: #f0f3fa;
}

.context-menu-item.disabled {
  color: #b0b5bd;
  cursor: not-allowed;
}

.context-menu-item.disabled:hover {
  background: transparent;
}

.context-menu-item svg {
  flex-shrink: 0;
  color: #76808f;
}

.context-menu-item.danger {
  color: #f44336;
}

.context-menu-item.danger svg {
  color: #f44336;
}

.context-menu-item.danger:hover {
  background: #ffebee;
}

.context-menu-divider {
  height: 1px;
  background: #e0e3eb;
  margin: 4px 0;
}

/* 删除确认对话框 */
.delete-confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.delete-confirm-message {
  margin: 20px 0 8px 0;
  font-size: 15px;
  color: #3b4252;
  line-height: 1.6;
}

.delete-confirm-message strong {
  color: #f44336;
  font-weight: 600;
}

.delete-confirm-warning {
  margin: 0;
  font-size: 13px;
  color: #76808f;
}

.dialog-btn.danger {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

.dialog-btn.danger:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  transform: translateY(-1px);
}

.dialog-btn.danger:active {
  transform: translateY(0);
}

/* Agent 安装提示对话框 */
.agent-install-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.agent-install-title {
  margin: 20px 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #3b4252;
}

.agent-install-message {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #76808f;
  line-height: 1.8;
}

.agent-install-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 300px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  color: #3b4252;
  text-align: left;
}

.feature-item svg {
  flex-shrink: 0;
  color: #26a69a;
}

</style>
