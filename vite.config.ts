import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), checker({
      typescript: true
    })],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "bootstrap/scss/bootstrap";`
      }
    }
  },
  optimizeDeps: {
    include: ['@babel/generator']
  }
});
