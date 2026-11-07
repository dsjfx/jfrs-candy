import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import errorHandler from './monitor/errorHandler.ts'
// 引入 FontAwesome 插件
import fontawesome from './plugins/fontawesome'
import { zhCn } from 'element-plus/es/locales.mjs';
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
errorHandler.init(app)

// 使用插件
app.use(fontawesome)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, {
  locale: zhCn,
});

// 使用插件
app.use(pinia)
app.use(router)


app.mount('#app')