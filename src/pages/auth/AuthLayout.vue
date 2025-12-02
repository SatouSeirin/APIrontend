<!-- src/views/auth/AuthLayout.vue -->
<template>
  <div class="auth-layout">
    <div class="glass-container">
      <div class="brand-header">
        <h1>ApiPlat</h1>
        <p>API 对接与管理平台</p>
      </div>
      
      <transition name="fade" mode="out-in">
        <component 
          :is="currentComponent" 
          @toggle="toggleMode" 
          :is-login="isLogin"
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
.auth-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.glass-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 40px 30px;
  color: white;
}

.brand-header {
  text-align: center;
  margin-bottom: 32px;
}

.brand-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.brand-header p {
  opacity: 0.9;
  font-size: 1.05rem;
}

/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>