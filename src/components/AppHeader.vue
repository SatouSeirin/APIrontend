<!-- src/components/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="container">
      <router-link to="/" class="logo">甜蜜接口API</router-link>
      <nav class="nav-links">
        <a href="/#">首页</a>
        <a href="/#apis">API列表</a>
        <a href="/#rechargeCenter">充值中心</a>
        <a href="/#workbench">工作台</a>
        <template v-if="!isLoggedIn">
          <el-button type="primary" size="small" @click="handleLogin">登录</el-button>
          <el-button size="small" @click="handleRegister">注册</el-button>
        </template>
        <el-dropdown v-else @command="handleUserCommand" placement="bottom-end" class="user-menu">
          <div class="user-trigger">
            <el-avatar :size="28" :src="userAvatar" />
            <span class="username">{{ userStore.userInfo?.username || '用户' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="console">管理后台</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/store/index'
import { getToken, removeToken } from '../composables/auth'
import { toast } from '../composables/util'

const router = useRouter()
const userStore = useUserStore()
const userAvatar = ''

// ✅ 统一登录状态判断（从 Cookie）
const isLoggedIn = computed(() => !!getToken())

// ✅ 统一路由跳转逻辑
const handleLogin = () => router.push({ name: 'Login' })
const handleRegister = () => router.push({ name: 'Register' })

const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'console':
      router.push('/admin')
      break
    case 'logout':
      removeToken()
      userStore.CLEAR_USERINFO()
      toast('已退出登录', 'success')
      router.push('/')
      break
  }
}
</script>

<style scoped>
/* ========== 顶部导航 ========== */
.app-header {
  padding: 16px 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* 兼容 Safari */
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #4f6cf9;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-links a:hover {
  color: #4f6cf9;
}

.user-menu {
  margin-left: 12px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-trigger:hover {
  background-color: #f5f5f5;
}

.username {
  font-size: 14px;
  color: #333;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .nav-links {
    gap: 16px;
  }

  .logo {
    font-size: 18px;
  }

  .app-header {
    padding: 12px 0;
  }
}

@media (max-width: 480px) {
  .nav-links {
    gap: 12px;
  }

  .nav-links a,
  .username {
    font-size: 13px;
  }
}
</style>