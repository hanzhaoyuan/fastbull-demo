/**
 * 完整的文件右键菜单实现代码
 *
 * 包含功能：
 * a. 打开 - 点击文件即可
 * b. 重命名 - 右键菜单 或 F2
 * c. 复制/粘贴 - 右键菜单 或 Ctrl+C / Ctrl+V
 * d. 下载到本地 - 右键菜单
 * e. 删除 - 右键菜单 或 Delete 键
 */

// ============================================
// 第一部分: 在 <script setup> 中添加状态变量
// ============================================
// 在 const fileNameError = ref(''); 下方添加：

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


// ============================================
// 第二部分: 添加功能函数
// ============================================
// 在 const stopPanelResize = () => { ... } 后添加：

// 显示文件右键菜单
const showFileMenu = (file: CodeFile, event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();

  contextMenuFile.value = file;
  selectedFile.value = file; // 同时设置选中文件

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

  const fileName = contextMenuFile.value.name;
  const confirmed = confirm(
    `确定要删除文件 "${fileName}" 吗？\n\n此操作无法撤销。`
  );

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

  // 清空剪贴板（如果删除的是剪贴板中的文件）
  if (clipboard.value?.id === fileId) {
    clipboard.value = null;
  }

  terminalOutput.value.push(`> 文件已删除: ${fileName}`);
  closeContextMenu();
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

// 选中文件（点击时）
const selectFile = (file: CodeFile) => {
  selectedFile.value = file;
};


// ============================================
// 第三部分: 修改 onMounted 和 onUnmounted
// ============================================
// 在现有的 onMounted(() => { ... }) 中添加：

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


// ============================================
// 第四部分: 修改 openFile 函数，添加选中逻辑
// ============================================
// 在现有的 openFile 函数开头添加一行：

const openFile = async (file: CodeFile) => {
  selectedFile.value = file; // 添加这一行
  currentFile.value = file;

  // ... 其余代码保持不变
};
