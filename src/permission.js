import { getToken } from "./composables/auth"
import { toast } from "./composables/util"
import router from "./router/index"

//全局前置守卫

router.beforeEach(async (to, from, next) => {

const token = getToken()

if(!token && to.path != "/login"){
    toast("请先登录","error")
    return next({path:"/login"})
}

//防止重复登录  
if(token && to.path == "/login"){
    toast("请勿重复登录","error")
    return next({ path:from.path ? from.path : "/" })
}

//如果用户 登录了，自动获取用户信息，并存储在pinia当中

  // 正确的：在守卫回调内部使用 Store
  if (token) {
    // 在这里导入和使用 Store
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
        // 处理 token 过期等情况
        // removeToken()
        // return next({path: "/login"})
      }
    }
  }



  next()
})