<!-- src/views/ApiList.vue -->
<template>
  <div class="api-list-page">
    <!-- 顶部导航 -->
    <AppHeader />

    <!-- 主内容区 -->
    <div class="container">
      <h1 class="section-title">接口状态</h1>
      <!-- ========== 数据概览卡片 ========== -->
      <div class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalApis }}</div>
              <div class="stat-label">API 总数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(stats.totalCalls) }}</div>
              <div class="stat-label">总调用次数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeApis }}</div>
              <div class="stat-label">正常 API</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon><Lightning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.inactiveApis }}</div>
              <div class="stat-label">异常 API</div>
            </div>
          </div>
        </el-card>

        <!-- 🔥 待审核API卡片 (现在基于实际数据) -->
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingReview }}</div>
              <div class="stat-label">待审核 API</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- ========== 排行榜图表 ========== -->
      <h2 class="section-title">排行榜</h2>
      <div class="rankings-container">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header">
              <span>今日调用最多</span>
            </div>
          </template>
          <div v-if="topTodayApis.length === 0" class="no-data">暂无数据</div>
          <div v-else class="ranking-list">
            <div
              v-for="(item, index) in topTodayApis"
              :key="'today-' + index"
              class="ranking-item"
            >
              <span class="index">{{ index + 1 }}</span>
              <span class="name">{{ item.name }}</span>
              <span class="count">{{ item.count }} 次</span>
            </div>
          </div>
        </el-card>

        <el-card class="ranking-card">
          <template #header>
            <div class="card-header">
              <span>历史调用最多</span>
            </div>
          </template>
          <div v-if="topAllTimeApis.length === 0" class="no-data">暂无数据</div>
          <div v-else class="ranking-list">
            <div
              v-for="(item, index) in topAllTimeApis"
              :key="'alltime-' + index"
              class="ranking-item"
            >
              <span class="index">{{ index + 1 }}</span>
              <span class="name">{{ item.name }}</span>
              <span class="count">{{ item.count }} 次</span>
            </div>
          </div>
        </el-card>
      </div>

      <h2 class="section-title">可用 API 接口</h2>
      <!-- ========== 搜索和分页工具栏 ========== -->
      <div class="toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="按名称或描述搜索..."
          clearable
          style="width: 300px;"
          @input="handleSearchInput"
        />
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[6, 12, 24, 48]"
          :background="true"
          layout="sizes, prev, pager, next"
          :total="filteredApiList.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <div class="api-cards">
        <div v-for="api in paginatedApiList" :key="api.id" class="api-card" @click="openDetail(api)">
          <div class="card-header">
            <h3 class="api-name">{{ api.apiName }}</h3>
            <el-tag size="small" :type="getTagType(api.status)">
              {{ api.status === 'active' ? '正常' : '异常' }}
            </el-tag>
          </div>
          <p class="api-description">
            {{ api.description || '暂无描述' }}
          </p>
          <div class="card-footer">
            <span class="category">{{ api.apiCategory }}</span>
            <!-- 🔥 显示额度费用 -->
            <el-tag size="small" type="info" class="cost-tag">
              额度: {{ api.creditCost }}
            </el-tag>
            <span class="version">{{ api.version }}</span>
          </div>
        </div>

        <div v-if="paginatedApiList.length === 0 && !loading" class="empty-state">
          未找到匹配的 API
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="detail.apiName || 'API 详情'"
      width="900px"
      append-to-body
      class="api-detail-dialog"
    >
      <!-- 弹窗内容 -->
      <div class="detail-layout" v-if="detail.id">
        <div class="detail-left">
          <div class="detail-content">
            <div class="detail-item">
              <label>唯一标识</label>
              <span>{{ detail.apiIdentifier }}</span>
            </div>
            <div class="detail-item">
              <label>功能描述</label>
              <span>{{ detail.description || '—' }}</span>
            </div>
            <div class="detail-item">
              <label>请求路径</label>
              <span class="code">{{ detail.breakpointPath }}</span>
            </div>
            <div class="detail-item">
              <label>请求方法</label>
              <el-tag size="small" :type="getMethodTagType(detail.method)">
                {{ detail.method }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>网关地址</label>
              <span class="code">{{ detail.gatewayUrl  }}</span>
            </div>
            <div class="detail-item">
              <label>分类</label>
              <span>{{ detail.apiCategory }}</span>
            </div>
            <div class="detail-item">
              <label>版本</label>
              <span>{{ detail.version }}</span>
            </div>
            <div class="detail-item">
              <label>是否公开</label>
              <el-tag size="small" :type="detail.isPublic ? 'success' : 'info'">
                {{ detail.isPublic ? '是' : '否' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>频率限制</label>
              <span>{{ detail.rateLimit || '无限制' }}</span>
            </div>
            <!-- 🔥 额度费用 -->
            <div class="detail-item">
              <label>额度费用</label>

                {{ detail.creditCost }} 额度/次
            </div>
            <div class="detail-item">
              <label>状态</label>
              <el-tag size="small" :type="getTagType(detail.status)">
                {{ detail.status === 'active' ? '正常' : '异常' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>创建时间</label>
              <span>{{ formatDate(detail.createTime) }}</span>
            </div>
            <div class="detail-item">
              <label>更新时间</label>
              <span>{{ formatDate(detail.updateTime) }}</span>
            </div>
            <div class="detail-item">
              <label>创建者</label>
              <span>{{ detail.creatorId }}</span>
            </div>
          </div>
        </div>

        <div class="detail-right" v-if="showExample">
          <div class="response-header">
            <h4>{{ exampleType === 'request' ? 'Curl 请求示例' : '返回示例' }}</h4>
            <el-button size="小号" @click="copyExample">
              {{ exampleType === 'request' ? '复制 Curl' : '复制响应' }}
            </el-button>
          </div>
          <pre class="response-body"><code>{{ currentExample }}</code></pre>
        </div>
      </div>

      <template #footer>
        <el-button @click="showRequestExample">Curl 示例</el-button>
        <el-button @click="showResponseExample">返回示例</el-button>
        <el-button v-if="showExample" @click="showExample = false">隐藏示例</el-button>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/store/index'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getAllApis, getApisTotal,getTopTodayApis, getTopAllTimeApis } from '../api/apis'
import { toast } from '../composables/util'
import AppHeader from '../components/AppHeader.vue'
import { DataAnalysis, Lock, Lightning, Document } from '@element-plus/icons-vue'

// === 状态 ===
const userStore = useUserStore()
const apiList = ref([])
const totalCalls = ref(0)
const loading = ref(false)
const dialogVisible = ref(false)
const detail = ref({})
const showExample = ref(false)
const exampleType = ref('response')

// 状态管理
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(6)
const topTodayApis = ref([])
const topAllTimeApis = ref([])

// === 计算属性 ===
// --- 🔥 修改：stats 计算属性，现在包含基于 reviewStatus 的 pendingReview 计算 ---
const stats = computed(() => {
  const list = apiList.value
  const totalApis = list.length
  const activeApis = list.filter(api => api.status === 'active').length
  const inactiveApis = totalApis - activeApis
  const totalCallCount = totalCalls.value

  // 计算待审核 API 数量：reviewStatus 为 0 表示待审核
  const pendingReview = list.filter(api => api.reviewStatus === 0).length

  return {
    totalApis,
    totalCalls: totalCallCount,
    activeApis,
    inactiveApis,
    pendingReview, // 将计算结果包含在返回对象中
  }
})

const filteredApiList = computed(() => {
  const query = searchQuery.value.toLowerCase();
  // 🔥 过滤逻辑：只显示 reviewStatus 为 1 (已审核) 且符合搜索条件的API
  return apiList.value.filter(api => 
    api.reviewStatus === 1 && 
    (api.apiName.toLowerCase().includes(query) || 
     api.description.toLowerCase().includes(query))
  )
})

const paginatedApiList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredApiList.value.slice(start, end);
});

// === 数据转换 ===
const transformApi = (raw) => {
  return {
    id: raw.id,
    apiIdentifier: String(raw.id),
    apiName: raw.name,
    description: raw.description,
    breakpointPath: raw.endpoint,
    method: METHOD_MAP[raw.method] || 'GET',
    backendUrl: raw.upstreamUrl, // 为了保持向后兼容性，如果你想在其他地方用这个字段，可以保留它，但详情页已不用
    gatewayUrl: raw.gatewayUrl, // 新增或直接用于模板
    apiCategory: raw.category || '未分类',
    version: raw.version,
    isPublic: raw.isPublic,
    rateLimit: raw.rateLimit ? `${raw.rateLimit}/分钟` : '无限制',
    creditCost: raw.creditCost || 0,
    status: raw.status ? 'active' : 'inactive',
    createTime: raw.createdAt,
    updateTime: raw.updatedAt,
    creatorId: raw.createdBy,
    curlExample: raw.curlExample || '',
    responseExample: raw.responseExample || '{}',
    reviewStatus: raw.reviewStatus || 0 // 0: 待审核, 1: 已审核
  }
}

// === 方法映射 ===
const METHOD_MAP = {
  '0': 'GET',
  '1': 'POST',
  '2': 'PUT',
  '3': 'DELETE',
  '4': 'PATCH',
  '5': 'OPTIONS',
  '6': 'HEAD'
}

// === 数据获取 ===
const fetchApiList = async () => {
  loading.value = true
  try {
    const res = await getAllApis()
    apiList.value = (res.data || []).map(transformApi)
  } catch (error) {
    console.error('加载 API 列表失败', error)
    apiList.value = []
  } finally {
    loading.value = false
  }
}

const fetchTotalCalls = async () => {
  try {
    const res = await getApisTotal()
    totalCalls.value = res.data || 0
  } catch (error) {
    console.error('获取总调用次数失败', error)
    totalCalls.value = 0
  }
}

// 🔥 模拟排行榜数据
const fetchTopApis = async () => {
  try {
    const [todayRes, allTimeRes] = await Promise.all([
      getTopTodayApis(), 
      getTopAllTimeApis()
    ]);
 // 将 api_name 映射为 name
    topTodayApis.value = (todayRes.data || []).map(item => ({
      name: item.api_name,
      count: item.count
    }));
    topAllTimeApis.value = (allTimeRes.data || []).map(item => ({
      name: item.api_name,
      count: item.count
    }));
  } catch (error) {
    console.error('获取排行榜数据失败', error);
    ElMessage.error('获取排行榜失败');
  }
};
// === 详情弹窗 ===
const openDetail = (api) => {
  detail.value = { ...api }
  dialogVisible.value = true
  showExample.value = false
}

const currentExample = computed(() => {
  if (exampleType.value === 'request') {
    return detail.value.curlExample || '# 未提供 Curl 请求示例'
  } else {
    const example = detail.value.responseExample
    if (!example) return '{}'
    try {
      const obj = typeof example === 'string' ? JSON.parse(example) : example
      return JSON.stringify(obj, null, 2)
    } catch (e) {
      return String(example)
    }
  }
})

// === 工具函数 ===
const formatNumber = (num) => {
  if (num == null || num === '') return '0'
  const number = typeof num === 'string' ? parseFloat(num) : num
  return isNaN(number) ? '0' : number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '—'
}

const getTagType = (status) => {
  return status === 'active' ? 'success' : 'danger'
}

const getMethodTagType = (method) => {
  const map = {
    GET: 'success',
    POST: 'warning',
    PUT: 'primary',
    DELETE: 'danger'
  }
  return map[method] || 'info'
}

// 分页和搜索
const handleSearchInput = () => {
  currentPage.value = 1;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// === 初始化 ===
onMounted(async () => {
  await Promise.allSettled([
    fetchApiList(),
    fetchTotalCalls(),
    fetchTopApis(),
  ]);
})
</script>

<style scoped>
/* ========== 整体页面 ========== */
.api-list-page {
  background: #ffffff;
  min-height: 100vh;
}

/* ========== 容器 ========== */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* ========== 标题 ========== */
.section-title {
  text-align: center;
  font-size: 28px;
  margin: 40px 0 32px;
  color: #1f2937;
  font-weight: 800;
}

/* ========== API 卡片 ========== */
.api-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.api-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.api-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.api-name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex: 1;
  word-break: break-word;
}

.api-description {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
  flex: 1;
  margin: 8px 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  font-size: 13px;
  color: #9ca3af;
}

.cost-tag {
  margin: 0 8px;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  grid-column: 1 / -1;
  font-size: 16px;
  padding: 40px;
}

/* ========== 弹窗样式 ========== */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
}

.detail-item label {
  width: 100px;
  font-weight: bold;
  color: #555;
  flex-shrink: 0;
}

.detail-item span,
.detail-item .el-tag {
  flex: 1;
  word-break: break-word;
}

.code {
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.api-detail-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
}

.detail-layout {
  display: flex;
  gap: 20px;
  max-height: 60vh;
}

.detail-left {
  flex: 1;
}

.detail-right {
  width: 40%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #eee;
  padding-left: 20px;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.response-body {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 6px;
  overflow: auto;
  flex: 1;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.response-body code {
  white-space: pre;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .detail-layout {
    flex-direction: column;
  }

  .detail-right {
    width: 100%;
    border-left: none;
    padding-left: 0;
    margin-top: 20px;
  }

  .section-title {
    font-size: 24px;
  }

  .api-card {
    padding: 20px;
  }
}

/* ========== 数据概览卡片 ========== */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background-color: #f3f4f6;
  color: #6b7280;
}

.stat-icon.success {
  background-color: #ecfdf5;
  color: #059669;
}

.stat-icon.danger {
  background-color: #fef2f2;
  color: #dc2626;
}

/* 🔥 警告颜色图标样式 */
.stat-icon.warning {
  background-color: #fffbeb;
  color: #f59e0b;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* ========== 排行榜 ========== */
.rankings-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.ranking-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.card-header {
  font-weight: bold;
  color: #374151;
}

.no-data {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 20px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.ranking-item:last-child {
  border-bottom: none;
}

.index {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e7eb;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  color: #4b5563;
}

.name {
  flex: 1;
  margin: 0 12px;
  color: #374151;
  font-weight: 500;
}

.count {
  color: #6b7280;
  font-size: 14px;
}

/* ========== 搜索和分页工具栏 ========== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>