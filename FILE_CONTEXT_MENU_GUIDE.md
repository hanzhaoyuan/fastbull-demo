# 文件右键菜单实现方案

## 功能说明

在 QuantitativeEditor.vue 中为库、指标、策略文件添加右键菜单，支持以下操作：

1. **重命名** - 修改文件名
2. **复制** - 复制文件
3. **删除** - 删除文件
4. **导出** - 导出为 .py 文件
5. **查看信息** - 显示文件详细信息（已有的关于对话框）

## 实现步骤

### 步骤 1: 在 `<template>` 中添加右键菜单组件

在 `QuantitativeEditor.vue` 文件末尾（弹窗之前）添加右键菜单：

```vue
<!-- 文件右键菜单 -->
<div
  v-if="showContextMenu"
  class="context-menu"
  :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
  @click.stop
>
  <div class="context-menu-item" @click="renameFile">
    <svg viewBox="0 0 16 16" width="14" height="14">
      <path fill="currentColor" d="M12.854 1.146a.5.5 0 0 0-.708 0L10.5 2.793 13.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-2-2zM10 3.5L1.5 12v2.5H4l8.5-8.5L10 3.5z"/>
    </svg>
    重命名
  </div>
  <div class="context-menu-item" @click="duplicateFile">
    <svg viewBox="0 0 16 16" width="14" height="14">
      <path fill="currentColor" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z"/>
    </svg>
    复制
  </div>
  <div class="context-menu-item" @click="exportFile">
    <svg viewBox="0 0 16 16" width="14" height="14">
      <path fill="currentColor" d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h4a1.5 1.5 0 0 1 1.5 1.5v1H10v-1zM2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm6.854 7.146l2 2a.5.5 0 0 1-.708.708L8.5 9.707V13.5a.5.5 0 0 1-1 0V9.707l-1.646 1.647a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0z"/>
    </svg>
    导出
  </div>
  <div class="context-menu-divider"></div>
  <div class="context-menu-item" @click="showFileInfo">
    <svg viewBox="0 0 16 16" width="14" height="14">
      <path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM7 11V7h2v4H7zm0-6V4h2v1H7z"/>
    </svg>
    查看信息
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
```

### 步骤 2: 在 `<script setup>` 中添加响应式状态

在 `const showAdvancedOptions = ref(false);` 下方添加：

```typescript
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
```

### 步骤 3: 添加右键菜单相关函数

在 `const stopPanelResize = () => { ... }` 函数后添加：

```typescript
// 显示文件菜单
const showFileMenu = (file: CodeFile, event?: MouseEvent) => {
  contextMenuFile.value = file;

  if (event) {
    // 右键点击
    contextMenuX.value = event.clientX;
    contextMenuY.value = event.clientY;
  } else {
    // "..." 按钮点击，计算按钮位置
    const target = event?.target as HTMLElement;
    if (target) {
      const rect = target.getBoundingClientRect();
      contextMenuX.value = rect.left;
      contextMenuY.value = rect.bottom + 5;
    }
  }

  showContextMenu.value = true;
};

// 关闭右键菜单
const closeContextMenu = () => {
  showContextMenu.value = false;
  contextMenuFile.value = null;
};

// 重命名文件
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

  const newFileName = renameFileName.value + '.py';
  contextMenuFile.value.name = newFileName;
  contextMenuFile.value.lastModified = new Date().toLocaleString('zh-CN');

  terminalOutput.value.push(`> 文件已重命名: ${newFileName}`);
  showRenameDialog.value = false;
};

// 复制文件
const duplicateFile = () => {
  if (!contextMenuFile.value) return;

  const originalName = contextMenuFile.value.name.replace(/\.py$/, '');
  let copyNumber = 1;
  let newName = `${originalName}_copy${copyNumber}.py`;

  const files = contextMenuFile.value.type === 'indicator'
    ? indicatorFiles.value
    : contextMenuFile.value.type === 'strategy'
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
    type: contextMenuFile.value.type,
    content: contextMenuFile.value.content,
    lastModified: new Date().toLocaleString('zh-CN'),
    description: contextMenuFile.value.description,
    author: contextMenuFile.value.author,
    version: contextMenuFile.value.version,
  };

  if (newFile.type === 'indicator') {
    indicatorFiles.value.push(newFile);
  } else if (newFile.type === 'strategy') {
    strategyFiles.value.push(newFile);
  } else {
    libraryFiles.value.push(newFile);
  }

  terminalOutput.value.push(`> 文件已复制: ${newName}`);
  closeContextMenu();
};

// 导出文件
const exportFile = () => {
  if (!contextMenuFile.value) return;

  const blob = new Blob([contextMenuFile.value.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = contextMenuFile.value.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  terminalOutput.value.push(`> 文件已导出: ${contextMenuFile.value.name}`);
  closeContextMenu();
};

// 查看文件信息
const showFileInfo = () => {
  if (!contextMenuFile.value) return;

  currentFile.value = contextMenuFile.value;
  showAboutDialog.value = true;
  closeContextMenu();
};

// 删除文件
const deleteFile = () => {
  if (!contextMenuFile.value) return;

  const fileName = contextMenuFile.value.name;
  const confirmed = confirm(`确定要删除文件 "${fileName}" 吗？\n\n此操作无法撤销。`);

  if (!confirmed) {
    closeContextMenu();
    return;
  }

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

  terminalOutput.value.push(`> 文件已删除: ${fileName}`);
  closeContextMenu();
};

// 全局点击关闭右键菜单
onMounted(() => {
  document.addEventListener('click', closeContextMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu);
  // ... 其他清理代码
});
```

### 步骤 4: 修改文件列表项，支持右键点击

在文件列表的 `<div>` 标签中添加 `@contextmenu` 事件：

```vue
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
```

**注意**: 对 `strategyFiles` 和 `libraryFiles` 的列表项也要添加相同的修改。

### 步骤 5: 添加右键菜单样式

在 `<style scoped>` 中添加：

```css
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
```

## 使用说明

### 触发右键菜单的方式

1. **右键点击文件** - 在文件名上右键点击
2. **点击"..."按钮** - 点击文件右侧的三个点按钮

### 菜单功能

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 重命名 | - | 修改文件名，自动验证重名 |
| 复制 | - | 创建文件副本，自动添加 `_copy` 后缀 |
| 导出 | - | 导出为 .py 文件下载到本地 |
| 查看信息 | - | 显示文件详细信息（关于对话框）|
| 删除 | - | 删除文件，需要确认 |

## 完整修改清单

需要修改的文件：`src/components/QuantitativeEditor.vue`

1. 在 `<template>` 中：
   - 添加右键菜单组件
   - 添加重命名对话框
   - 修改文件列表项，添加 `@contextmenu` 事件

2. 在 `<script setup>` 中：
   - 添加响应式状态变量
   - 添加所有菜单功能函数
   - 在 `onMounted` 和 `onUnmounted` 中处理全局点击事件

3. 在 `<style scoped>` 中：
   - 添加右键菜单样式

## 测试清单

- [ ] 右键点击文件能显示菜单
- [ ] 点击"..."按钮能显示菜单
- [ ] 重命名功能正常，验证重名
- [ ] 复制功能正常，自动生成不重复的名字
- [ ] 导出功能正常，能下载 .py 文件
- [ ] 查看信息功能正常
- [ ] 删除功能正常，需要确认
- [ ] 点击菜单外部能关闭菜单
- [ ] 删除当前打开的文件能正确关闭编辑器

## 注意事项

1. **文件名验证**: 重命名时会验证文件名是否合法，不允许重名
2. **确认删除**: 删除文件前会弹出确认对话框
3. **自动关闭**: 点击菜单外部或执行操作后会自动关闭菜单
4. **当前文件**: 删除当前打开的文件会自动关闭编辑器
