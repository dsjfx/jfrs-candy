import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import errorHandler from './api/errorHandler'
// 引入 FontAwesome 插件
import fontawesome from './plugins/fontawesome'
import '@/styles/index.scss'

// 全局样式和图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 按需引入UI组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/element-theme.scss'

const app = createApp(App)
const pinia = createPinia()

// 初始化错误处理（必须在其他插件之前）
errorHandler.init()

// 使用插件
app.use(fontawesome)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue错误:', err)
  console.log('组件:', vm?.$options.name)
  console.log('信息:', info)

  // 生产环境上报
  // if (import.meta.env.PROD) {
  //   // 简单的上报
  //   fetch('/api/logs/error', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       message: err.message,
  //       stack: err.stack,
  //       component: vm?.$options.name,
  //       info
  //     })
  //   }).catch(() => {})
  // }
  // 这里可以添加错误上报逻辑
}

app.mount('#app')