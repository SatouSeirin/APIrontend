<!-- src/views/auth/Login.vue -->
<template>
  <div class="auth-form">
    <h2 class="form-title">欢迎回来</h2>
    <p class="form-subtitle">登录继续使用</p>

    <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          placeholder="用户名"
          size="large"
          :prefix-icon="User"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码"
          size="large"
          :prefix-icon="Lock"
          show-password
        />
      </el-form-item>

      <el-button 
        type="primary" 
        class="submit-btn" 
        native-type="submit"
        :loading="loading"
      >
        登录
      </el-button>

      <div class="switch-link">
        没有账号？
        <a @click="$emit('toggle')">立即注册</a>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '../../api/auth'
import { toast } from '../../composables/util'
import { setToken } from '../../composables/auth'
import { useRouter } from 'vue-router'

const emit = defineEmits(['toggle'])
const router = useRouter()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 6, max: 13, message: '6-13位字母数字', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]+$/, message: '仅字母数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '至少6位', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value || loading.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const res = await login(form.username, form.password)
    toast(res.message || '登录成功！')
    
    setToken(res.data)
    // 获取用户信息（确保首页显示用户名）
    const { useUserStore } = await import('../../store/index')
    const userStore = useUserStore()
    await userStore.fetchUserInfo()
    
    router.push('/')
    
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  color: #1f2937;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
}

.form-subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 24px;
}

/* ========== 输入框样式（与首页一致） ========== */
:deep(.el-input__wrapper) {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  height: 48px;
}

:deep(.el-input__inner) {
  color: #1f2937;
}

:deep(.el-input__prefix) {
  color: #9ca3af;
}

.submit-btn {
  width: 100%;
  height: 48px;
  margin-top: 16px;
  background: #4f6cf9;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #435ce0;
}

.switch-link {
  text-align: center;
  margin-top: 20px;
  color: #6b7280;
}

.switch-link a {
  color: #4f6cf9;
  font-weight: 600;
  margin-left: 4px;
  cursor: pointer;
  text-decoration: none;
}

.switch-link a:hover {
  text-decoration: underline;
}
</style>