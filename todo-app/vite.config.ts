import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/react-todo-app/', // ⚠️ Thay 'todo-list' bằng tên repo của bạn
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})