<template>
  <div class="developer-console-page">
    <!-- 顶部导航 -->
    <AppHeader />

    <div class="container">
      <!-- 顶部概览卡片 -->
      <div class="card-row">
        <el-card class="stat-card" v-for="(item, index) in overviewCards" :key="index">
          <div class="card-icon">
            <el-icon :size="24"><component :is="item.icon" /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">{{ item.label }}</div>
            <div class="card-value">{{ item.value }}</div>
          </div>
        </el-card>
      </div>

       <div class="content-wrapper">
        <div class="charts-section">
          <!-- 调用量趋势图 -->
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>调用量趋势</span>
                <el-select v-model="timeRange" placeholder="选择时间范围" size="small" @change="fetchCallTrendData">
                  <el-option label="近7天" value="7d"></el-option>
                  <el-option label="近30天" value="30d"></el-option>
                  <el-option label="近90天" value="90d"></el-option>
                </el-select>
              </div>
            </template>
            <div id="calls-trend-chart" style="height: 400px;"></div>
          </el-card>

          <!-- 接口调用分布图 -->
          <el-card class="chart-card" style="margin-top: 24px;">
            <template #header>
              <div class="card-header">
                <span>接口调用分布</span>
                <!-- 可选：添加一个刷新按钮 -->
                <el-button type="primary" link size="small" @click="fetchApiDistributionData">刷新</el-button>
              </div>
            </template>
            <div id="api-distribution-chart" style="height: 400px;"></div>
          </el-card>
        </div>

        <!-- 右侧列表/操作区域 -->
        <div class="list-section">
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" size="large" icon="Plus" @click="publishNewApi" style="width: 100%;">
              发布接口
            </el-button>
          </div>

          <!-- ========== API 列表（自定义格式） ========== -->
          <el-card class="api-list-card">
            <template #header>
              <div class="card-header">
                <span>我的API列表</span>
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索接口名称/路径..."
                  style="width: 220px;"
                  size="small"
                  clearable
                  @clear="handleSearch"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </template>

            <!-- 搜索表单 -->
            <div class="api-search">
              <el-form :model="apiSearchForm" inline size="small">
                <el-form-item label="状态">
                  <el-select 
                    v-model="apiSearchForm.status" 
                    placeholder="全部" 
                    clearable 
                    style="width: 100px;"
                  >
                    <el-option label="启用" :value="true" />
                    <el-option label="禁用" :value="false" />
                  </el-select>
                </el-form-item>
                <el-form-item label="审核">
                  <el-select 
                    v-model="apiSearchForm.reviewStatus" 
                    placeholder="全部" 
                    clearable 
                    style="width: 100px;"
                  >
                    <el-option label="审核中" :value="0" />
                    <el-option label="已通过" :value="1" />
                    <el-option label="已拒绝" :value="2" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="handleReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 加载中 -->
            <div v-if="loadingApis" class="api-placeholder">
              <el-icon :size="20" class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>

            <!-- 无数据 -->
            <div v-else-if="filteredApiList.length === 0" class="api-placeholder">
              <el-icon :size="20"><Document /></el-icon>
              <span>暂无API记录，点击"发布接口"创建您的第一个API</span>
            </div>

            <!-- API 列表 -->
            <div v-else class="api-list">
              <div
                v-for="api in filteredApiList"
                :key="api.id"
                class="api-item"
              >
                <!-- 左侧：方法标签 + 基本信息 -->
                <div class="api-main">
                  <div class="api-method" :class="`method-${METHOD_MAP[api.method]}`">
                    {{ METHOD_MAP[api.method] || 'GET' }}
                  </div>
                  <div class="api-info">
                    <div class="api-name">
                      <span class="name-text">{{ api.name }}</span>
                      <el-tag v-if="api.isPublic" size="small" type="success" effect="plain">公开</el-tag>
                      <el-tag v-else size="small" effect="plain">私有</el-tag>
                    </div>
                    <div class="api-endpoint">{{ api.endpoint }}</div>
                    <div class="api-meta">
                      <span>分类: <b>{{ api.category || '-' }}</b></span>
                      <span>版本: {{ api.version || 'v1.0' }}</span>
                      <span>调用: {{ api.callCount || 0 }} 次</span>
                      <span>{{ formatDate(api.updatedAt) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 右侧：状态 + 操作 -->
                <div class="api-actions">
                  <div class="api-status">
                    <el-tag :type="api.status ? 'success' : 'info'" size="small">
                      {{ api.status ? '启用' : '禁用' }}
                    </el-tag>
                    <el-tag 
                      :type="getReviewStatusTagType(api.reviewStatus)" 
                      size="small" 
                      style="margin-left: 6px;"
                    >
                      {{ getReviewStatusText(api.reviewStatus) }}
                    </el-tag>
                  </div>
                  <div class="action-buttons">
                    <el-button size="small" type="primary" link @click="viewDetails(api)">查看</el-button>
                    <el-button size="small" type="primary" link @click="editApi(api)">编辑</el-button>
                    <el-button size="small" type="danger" link @click="deleteApi(api)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <el-pagination
              v-if="totalApiCount > pageSize"
              class="api-pagination"
              background
              layout="prev, pager, next, jumper"
              :total="totalApiCount"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handleCurrentChange"
              @size-change="handleSizeChange"
            />
          </el-card>

          <!-- 实时动态/日志 -->
          <el-card class="api-list-card" style="margin-top: 24px;">
            <template #header>
              <div class="card-header">
                <span>实时动态/日志</span>
              </div>
            </template>
            <!-- Element Plus 虚拟滚动 -->
            <el-scrollbar height="400px">
              <div
                v-for="(log, index) in logs"
                :key="log.id || index"
                class="log-item"
              >
                <div class="log-method" :class="`method-${log.method}`">
                  {{ log.method }}
                </div>
                <div class="log-info">
                  <div class="log-url">{{ log.url }}</div>
                  <div class="log-meta">
                    <span>状态: <b>{{ log.status }}</b></span>
                    <span>耗时: {{ log.latency }}ms</span>
                    <span>IP: {{ log.ip }}</span>
                    <span>{{ formatDate(log.timestamp) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="!logs.length" class="no-logs">暂无实时日志</div>
            </el-scrollbar>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      append-to-body
      class="api-detail-dialog"
    >
      <div class="detail-layout" v-if="dialogVisible">
        <div class="detail-left">
          <div class="detail-content">
            <div class="detail-item">
              <label>接口名称</label>
              <el-input v-model="detail.name" :disabled="!isEditing" placeholder="请输入接口名称" />
            </div>
            <div class="detail-item">
              <label>功能描述</label>
              <el-input v-model="detail.description" :disabled="!isEditing" type="textarea" :rows="2" placeholder="请输入功能描述" />
            </div>
            <div class="detail-item">
              <label>请求路径</label>
              <el-input v-model="detail.endpoint" :disabled="!isEditing" placeholder="/api/example/path" />
            </div>
            <div class="detail-item">
              <label>请求方法</label>
              <el-select v-model="detail.method" :disabled="!isEditing" placeholder="请选择">
                <el-option label="GET" value="0"></el-option>
                <el-option label="POST" value="1"></el-option>
                <el-option label="PUT" value="2"></el-option>
                <el-option label="DELETE" value="3"></el-option>
              </el-select>
            </div>
            <div class="detail-item">
              <label>后端地址</label>
              <el-input v-model="detail.upstreamUrl" :disabled="!isEditing" placeholder="http://backend-service:8080/api/internal" />
            </div>
            <div class="detail-item">
              <label>分类</label>
              <el-input v-model="detail.category" :disabled="!isEditing" placeholder="如：用户服务、订单服务" />
            </div>
            <div class="detail-item">
              <label>版本</label>
              <el-input v-model="detail.version" :disabled="!isEditing" placeholder="如：v1.0" />
            </div>
            <div class="detail-item">
              <label>是否公开</label>
              <el-switch
                v-model="detail.isPublic"
                :disabled="!isEditing"
                active-text="是"
                inactive-text="否"
              />
            </div>
            <div class="detail-item">
              <label>频率限制</label>
              <el-input-number v-model="detail.rateLimit" :disabled="!isEditing" :min="0" placeholder="每分钟请求数，0为不限制" />
            </div>
                     <div class="detail-item">
          <label>额度费用</label>
          <el-input-number 
            v-model="detail.creditCost" 
            :disabled="!isEditing" 
            :min="0" 
            placeholder="每次调用消耗的额度" 
            :precision="0" 
            :step="1"/>
        </div>
            <div class="detail-item">
              <label>状态</label>
              <el-tag size="small" :type="getTagType(detail.status ? 'active' : 'inactive')">
                {{ detail.status ? '正常' : '异常' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>审核状态</label>
              <el-tag size="small" :type="getReviewStatusTagType(detail.reviewStatus)">
                {{ getReviewStatusText(detail.reviewStatus) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>创建时间</label>
              <span>{{ formatDate(detail.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <label>更新时间</label>
              <span>{{ formatDate(detail.updatedAt) }}</span>
            </div>
            <div class="detail-item">
              <label>创建者</label>
              <span>{{ detail.createdBy }}</span>
            </div>
          </div>
        </div>

        <div class="detail-right" v-if="showExample">
          <div class="response-header">
            <h4>{{ exampleType === 'request' ? 'Curl 请求示例' : '返回示例' }}</h4>
            <el-button size="small" @click="copyExample">
              {{ exampleType === 'request' ? '复制 Curl' : '复制响应' }}
            </el-button>
          </div>
          <el-input
            v-if="isEditing"
            v-model="currentExample"
            @input="syncExampleToDetail"
            :rows="10"
            type="textarea"
            placeholder="在此输入示例"
            class="editable-example"
          />
          <pre v-else class="response-body"><code>{{ currentExample }}</code></pre>
        </div>
      </div>

      <template #footer>
        <el-button @click="showRequestExample">Curl 示例</el-button>
        <el-button @click="showResponseExample">返回示例</el-button>
        <el-button v-if="showExample" @click="showExample = false">隐藏示例</el-button>
        <el-button v-if="isEditing" type="primary" @click="submitChanges">确定</el-button>
        <el-button v-else @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { deleteApiById, getApisByUser, insertApi,updateApi,getCallTrendData,getApiDistributionData,getTotalIncome  } from '../api/apis'
import { ElMessageBox, ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import AppHeader from '../components/AppHeader.vue'
import { 
  Connection, TrendCharts, Money, Wallet, Plus, Document, 
  SuccessFilled, CircleClose, Search, Loading 
} from '@element-plus/icons-vue'


// --- Mock Data & State ---
const router = useRouter()

const overviewCards = ref([
  { label: '我的接口总数', value: 0, icon: Connection },
  { label: '总调用次数', value: '0', icon: Document },
  { label: '今日调用次数', value: '0', icon: TrendCharts },
  { label: '总收入额度', value: '0', icon: Money },
  { label: '接口成功率', value: '100%', icon: SuccessFilled },
])

const timeRange = ref('7d')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const loadingApis = ref(false)
const todayCalls = ref(0)

// API 数据源
const apiList = ref([])
const totalApiCount = ref(0) // 用于分页的总数

// 搜索表单
const apiSearchForm = ref({
  status: undefined,
  reviewStatus: undefined
})

// 实时日志数据
const logs = ref([])
let ws = null

// 弹窗相关变量
const dialogVisible = ref(false)
const detail = ref({
  id: null,
  name: '',
  description: '',
  endpoint: '',
  method: '0',
  upstreamUrl: '',
  category: '',
  version: '',
  isPublic: false,
  rateLimit: 100,
  responseExample: '',
  curlExample: '',
  creditCost: 0
})
const showExample = ref(false)
const exampleType = ref('request')
const currentExample = ref('')
const isEditing = ref(false)

// 方法映射
const METHOD_MAP = {
  '0': 'GET',
  '1': 'POST',
  '2': 'PUT',
  '3': 'DELETE',
  '4': 'PATCH',
  '5': 'OPTIONS',
  '6': 'HEAD'
}

// --- 图表相关状态 ---
// 添加一个loading状态，用于图表加载
const loadingTrendChart = ref(false)
const loadingDistributionChart = ref(false)


// --- Computed ---
const filteredApiList = computed(() => {
  let filtered = apiList.value
  
  // 关键词搜索
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    filtered = filtered.filter(api =>
      api.name?.toLowerCase().includes(keyword) ||
      api.endpoint?.toLowerCase().includes(keyword)
    )
  }
  
  // 状态过滤
  if (apiSearchForm.value.status !== undefined) {
    filtered = filtered.filter(api => api.status === apiSearchForm.value.status)
  }
  
  // 审核状态过滤
  if (apiSearchForm.value.reviewStatus !== undefined) {
    filtered = filtered.filter(api => api.reviewStatus === apiSearchForm.value.reviewStatus)
  }
  
  // 记录总数用于分页
  totalApiCount.value = filtered.length
  
  // 分页切片
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.slice(start, start + pageSize.value)
})

const dialogTitle = computed(() => {
  if (isEditing.value) {
    return detail.value.id ? '编辑 API' : '发布新 API'
  }
  return 'API 详情'
})

// 动态更新概览卡片数据
const updateOverviewCards = () => {
  const totalApis = apiList.value.length
  const totalCalls = apiList.value.reduce((sum, api) => sum + (api.callCount || 0), 0)
  overviewCards.value[0].value = totalApis
  overviewCards.value[1].value = totalCalls.toLocaleString()
}

// --- Methods ---
const fetchCallTrendData = async () => {
  loadingTrendChart.value = true
  try {
    const res = await getCallTrendData(timeRange.value)
    const chartDom = document.getElementById('calls-trend-chart');
    if (!chartDom) return;
    const myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);

 // 🔥 修正数据处理逻辑：直接从 res.data 数组中提取日期和调用次数
    const trendData = res.data || [];
    const dates = trendData.map(item => item.date);
    const callCounts = trendData.map(item => item.count);

    const todayString = new Date().toISOString().split('T')[0]; // 获取今天的 "YYYY-MM-DD" 格式
    const todayRecord = trendData.find(item => item.date === todayString);
    todayCalls.value = todayRecord ? todayRecord.count : 0;

    overviewCards.value[2].value = todayCalls.value.toLocaleString(); // 更新第三个卡片（索引为2）

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates // 使用提取出的日期数组
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: '总调用数',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.1 },
        data: callCounts // 使用提取出的调用次数数组
      }]
    };
    myChart.setOption(option);
  } catch (error) {
    console.error('获取调用量趋势失败:', error)
    ElMessage.error('获取调用量趋势失败')
  } finally {
    loadingTrendChart.value = false
  }
};


// 新增获取分布数据的函数
const fetchApiDistributionData = async () => {
  loadingDistributionChart.value = true
  try {
    const res = await getApiDistributionData()
    const chartDom = document.getElementById('api-distribution-chart');
    if (!chartDom) return;
    const myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);

    const distributionData = res.data || [];

    const recentTotalCalls = distributionData.reduce((sum, item) => sum + item.count, 0);
    overviewCards.value[1].value = recentTotalCalls.toLocaleString(); // 索引1对应“总调用次数”


   const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'right'
      },
      series: [
        {
          name: '调用分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          data: distributionData.map(item => ({
            value: item.count,
            name: item.api_name
          }))
        }
      ]
    };
    myChart.setOption(option);
  } catch (error) {
    console.error('获取接口调用分布失败:', error)
    ElMessage.error('获取接口调用分布失败')
  } finally {
    loadingDistributionChart.value = false
  }
};


const publishNewApi = () => {
  detail.value = {
    id: null,
    name: '',
    endpoint: '',
    method: '0',
    description: '',
    upstreamUrl: '',
    category: '',
    version: 'v1.0',
    isPublic: false,
    rateLimit: 0,
    status: false,
    reviewStatus: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'current_user_id',
    callCount: 0,
    curlExample: '',
    responseExample: '{}',
    creditCost: 0
  }
  isEditing.value = true
  dialogVisible.value = true
}

const viewDetails = (row) => {
  detail.value = { ...row }
  isEditing.value = false
  showExample.value = false
  dialogVisible.value = true
}

const editApi = (row) => {
  detail.value = { ...row }
  isEditing.value = true
  showExample.value = false
  dialogVisible.value = true
}

const deleteApi = (row) => {
  ElMessageBox.confirm(
    `此操作将永久删除API "${row.name}"，以及其所有相关数据。是否继续?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  .then(async () => { // 🔥-------- 修改：改为异步 --------

    // 1. 调用后端删除 API
    try {
      await deleteApiById(row.id)
      ElMessage.success('删除成功')

      // 2. 从前端列表中移除
      const index = apiList.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        apiList.value.splice(index, 1)
        updateOverviewCards()
        // 如果删除的是当前打开详情的API，关闭详情窗口
        if (detail.value.id === row.id && dialogVisible.value) {
          dialogVisible.value = false
        }
      }
    } catch (error) {
      console.error('删除API失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '删除失败，请稍后重试'
      ElMessage.error(errorMessage)
    }
  })
  .catch(() => {
    ElMessage.info('已取消删除')
  })
}

const fetchTotalIncome = async () => {
  try {
    const res = await getTotalIncome()
    const income = res.data || 0
    overviewCards.value[3].value = `¥${income.toLocaleString()}`
  } catch (error) {
    console.error('获取总收入失败:', error)
    ElMessage.error('获取总收入失败，请检查后端接口') // 取消注释并修改
  }
}



const submitChanges = () => {
  if (!detail.value.name?.trim()) {
    ElMessage.error('接口名称不能为空')
    return
  }
  if (!detail.value.endpoint?.trim()) {
    ElMessage.error('请求路径不能为空')
    return
  }
  if (!detail.value.method) {
    ElMessage.error('请求方法不能为空')
    return
  }
  if (!detail.value.upstreamUrl?.trim()) {
    ElMessage.error('后端地址不能为空')
    return
  }
  if (!detail.value.category?.trim()) {
    ElMessage.error('分类不能为空')
    return
  }
  if (!detail.value.version?.trim()) {
    ElMessage.error('版本不能为空')
    return
  }

  ElMessageBox.confirm(
    `${detail.value.id ? '修改' : '创建'}一个API后，将进入审核流程，期间接口不可用。`,
    '确认提交',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  .then(async () => { // 🔥-------- 修改：改为异步 --------
    try {
      if (!detail.value.id) {
        // 发布新 API
        await insertApi(detail.value)
        ElMessage.success('创建成功，已提交审核。')
      } else {
        // 更新现有 API
        await updateApi(detail.value.id, detail.value) // 🔥-------- 调用新的更新API --------
        ElMessage.success('修改成功，已提交审核。')

        // 本地更新列表中的数据
        const index = apiList.value.findIndex(api => api.id === detail.value.id)
        if (index !== -1) {
          // 假设后端会自动处理 reviewStatus 和 updatedAt
          apiList.value[index] = { ...detail.value, reviewStatus: 0, updatedAt: new Date().toISOString() }
        }
      }
      dialogVisible.value = false
      isEditing.value = false
      await fetchData() // 🔥-------- 重新获取列表以刷新数据 --------
    } catch (error) {
      console.error('提交API失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '提交失败，请稍后重试'
      ElMessage.error(errorMessage)
    }
  })
  .catch(() => {
    ElMessage.info('已取消提交')
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  apiSearchForm.value = {
    status: undefined,
    reviewStatus: undefined
  }
  searchQuery.value = ''
  currentPage.value = 1
}

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMethodTagType = (method) => {
  const methodStr = METHOD_MAP[method] || 'GET'
  switch (methodStr) {
    case 'GET': return 'success'
    case 'POST': return 'warning'
    case 'PUT': return 'primary'
    case 'DELETE': return 'danger'
    default: return 'info'
  }
}

const getTagType = (status) => {
  return status === 'active' ? 'success' : 'danger'
}

const getReviewStatusTagType = (status) => {
  if (status === 0) return 'warning'
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'info'
}

const getReviewStatusText = (status) => {
  if (status === 0) return '审核中'
  if (status === 1) return '审核通过'
  if (status === 2) return '审核失败'
  return '未知'
}

const syncExampleToDetail = () => {
  if (exampleType.value === 'request') {
    detail.value.curlExample = currentExample.value;
  } else {
    detail.value.responseExample = currentExample.value;
  }
};

const showRequestExample = () => {
  exampleType.value = 'request'
  // 🔥 修改：将 detail 中的值同步到 currentExample
  currentExample.value = detail.value.curlExample || `curl -X ${METHOD_MAP[detail.value.method] || 'GET'} "${detail.value.endpoint || ''}"`
  showExample.value = true
}

const showResponseExample = () => {
  exampleType.value = 'response'
  // 🔥 修改：将 detail 中的值同步到 currentExample
  let responseStr = detail.value.responseExample
  if (!responseStr) {
    responseStr = '{}'
  } else if (typeof responseStr === 'object') {
    responseStr = JSON.stringify(responseStr, null, 2)
  }
  currentExample.value = responseStr
  showExample.value = true
}

const copyExample = () => {
  navigator.clipboard.writeText(currentExample.value).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(err => {
    ElMessage.error('复制失败')
    console.error('复制失败:', err)
  })
}

// --- Data Fetching ---
const fetchData = async () => {
  loadingApis.value = true
  try {
    const res = await getApisByUser()
    apiList.value = res.data || []
    updateOverviewCards()
  } catch (error) {
    console.error('加载 API 列表失败', error)
    ElMessage.error('加载 API 列表失败')
    apiList.value = []
  } finally {
    loadingApis.value = false
  }
}

// --- Charts Initialization ---
let callsTrendChart = null
let distributionChart = null

// 将 initCharts 函数替换为图表初始化逻辑
const initCharts = () => {
  // 图表会在 fetchCallTrendData 和 fetchApiDistributionData 中初始化和设置数据
  // 所以这里不需要做任何事，但保留函数名以备不时之需
}

const connectWebSocket = () => {
  const wsUrl = 'ws://localhost:8081/ws/logs'
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('WebSocket连接已建立')
  }

  ws.onmessage = (event) => {
    try {
      const newLog = JSON.parse(event.data)
      logs.value.unshift(newLog)
      if (logs.value.length > 50) {
        logs.value = logs.value.slice(0, 50)
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket发生错误:', error)
  }

  ws.onclose = (event) => {
    console.log('WebSocket连接已关闭，代码:', event.code, '原因:', event.reason)
    setTimeout(connectWebSocket, 3000)
  }
}

// --- Lifecycle ---
onMounted(() => {
  fetchData()
  initCharts()
  connectWebSocket()
  fetchTotalIncome()
  fetchCallTrendData()
  fetchApiDistributionData()

  // 窗口 resize 时重绘图表
  window.addEventListener('resize', () => {
    callsTrendChart?.resize()
    distributionChart?.resize()
  })
})

onUnmounted(() => {
  if (callsTrendChart) {
    callsTrendChart.dispose()
  }
  if (distributionChart) {
    distributionChart.dispose()
  }
  if (ws) {
    ws.close()
  }
  window.removeEventListener('resize', () => {
    callsTrendChart?.resize()
    distributionChart?.resize()
  })
})
</script>

<style scoped>
.developer-console-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

/* ===== 卡片样式 ===== */
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

/* ===== 布局样式 ===== */
.content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.charts-section .chart-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
}

.list-section .action-buttons {
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
}

.list-section .api-list-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ========== API 搜索表单 ========== */
.api-search {
  background: #f9fafb;
  padding: 16px 20px;
  border-radius: 8px;
  margin: 0 0 16px 0;
}

.api-search .el-form {
  gap: 16px;
  flex-wrap: wrap;
}

.api-search .el-form-item {
  margin-bottom: 0;
}

.api-search .el-form-item__label {
  color: #374151;
  font-weight: 600;
}

/* ========== API 列表样式 ========== */
.api-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9ca3af;
  font-size: 14px;
  gap: 8px;
}

.api-list {
  margin: 8px 0;
}

.api-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  gap: 16px;
}

.api-item:last-child {
  border-bottom: none;
}

.api-main {
  display: flex;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.api-method {
  width: 64px;
  text-align: center;
  padding: 6px 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.method-GET { background-color: #4f6cf9; }
.method-POST { background-color: #10b981; }
.method-PUT { background-color: #f59e0b; }
.method-DELETE { background-color: #ef4444; }
.method-PATCH { background-color: #8b5cf6; }
.method-OPTIONS { background-color: #6b7280; }
.method-HEAD { background-color: #9ca3af; }

.api-info {
  flex: 1;
  min-width: 0;
}

.api-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.name-text {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.api-endpoint {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
  word-break: break-all;
  background: #f9fafb;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.api-meta {
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.api-meta b {
  color: #6b7280;
}

/* 右侧操作区 */
.api-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
  min-width: 180px;
}

.api-status {
  display: flex;
  gap: 6px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-buttons .el-button {
  padding: 4px 8px;
  font-size: 13px;
}

/* 分页 */
.api-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* ===== 日志样式 ===== */
.log-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.log-item:first-child {
  border-top: 1px solid #eee;
}

.log-method {
  width: 60px;
  text-align: center;
  padding: 4px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin-right: 12px;
  flex-shrink: 0;
}

.method-GET { background-color: #409EFF; }
.method-POST { background-color: #67C23A; }
.method-PUT { background-color: #E6A23C; }
.method-DELETE { background-color: #F56C6C; }

.log-info {
  flex: 1;
}

.log-url {
  color: #333;
  margin-bottom: 6px;
  word-break: break-all;
}

.log-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.no-logs {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

/* ========== 详情弹窗样式 ========== */
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
  white-space: pre;
}

.editable-example {
  flex: 1;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

/* ========== 响应式 ========== */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .api-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .api-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: auto;
  }
  
  .api-status {
    order: 2;
  }
  
  .action-buttons {
    order: 1;
  }
}

@media (max-width: 768px) {
  .card-row {
    grid-template-columns: 1fr;
  }
  
  .detail-layout {
    flex-direction: column;
  }
  
  .detail-right {
    width: 100%;
    border-left: none;
    padding-left: 0;
    margin-top: 20px;
  }
  
  .api-method {
    width: 56px;
    font-size: 11px;
  }
  
  .api-meta {
    gap: 8px;
    font-size: 11px;
  }
  
  .api-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-header .el-input {
    width: 100% !important;
  }
}
</style>