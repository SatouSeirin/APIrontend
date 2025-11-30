import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '../pages/index.vue'
import Login from '../pages/login.vue'
import NotFound from '../pages/404.vue'
import Dashboard from '../pages/dashboard.vue'


const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    { path: '/:pathMatch(.*)*', 
      name: 'NotFound', 
      component: NotFound,
    },
    { 
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    }
  ],
})

// 重写 push 方法
const originalPush = router.push
router.push = function push (location) {
  // 调用原始的 push 方法，并捕获错误，忽略导航重复错误
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      // 可以重新抛出非“导航重复”的错误
      throw err
    }
    // 对于导航重复错误，静默处理
  })
}

export default router
