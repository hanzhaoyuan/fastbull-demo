import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { default as monacoEditorPlugin } from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    vue(),
    monacoEditorPlugin.default({})
  ],
  server: {
    port: 3000,
    open: true
  }
})
