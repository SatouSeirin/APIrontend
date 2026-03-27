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
import Agreement from '../views/Agreement.vue' 
import DeveloperConsole from '../views/DeveloperConsole.vue' 
import AdminPanel from '../views/AdminPanel.vue'

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
    // ... 其他路由 ...

    // 🔍 API 列表
    {
      path: '/apis',
      name: 'ApiList',
      component: ApiList,
      meta: { title: 'API 接口大全' }
    },
    // 个人中心相关
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
      meta: { title: '充值中心' } // 修正标题
    },

    // 新增：用户协议页面
    {
      path: '/agreement',
      name: 'Agreement',
      component: Agreement,
      meta: { title: '用户协议' } // 需要登录才能访问协议页
    },
    // 新增：开发者后台页面
    {
      path: '/developer-console',
      name: 'DeveloperConsole',
      component: DeveloperConsole,
      meta: { title: '开发者后台', requiresAuth: true, requiresRole: 'developer' } // 需要开发者权限
    },
       // 新增管理员路由
    {
      path: '/admin-panel',
      name: 'AdminPanel',
      component: AdminPanel,
      meta: { title: '管理员面板', requiresAuth: true, requiresRole: 'admin' }
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
      meta: { requiresAuth: true, requiresRole: 'admin' }, // 假设管理员后台需要 admin 角色
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
          meta: { title: '用户信息', requiresRole: 'admin' }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: Settings,
          meta: { title: '系统设置', requiresRole: 'admin' }
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