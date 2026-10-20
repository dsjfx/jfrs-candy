import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// more detail please visit https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use '@/styles/variables.scss' as *;
          @use '@/styles/mixins.scss' as *;
        `
      }
    }
  },
  server: {
    host: true,
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:6060',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // '/api/jdmk': {
      //   target: 'http://note.dswireman.cn/',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api\/jdmk/, '/api/jfx'),
      // },
    }
  },
  build: {
    // Production construction optimization
    target: 'es2015', // Use ES2015+ for better Tree-shaking
    minify: 'esbuild', // Further remove dead code during compression
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: {
          // Code splitting, in conjunction with Tree-shaking
          'vendor': ['vue', 'vue-router']
        }
      }
    }
  }
})