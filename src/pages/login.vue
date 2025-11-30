<template>
  <div class="fullscreen-login-container">
    <!-- 左侧品牌展示区 - 70% -->
    <div class="brand-section">
      <div class="brand-content">
        <h1 class="brand-title">欢迎光临</h1>
        <p class="brand-subtitle">此站点是《Vue3 + Vite实战商城后台开发》视频课程的演示地址</p>
      </div>
    </div>

    <!-- 右侧登录表单区 - 30% -->
    <div class="login-section">
      <div class="login-form-container">
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-subtitle">账号密码登录</p>
        
        <el-form 
          :model="loginForm" 
          :rules="loginRules" 
          ref="loginFormRef"
          class="login-form" 
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              clearable
              maxlength="13"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
              maxlength="27"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              class="login-btn" 
              native-type="submit"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted,onBeforeUnmount } from 'vue'
import { toast } from '../composables/util'
import { User, Lock, DocumentRemove } from '@element-plus/icons-vue'
import { login } from '../api/auth'
import { userinfo } from '../api/user'
import { useRouter } from 'vue-router'
import { setToken } from '../composables/auth'
import { useUserStore } from '../store/index'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

// 根据图片要求调整验证规则
const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { 
      min: 6, 
      max: 13, 
      message: '用户名长度应在6-13位之间', 
      trigger: 'blur' 
    },
    { 
      pattern: /^[a-zA-Z0-9]+$/,
      message: '用户名只能包含字母和数字',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { 
      min: 6, 
      max: 27,
      message: '密码长度应在6-27位之间', 
      trigger: 'blur' 
    }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value || loading.value) return
  
  try {
    // 表单验证
    await loginFormRef.value.validate()
    loading.value = true
    
    // 登录请求
    const res = await login(loginForm.username, loginForm.password)
    
    // 登录成功
    toast(res.message || '登录成功！')
    
    // 修复：正确存储token
      setToken(res.data) // 假设setToken是您封装的token设置函数

    // 页面跳转
    await router.push('/')
    
  }  finally {
    loading.value = false
  }
}

//监听回车事件
function onKeyUp(e){
  if (e.key === "Enter") handleLogin()

}

// 添加键盘监听
onMounted(() => {
  document.addEventListener("keyup", onKeyUp) // 移除了多余的逗号
})

// 移除键盘监听
onBeforeUnmount(() => {
  document.removeEventListener("keyup", onKeyUp) // 补充了遗漏的回调函数参数
})

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.fullscreen-login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 左侧品牌区域 - 70%宽度 */
.brand-section {
  flex: 7;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-content {
  text-align: center;
  max-width: 500px;
  padding: 0 40px;
}

.brand-title {
  font-size: 2.8rem;
  font-weight: 600;
  margin-bottom: 24px;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
}

/* 右侧登录区域 - 30%宽度 */
.login-section {
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
}

.login-form-container {
  width: 100%;
  max-width: 320px;
  padding: 0 30px;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 8px;
  text-align: left;
}

.login-subtitle {
  color: #666;
  margin-bottom: 40px;
  text-align: left;
  font-size: 0.95rem;
}

.login-form {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__error) {
  font-size: 12px;
  padding-top: 4px;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  height: 44px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #1890ff;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  border-color: #1890ff;
}

:deep(.el-input__wrapper.is-error) {
  border-color: #f56c6c;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
}

.login-btn {
  width: 100%;
  height: 44px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  margin-top: 10px;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fullscreen-login-container {
    flex-direction: column;
  }
  
  .brand-section {
    flex: none;
    height: 40vh;
    min-height: 250px;
  }
  
  .brand-title {
    font-size: 2.2rem;
  }
  
  .brand-content {
    padding: 0 20px;
    max-width: 100%;
  }
  
  .login-section {
    flex: 1;
    min-height: 60vh;
  }
  
  .login-form-container {
    max-width: 100%;
    padding: 0 20px;
  }
}

@media (min-width: 1600px) {
  .brand-content {
    max-width: 600px;
  }
  
  .login-form-container {
    max-width: 380px;
  }
}
</style>