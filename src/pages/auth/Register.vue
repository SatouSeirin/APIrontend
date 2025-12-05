<!-- src/views/auth/Register.vue -->
<template>
  <div class="auth-form">
    <h2 class="form-title">创建账号</h2>
    <p class="form-subtitle">加入我们，开始使用</p>

    <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          placeholder="用户名（6-13位字母数字）"
          size="large"
          :prefix-icon="User"
        />
      </el-form-item>

      <el-form-item prop="email">
        <el-input
          v-model="form.email"
          placeholder="邮箱"
          size="large"
          :prefix-icon="Message"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码（至少6位）"
          size="large"
          :prefix-icon="Lock"
          show-password
        />
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="确认密码"
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
        注册
      </el-button>

      <div class="switch-link">
        已有账号？
        <a @click="$emit('toggle')">立即登录</a>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { register } from '../../api/auth'
import { toast } from '../../composables/util'

const emit = defineEmits(['toggle'])

const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) callback(new Error('请确认密码'))
  else if (value !== form.password) callback(new Error('密码不一致'))
  else callback()
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 6, max: 13, message: '6-13位字母数字', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]+$/, message: '仅字母数字', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式错误', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value || loading.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const res = await register(form.username, form.email, form.password)
    toast(res.message || '注册成功！')
    
    // 注册成功后自动切换到登录
    emit('toggle')
    
  } finally {
    loading.value = false
  }
}
</script>

<!-- 样式与 Login.vue 完全一致 -->
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