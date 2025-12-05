<!-- src/views/Profile.vue -->
<template>
  <div class="profile-page">
    <!-- 顶部导航（使用公共组件） -->
    <AppHeader />

    <!-- 主内容区 -->
    <div class="container">
      <!-- 数据卡片行（4个） -->
      <div class="card-row">
        <div
          v-for="(item, index) in stats"
          :key="index"
          class="stat-card"
        >
          <div class="card-icon">
            <el-icon :size="24">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">{{ item.label }}</div>
            <div class="card-value">{{ item.value }}</div>
          </div>
        </div>
      </div>

      <!-- API 密钥卡片 -->
      <div class="api-key-card">
        <div class="card-title">API 密钥</div>
        <div class="key-content">
          <el-icon :size="20" class="key-icon"><Key /></el-icon>
          <span class="key-text">{{ userStore.userInfo.apiKey || '—' }}</span>
        </div>
      </div>

      <!-- API 调用日志 -->
      <div class="logs-section">
        <div class="card-title">API 调用日志</div>

        <!-- 加载中 -->
        <div v-if="loading" class="log-placeholder">
          <el-icon :size="20"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 无日志 -->
        <div v-else-if="logs.length === 0" class="log-placeholder">
          <el-icon :size="20"><Bell /></el-icon>
          <span>暂无调用记录</span>
        </div>

        <!-- 日志列表 -->
        <div v-else class="logs-list">
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-item"
          >
            <div class="log-method" :class="`method-${log.requestMethod}`">
              {{ log.requestMethod }}
            </div>
            <div class="log-details">
              <div class="log-url">{{ log.requestUrl }}</div>
              <div class="log-meta">
                <span>状态: <b>{{ log.responseStatus }}</b></span>
                <span>耗时: {{ log.latency }}ms</span>
                <span>IP: {{ log.ipAddress }}</span>
                <span>{{ formatDate(log.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-if="total > pageSize"
          class="log-pagination"
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="fetchLogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Key, Bell, Loading, Coin, Document } from '@element-plus/icons-vue'
import { useUserStore } from '~/store/index'
import { getApiLogs } from '~/api/apis'
import AppHeader from '../components/AppHeader.vue'

const userStore = useUserStore()

// === 日志状态 ===
const logs = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchLogs = async (page) => {
  loading.value = true
  try {
    const res = await getApiLogs({
      page: page - 1,
      size: pageSize.value
    })
    logs.value = res.data.logs || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('加载日志失败:', error)
    logs.value = []
  } finally {
    loading.value = false
  }
}

// === 工具函数 ===
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// === 统计卡片 ===
const stats = computed(() => [
  {
    label: '剩余调用额度',
    value: userStore.userInfo?.totalQuota ?? '—',
    icon: Coin
  },
  {
    label: '总调用次数',
    value: userStore.userInfo?.usedQuota ?? '—',
    icon: Document
  },
  {
    label: '用户权限',
    value: (() => {
      const role = userStore.userInfo?.role
      return role === 0 ? '普通用户' : role === 1 ? '管理员' : '—'
    })(),
    icon: Document // 统一使用 Document，避免 undefined icon
  },
  {
    label: '账户状态',
    value: userStore.userInfo?.status === 1 ? '正常' : '禁用',
    icon: Document
  }
])

// === 初始化 ===
onMounted(() => {
  fetchLogs(1)
})
</script>

<style scoped>
.profile-page {
  background: #ffffff; /* 与首页一致 */
  min-height: 100vh;
  padding-top: 60px; /* 为固定头部留空间 */
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* ========== 统计卡片 ========== */
.card-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: #f9fafb;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(79, 108, 249, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f6cf9;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

/* ========== API 密钥卡片 ========== */
.api-key-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.key-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.key-icon {
  color: #4f6cf9;
}

.key-text {
  font-family: 'Consolas', monospace;
  font-size: 14px;
  color: #374151;
  padding: 4px 8px;
  background: #f9fafb;
  border-radius: 6px;
}

/* ========== 日志 ========== */
.logs-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.log-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9ca3af;
  font-size: 14px;
  gap: 8px;
}

.logs-list {
  margin: 16px 0;
}

.log-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.log-item:last-child {
  border-bottom: none;
}

.log-method {
  width: 70px;
  text-align: center;
  padding: 6px 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin-right: 16px;
  flex-shrink: 0;
}

.method-GET { background-color: #4f6cf9; }
.method-POST { background-color: #10b981; }
.method-PUT { background-color: #f59e0b; }
.method-DELETE { background-color: #ef4444; }

.log-details {
  flex: 1;
}

.log-url {
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 8px;
  word-break: break-all;
}

.log-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.log-meta b {
  color: #1f2937;
}

.log-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .stat-card {
    padding: 20px;
  }

  .card-row {
    gap: 16px;
  }

  .log-method {
    width: 60px;
    font-size: 11px;
  }

  .log-meta {
    gap: 12px;
    font-size: 11px;
  }
}
</style>