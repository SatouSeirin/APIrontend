// src/permission.js
import { getToken } from "./composables/auth"
import { toast, showFullLoading, hideFullLoading } from "./composables/util"
import router from "./router/index"

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  showFullLoading()

  // ✅ 定义无需登录的页面白名单
  const whiteList = ['/auth/login', '/auth/register', '/']

  const token = getToken()

  // ✅ 如果在白名单中，直接放行
  if (whiteList.includes(to.path)) {
    next()
    return
  }

  // --- 检查是否需要登录 ---
  const requiresAuth = to.meta.requiresAuth
  
  if (requiresAuth && !token) {
    toast("请先登录", "error")
    return next({ path: "/auth/login" })
  }

  if (!requiresAuth && !token) {
     next()
     return
  }

  // 防止重复登录
  if (token && to.path === "/auth/login") {
    toast("请勿重复登录", "error")
    return next({ path: from.path || "/" })
  }

  // 自动获取用户信息（已有 token 且不在白名单）
  if (token) {
    const { useUserStore } = await import('./store/index')
    const userStore = useUserStore()

    if (!userStore.userInfo) {
      try {
        const { userinfo } = await import('./api/user')
        const res = await userinfo()
        if (res && res.data) {
          userStore.SET_USERINFO(res.data)
          console.log('用户信息自动获取并存储成功')
        }
      } catch (error) {
        console.error('自动获取用户信息失败:', error)
        toast('用户信息失效，请重新登录', 'error')
        return next({ path: "/auth/login" })
      }
    }

    // --- 🔥 修改：角色权限检查逻辑 ---
    const requiredRole = to.meta.requiresRole
    
    if (requiredRole && userStore.userInfo) {
      const userRole = Number(userStore.userInfo.role)
      let hasRequiredRole = false

      if (requiredRole === 'developer') {
        // ✅ 开发者权限：角色 1 或 2 可直接访问
        if (userRole === 1 || userRole === 2) {
          hasRequiredRole = true
        }
        // 🔄 角色 0 尝试访问开发者后台 → 重定向到协议页
        else if (userRole === 0) {
          toast('请先同意开发者协议', 'warning')
          return next({ name: 'Agreement', query: { redirect: to.fullPath } })
        }
      } 
      else if (requiredRole === 'admin') {
        // ✅ 管理员权限：仅角色 2 可访问
        hasRequiredRole = userRole === 2
      }

      if (!hasRequiredRole) {
        toast('权限不足，无法访问此页面', 'error')
        // 根据当前角色跳转到合适的页面
        if (userRole === 1) {
          return next({ name: 'DeveloperConsole' })
        } else if (userRole === 2) {
          return next({ name: 'AdminPanel' })
        } else {
          return next({ name: 'Home' })
        }
      }
    }
    // --- 权限检查结束 ---
  }

  // 设置页面标题
  let title = (to.meta.title || "") + "-Api对接平台"
  document.title = title

  next()
})

router.afterEach((to, from) => hideFullLoading())