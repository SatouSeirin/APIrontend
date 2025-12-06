// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

// Views (对外页面)
import Home from '../views/Home.vue'
import ApiList from '../views/ApiList.vue'

// Pages (后台页面)
import Index from '../pages/index.vue'
import NotFound from '../pages/404.vue'
import Admin from '../layouts/Admin.vue'
import AuthLayout from '../pages/auth/AuthLayout.vue'
import User from '../pages/User.vue'
import Profile from '../views/Profile.vue'
import Settings from '../pages/Settings.vue'
import Workbench from '../views/Workbench.vue'
import RechargeCenter from '../views/RechargeCenter.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    // 🌐 公开首页
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { title: '甜蜜接口API平台' }
    },

    // 🔍 API 列表（需登录，但由守卫控制，不设 meta.requiresAuth）
    {
      path: '/apis',
      name: 'ApiList',
      component: ApiList,
      meta: { title: 'API 接口大全' }
    },
    {
          path: '/profile',
          name: 'Profile',
          component: Profile,
          meta: { title: '个人中心' }
      },
        {
          path: '/workbench',
          name: 'Workbench',
          component: Workbench,
          meta: { title: '工作台' }
      },
        {
          path: '/rechargeCenter',
          name: 'RechargeCenter',
          component: RechargeCenter,
          meta: { title: '工作台' }
      },

    // 🔐 认证页面
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('../pages/auth/Login.vue'),
          meta: { title: '登录' }
        },
        {
          path: 'register',
          name: 'Register',
          component: () => import('../pages/auth/Register.vue'),
          meta: { title: '注册' }
        }
      ]
    },

    // 🖥️ 后台管理（需登录）
    {
      path: '/admin',
      component: Admin,
      meta: { requiresAuth: true }, // 可选，守卫已统一处理
      children: [
        {
          path: '',
          name: 'AdminDashboard',
          component: Index,
          meta: { title: '后台首页' }
        },
        {
          path: 'user',
          name: 'User',
          component: User,
          meta: { title: '用户信息' }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: Settings,
          meta: { title: '系统设置' }
        }
      ]
    },

    // 🚫 404
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      meta: { title: '404 - 页面未找到' }
    }
  ]
})

// 防重复导航
const originalPush = router.push
router.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') throw err
  })
}

export default router