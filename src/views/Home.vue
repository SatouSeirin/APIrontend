<!-- src/views/Home.vue -->
<template>
  <div class="home-page">
    <AppHeader />

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <h1>简单 · 快速 · 安全的 API 服务</h1>
        <p class="subtitle">100+ 高质量数据接口，开箱即用，助力开发者高效构建应用</p>
        <div class="cta-buttons">
          <el-button type="primary" size="large" @click="goToApiList">立即体验</el-button>
          <el-button size="large" @click="scrollToExamples">查看示例</el-button>
        </div>

        <!-- API 调用演示 -->
        <div class="api-demo">
          <pre><code class="language-bash">curl "https://api.tianmi.com/v1/weather?city=北京" \</code></pre>
          <pre><code class="language-bash">  -H "Authorization: Bearer YOUR_API_KEY"</code></pre>
          <div class="response">
            <span class="response-label">响应示例：</span>
            <pre><code class="language-json">{ "city": "北京", "temp": 22, "desc": "晴" }</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心功能 -->
    <section id="features" class="features-section">
      <div class="container">
        <h2 class="section-title">为什么选择甜蜜接口？</h2>
        <div class="features-grid">
          <div class="feature-card">
            <el-icon class="feature-icon">
              <component :is="icons.DataAnalysis" />
            </el-icon>
            <h3>丰富接口</h3>
            <p>覆盖天气、金融、AI、生活、新闻等 100+ 类别，持续更新</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon">
              <component :is="icons.Lock" />
            </el-icon>
            <h3>安全可靠</h3>
            <p>全站 HTTPS、请求限流、IP 白名单、防刷机制，保障服务稳定</p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon">
              <component :is="icons.Lightning" />
            </el-icon>
            <h3>极速响应</h3>
            <p>全球 CDN 加速，平均响应时间 50ms，高并发无压力 </p>
          </div>
          <div class="feature-card">
            <el-icon class="feature-icon">
              <component :is="icons.Document" />
            </el-icon>
            <h3>完善文档</h3>
            <p>提供 OpenAPI 规范、Postman 集合、多语言 SDK 示例</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 调用示例 -->
    <section id="examples" class="examples-section">
      <div class="container">
        <h2 class="section-title">快速开始</h2>
        <div class="example-cards">
          <div class="example-card">
            <h3>JavaScript</h3>
            <pre><code class="language-js">fetch('https://api.tianmi.com/v1/ip')
  .then(res => res.json())
  .then(data => console.log(data));</code></pre>
          </div>
          <div class="example-card">
            <h3>Python</h3>
            <pre><code class="language-python">import requests
res = requests.get('https://api.tianmi.com/v1/ip')
print(res.json())</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <p>© 2025 甜蜜接口API平台. 保留所有权利。</p>
        <p>
          <router-link to="/privacy">隐私政策</router-link> |
          <router-link to="/terms">服务条款</router-link>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/store/index'
import { toast } from '../composables/util'
import { getToken, removeToken } from '../composables/auth' // ← 确保导入 getToken
// === 图标（防止 tree-shaking）===
import { DataAnalysis, Lock, Lightning, Document } from '@element-plus/icons-vue'
import AppHeader from '../components/AppHeader.vue'

// === 状态 ===
const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => !!getToken())
const icons = { DataAnalysis, Lock, Lightning, Document }
const userAvatar = ref('')



// === 路由跳转 ===

const goToApiList = () => {
  if (getToken()) {
    router.push('/apis')
  } else {
    router.push({ name: 'Login' })
  }
}

const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'console':
      router.push('/admin')
      break
    case 'logout':
      removeToken() // ✅ 统一清除 Cookie
      userStore.CLEAR_USERINFO()
      // 不需要手动改 isLoggedIn，computed 会自动更新
      toast('已退出登录', 'success')
      break
  }
}

const scrollToExamples = () => {
  document.querySelector('#examples')?.scrollIntoView({ behavior: 'smooth' })
}

// === 初始化（可选：同步用户信息）===
onMounted(async () => {
  const token = getToken()

  if (token && !userStore.userInfo) {
    await userStore.fetchUserInfo() // 👈 主动加载
        console.log('Store 中的 userInfo:', userStore.userInfo)
  }
})
</script>

<style scoped>
.home-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'HarmonyOS Sans', sans-serif;
  background-color: #ffffff;
  color: #1f2937;
  line-height: 1.6;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}



/* ========== 英雄区域 ========== */
.hero-section {
  padding: 80px 0 60px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6eeff 100%);
  text-align: center;
}

.hero-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #4f6cf9, #8a7cf9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  color: #4b5563;
  max-width: 600px;
  margin: 0 auto 32px;
}

.cta-buttons {
  margin: 32px 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.api-demo {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-top: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: left;
  font-size: 14px;
}

.api-demo pre {
  margin: 0;
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
}

.response {
  margin-top: 16px;
}

.response-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4f6cf9;
}

/* ========== 功能区域 ========== */
.features-section {
  padding: 80px 0;
  background-color: #fff;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 48px;
  color: #1f2937;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  border-radius: 16px;
  background: #f9fafb;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  font-size: 28px;
  color: #4f6cf9;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin: 16px 0 12px;
}

/* ========== 示例区域 ========== */
.examples-section {
  padding: 80px 0 60px;
  background-color: #f9fafb;
}

.example-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.example-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.example-card h3 {
  margin-top: 0;
  color: #4f6cf9;
  font-size: 1.1rem;
}

.example-card pre {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0;
  font-size: 13px;
}

/* ========== 底部 ========== */
.footer {
  background: #0f172a;
  color: #cbd5e1;
  padding: 32px 0;
  text-align: center;
}

.footer p {
  margin: 4px 0;
}

.footer a {
  color: #94a3b8;
  text-decoration: none;
}

.footer a:hover {
  color: #cbd5e1;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .nav-links {
    gap: 12px;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>