import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '../pages/index.vue'
import NotFound from '../pages/404.vue'
import Dashboard from '../pages/dashboard.vue'
import Admin from '../layouts/admin.vue'
import AuthLayout from '../pages/auth/AuthLayout.vue'
import User from '../pages/User.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Admin,
      //子路由
      children:[{
        path:'',
        component:Index,
        name: 'Index',
        meta:{
          title:"后台首页"
        }
      },
      {
        path:'user',
        component:User,
        name: 'User',
        meta:{
          title:"个人信息"
        }
      },
    ]
    },
    {
      path: '/login',
      name: 'login',
      component: AuthLayout,
            meta:{
        title:"登录"
      }
    },
    {
      path: '/register',
    redirect: '/login'
    },
    { 
      path: '/:pathMatch(.*)*', 
      name: 'NotFound', 
      component: NotFound,
            meta:{
        title:"404啦"
      }
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
