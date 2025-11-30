// store/index.js
import { defineStore } from 'pinia'
import { userinfo } from '../api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null
  }),
  
  actions: {
    // 记录用户信息
    SET_USERINFO(user) {
      this.userInfo = user
    },
    CLEAR_USERINFO(user) {
      this.userInfo = null
    },
    // 补充：异步获取当前登录用户信息的Action
    async fetchUserInfo() {
      try {
        const res = await userinfo() // 调用API
        if (res && res.data) {
          this.SET_USERINFO(res.data) // 调用已有的SET_USERINFO
          return Promise.resolve(res.data) // 返回数据，便于后续使用
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return Promise.reject(error)
      }
    }
  }
})