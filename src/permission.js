// src/permission.js
import { getToken } from "./composables/auth"
import { toast , showFullLoading, hideFullLoading} from "./composables/util"
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

  // --- 新增：检查是否需要登录 ---
  const requiresAuth = to.meta.requiresAuth;
  
  // 如果需要登录，但没有 token
  if (requiresAuth && !token) {
    toast("请先登录", "error")
    return next({ path: "/auth/login" })
  }

  // 如果不需要登录且没有 token，也允许访问（例如首页）
  if (!requiresAuth && !token) {
     next();
     return;
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
        // 获取失败后，可以选择跳转到登录页或清空无效token
        // 这里暂时不清空，避免无限循环，但可以给出提示
        toast('用户信息失效，请重新登录', 'error');
        return next({ path: "/auth/login" });
      }
    }

    // --- 修改：角色权限检查 (管理员可以访问开发者页面) ---
    const requiredRole = to.meta.requiresRole;
    console.log("--- 权限检查 Debug Info ---");
    console.log("目标路由需要的角色:", requiredRole);
    console.log("当前用户信息:", userStore.userInfo);
    if(userStore.userInfo) {
      console.log("当前用户角色 (原始):", userStore.userInfo.role);
      console.log("当前用户角色 (转换为数字):", Number(userStore.userInfo.role));
      console.log("用户角色类型:", typeof userStore.userInfo.role);
    }
    console.log("目标路由信息:", to);
    console.log("--------------------------");

    if (requiredRole && userStore.userInfo) {
      let hasRequiredRole = false;
      const userRole = Number(userStore.userInfo.role);

      if (requiredRole === 'developer') {
        hasRequiredRole = userRole === 1 || userRole === 2;
      } else if (requiredRole === 'admin') {
        hasRequiredRole = userRole === 2;
      }

      console.log("最终权限判断结果:", hasRequiredRole);

      if (!hasRequiredRole) {
        toast('权限不足，无法访问此页面', 'error');
        if (userRole === 1) {
          next({ name: 'DeveloperConsole' })
        } else if (userRole === 2) {
          next({ name: 'AdminPanel' })
        } else {
          next({ name: 'Home' })
        }
        return;
      }
    }
    // --- 修改：角色权限检查 结束 ---
  }

  let title = (to.meta.title || "") + "-Api对接平台"
  document.title = title

  next()
})

router.afterEach((to, from) => hideFullLoading())