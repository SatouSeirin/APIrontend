<!-- src/views/auth/AuthLayout.vue -->
<template>
  <div class="auth-layout">
    <div class="glass-container">
      <div class="brand-header">
        <h1>甜蜜接口API</h1>
        <p>简单 · 快速 · 安全的 API 服务</p>
      </div>

      <!-- 呼吸式渐变切换 -->
      <transition name="fade" mode="out-in">
        <component 
          :is="currentComponent" 
          @toggle="toggleMode"
          :key="isLogin ? 'login' : 'register'"
        />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Login from './Login.vue'
import Register from './Register.vue'

const isLogin = ref(true)
const currentComponent = computed(() => isLogin.value ? Login : Register)

const toggleMode = () => {
  isLogin.value = !isLogin.value
}
</script>

<style scoped>
/* ========== 与首页统一的背景 ========== */
.auth-layout {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  /* 使用与首页英雄区一致的渐变 */
  background: linear-gradient(135deg, #f0f5ff 0%, #e6eeff 100%);
}

/* ========== 玻璃拟态卡片 ========== */
.glass-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.8); /* 更白，更清新 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 40px 30px;
  border: 1px solid rgba(230, 230, 230, 0.6);
}

.brand-header {
  text-align: center;
  margin-bottom: 32px;
}

.brand-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.brand-header p {
  color: #6b7280;
  font-size: 14px;
}

/* ========== 渐变动画 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>