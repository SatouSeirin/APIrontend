import { getToken } from "./composables/auth"
import { toast , showFullLoading, hideFullLoading} from "./composables/util"
import router from "./router/index"

//全局前置守卫

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  showFullLoading()

  // ✅ 定义无需登录的页面白名单
  const whiteList = ['/login', '/register'] // ← 添加 /register

  const token = getToken()

  // ✅ 如果在白名单中，直接放行
  if (whiteList.includes(to.path)) {
    next()
    return
  }

  // 如果没有 token 且不在白名单 → 跳转登录
  if (!token) {
    toast("请先登录", "error")
    return next({ path: "/login" })
  }

  // 防止重复登录
  if (token && to.path === "/login") {
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
        // 可选：清除无效 token
        // removeToken()
        // return next({ path: "/login" })
      }
    }
  }

  // 设置页面标题
  let title = (to.meta.title || "") + "-Api对接平台"
  document.title = title

  next()
})
  //全局后置守卫
router.afterEach((to, from)=> hideFullLoading())