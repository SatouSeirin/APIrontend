import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import 'virtual:windi.css'

// 创建 Pinia 实例
const pinia = createPinia()
const app = createApp(App)

// 正确的插件注册顺序
app.use(pinia)        // 1. 先注册 Pinia
app.use(router)       // 2. 再注册路由
app.use(ElementPlus)  // 3. 最后注册 UI 组件库


import "./permission"

// 只挂载一次！
app.mount('#app')