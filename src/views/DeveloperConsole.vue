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

      <!-- 主要内容区：左侧图表，右侧列表/操作 -->
      <div class="content-wrapper">
        <!-- 左侧图表区域 -->
        <div class="charts-section">
          <!-- 调用量趋势图 -->
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>调用量趋势</span>
                <el-select v-model="timeRange" placeholder="选择时间范围" size="small" @change="handleTimeRangeChange">
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

          <!-- API 列表 -->
          <el-card class="api-list-card">
            <template #header>
              <div class="card-header">
                <span>我的API列表</span>
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索接口名称..."
                  style="width: 200px;"
                  size="small"
                  clearable
                />
              </div>
            </template>
            <el-table :data="filteredApiList" style="width: 100%" v-loading="loadingApis">
              <el-table-column prop="name" label="接口名称" />
              <el-table-column prop="endpoint" label="接口路径" />
              <el-table-column prop="method" label="请求方法" width="100">
                <template #default="scope">
                  <el-tag :type="getMethodTagType(scope.row.method)">
                    {{ METHOD_MAP[scope.row.method] || 'GET' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status ? 'success' : 'info'">
                    {{ scope.row.status ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="callCount" label="调用次数" width="120" />
              <el-table-column prop="reviewStatus" label="审核状态" width="120">
                <template #default="scope">
                  <el-tag :type="getReviewStatusTagType(scope.row.reviewStatus)">
                    {{ getReviewStatusText(scope.row.reviewStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220">
                <template #default="scope">
                  <el-button size="small" type="primary" @click="viewDetails(scope.row)">查看</el-button>
                  <el-button size="small" type="primary" link @click="editApi(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" link @click="deleteApi(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              v-if="filteredApiList.length > 0"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[5, 10, 20]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredApiList.length"
              style="margin-top: 20px;"
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
import { getApisByUser, insertApi } from '../api/apis' // 导入新API
import { ElMessageBox, ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import AppHeader from '../components/AppHeader.vue'
import { Connection, TrendCharts, Money, Wallet, Plus, Document, SuccessFilled, CircleClose } from '@element-plus/icons-vue'

// --- Mock Data & State ---
const router = useRouter()

const overviewCards = ref([
  { label: '我的接口总数', value: 0, icon: Connection }, // 动态计算
  { label: '总调用次数', value: '0', icon: Document }, // 动态计算
  { label: '今日调用次数', value: '0', icon: TrendCharts }, // 模拟
  { label: '总收入额度', value: '¥0.00', icon: Money }, // 模拟
  { label: '接口成功率', value: '100%', icon: SuccessFilled }, // 模拟
])

const timeRange = ref('7d')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const loadingApis = ref(false)

// 将原来的数据源改为响应式ref，用于存储从API获取的数据
const apiList = ref([])

// 实时日志数据
const logs = ref([]);

// WebSocket 实例
let ws = null;

// 弹窗相关变量
const dialogVisible = ref(false);
const detail = ref({
  id: null,
  name: '',
  description: '',
  endpoint: '',
  method: '0', // 默认GET
  upstreamUrl: '',
  category: '',
  version: '',
  isPublic: false,
  rateLimit: 100,
  responseExample: '',
  curlExample: ''
})
const showExample = ref(false);
const exampleType = ref('request');
const currentExample = ref('');
const isEditing = ref(false); // 新增状态，区分查看和编辑

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

// --- Computed ---
const filteredApiList = computed(() => {
  const filtered = apiList.value.filter(api =>
    api.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    api.endpoint.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.slice(start, start + pageSize.value)
})

const dialogTitle = computed(() => {
  if (isEditing.value) {
    return detail.value.id ? '编辑 API' : '发布新 API';
  }
  return 'API 详情';
});

// 动态更新概览卡片数据
const updateOverviewCards = () => {
  const totalApis = apiList.value.length;
  const totalCalls = apiList.value.reduce((sum, api) => sum + (api.callCount || 0), 0);
  overviewCards.value[0].value = totalApis;
  overviewCards.value[1].value = totalCalls.toLocaleString();
};

// --- Methods ---
const handleTimeRangeChange = (value) => {
  console.log(`时间范围切换至: ${value}`)
  // TODO: 根据新的时间范围重新请求图表数据
}

const publishNewApi = () => {
  // 初始化一个空的 API 对象用于新增
  detail.value = {
    id: null, // 新建时没有ID
    name: '',
    endpoint: '',
    method: '0', // 默认GET
    description: '',
    upstreamUrl: '',
    category: '',
    version: 'v1.0',
    isPublic: false,
    rateLimit: 0,
    status: false, // 新建的API默认为非活跃状态
    reviewStatus: 0, // 新建的API默认为待审核
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'current_user_id', // 模拟当前用户ID
    callCount: 0,
    curlExample: '',
    responseExample: '{}'
  };
  isEditing.value = true;
  dialogVisible.value = true;
}

const viewDetails = (row) => {
  detail.value = { ...row };
  isEditing.value = false;
  showExample.value = false; // 打开详情时不显示示例
  dialogVisible.value = true;
}

const editApi = (row) => {
  detail.value = { ...row };
  isEditing.value = true;
  showExample.value = false; // 打开编辑时不显示示例
  dialogVisible.value = true;
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
  .then(() => {
    const index = apiList.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      apiList.value.splice(index, 1);
      updateOverviewCards(); // 删除后更新概览数据
      // 如果删除的是当前正在查看的详情，则关闭弹窗
      if (detail.value.id === row.id && dialogVisible.value) {
        dialogVisible.value = false;
      }
      ElMessage.success('删除成功');
    }
  })
  .catch(() => {
    ElMessage.info('已取消删除');
  });
};

const submitChanges = () => {
  // 表单验证
  if (!detail.value.name?.trim()) {
    ElMessage.error('接口名称不能为空');
    return;
  }
  if (!detail.value.endpoint?.trim()) {
    ElMessage.error('请求路径不能为空');
    return;
  }
  if (!detail.value.method) {
    ElMessage.error('请求方法不能为空');
    return;
  }
  if (!detail.value.upstreamUrl?.trim()) {
    ElMessage.error('后端地址不能为空');
    return;
  }
  if (!detail.value.category?.trim()) {
    ElMessage.error('分类不能为空');
    return;
  }
  if (!detail.value.version?.trim()) {
    ElMessage.error('版本不能为空');
    return;
  }

  // 验证通过后，再弹出二次确认框
  ElMessageBox.confirm(
    `${detail.value.id ? '修改' : '创建'}一个API后，将进入审核流程，期间接口不可用。`,
    '确认提交',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  .then(async () => {
    try {
      if (!detail.value.id) {
        // --- 创建新API ---
        // 1. 调用后端API
        await insertApi(detail.value);
        
        // 2. 成功后更新本地UI状态
        // 后端会自动分配ID，这里为了UI即时反馈，可以临时使用一个负数ID，直到页面刷新
        // 为了简单起见，我们直接刷新整个列表
        ElMessage.success('创建成功，已提交审核。');
        
        // 3. 刷新API列表以显示新项
   try {
    const response = await getApisByUser();
    apiList.value = response.data.data || [];
  } catch (error) {
    // 即使刷新列表失败，也提示用户创建成功了
    console.error('刷新列表失败:', error);
    // 可以选择性地提示用户刷新页面
  }

      } else {
        // --- 编辑现有API的逻辑 ---
        // 这里是您之前模拟编辑逻辑的地方
        // 由于您没有提供后端编辑接口，我们暂时保留模拟逻辑
        const index = apiList.value.findIndex(api => api.id === detail.value.id);
        if (index !== -1) {
          // 假设编辑后也进入审核流程
          apiList.value[index] = { ...detail.value, reviewStatus: 0, updatedAt: new Date().toISOString() };
          detail.value.reviewStatus = 0; // 更新当前详情页的审查状态
        }
        ElMessage.success('修改成功，已提交审核。');
      }

      dialogVisible.value = false;
      isEditing.value = false;
      updateOverviewCards(); // 提交后更新概览数据
    } catch (error) {
      console.error('提交API失败:', error);
      // 尝试从响应中获取后端返回的具体错误信息
      const errorMessage = error.response?.data?.message || error.message || '提交失败，请稍后重试';
      ElMessage.error(errorMessage);
    }
  })
  .catch(() => {
    ElMessage.info('已取消提交');
  });
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

const getMethodTagType = (method) => {
  const methodStr = METHOD_MAP[method] || 'GET';
  switch (methodStr) {
    case 'GET': return 'success';
    case 'POST': return 'warning';
    case 'PUT': return 'primary';
    case 'DELETE': return 'danger';
    default: return 'info';
  }
}

const getTagType = (status) => {
  return status === 'active' ? 'success' : 'danger';
}

const getReviewStatusTagType = (status) => {
  if(status === 0) return 'warning'; // 待审核 -> 黄色
  if(status === 1) return 'success'; // 已通过 -> 绿色
  if(status === 2) return 'danger';  // 已拒绝 -> 红色
  return 'info'; // 未知状态 -> 灰色
};

const getReviewStatusText = (status) => {
  if(status === 0) return '审核中';
  if(status === 1) return '审核通过';
  if(status === 2) return '审核失败';
  return '未知';
};

const showRequestExample = () => {
  exampleType.value = 'request';
  // 从 detail 中获取 curlExample
  currentExample.value = detail.value.curlExample || `curl -X ${METHOD_MAP[detail.value.method] || 'GET'} "${detail.value.endpoint || ''}"`;
  showExample.value = true;
}

const showResponseExample = () => {
  exampleType.value = 'response';
  // 从 detail 中获取 responseExample
  let responseStr = detail.value.responseExample;
  if (!responseStr) {
    responseStr = '{}';
  } else if (typeof responseStr === 'object') {
    responseStr = JSON.stringify(responseStr, null, 2);
  }
  currentExample.value = responseStr;
  showExample.value = true;
}

const copyExample = () => {
  navigator.clipboard.writeText(currentExample.value).then(() => {
    ElMessage.success('已复制到剪贴板');
  }).catch(err => {
    ElMessage.error('复制失败');
    console.error('复制失败:', err);
  });
}

// --- Data Fetching ---
const fetchData = async () => {
  loadingApis.value = true;
  try {
    const res = await getApisByUser(); // 调用新API
    apiList.value = res.data || []; // 直接赋值，不再需要转换
    updateOverviewCards(); // 获取数据后更新概览
  } catch (error) {
    console.error('加载 API 列表失败', error);
    ElMessage.error('加载 API 列表失败');
    apiList.value = [];
  } finally {
    loadingApis.value = false;
  }
};

// --- Charts Initialization ---
let callsTrendChart = null;
let distributionChart = null;

onMounted(() => {
  fetchData(); // 组件挂载时加载数据

  const trendDom = document.getElementById('calls-trend-chart');
  if (trendDom) {
    callsTrendChart = echarts.init(trendDom);
    const trendOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['总调用数'] },
      xAxis: { type: 'category', boundaryGap: false, data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value' },
      series: [{ name: '总调用数', type: 'line', stack: '总量', data: [1200, 1320, 1010, 1340, 900, 2300, 2100] }]
    };
    callsTrendChart.setOption(trendOption);
  }

  const distDom = document.getElementById('api-distribution-chart');
  if (distDom) {
    distributionChart = echarts.init(distDom);
    const distOption = {
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'right' },
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
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
          data: [
            { value: 1048, name: '用户信息查询' },
            { value: 735, name: '支付回调' },
            { value: 580, name: '天气预报' },
            { value: 484, name: '发送短信' },
            { value: 300, name: '获取验证码' }
          ]
        }
      ]
    };
    distributionChart.setOption(distOption);
  }

  connectWebSocket();
});

const connectWebSocket = () => {
  const wsUrl = 'ws://localhost:8081/ws/logs';
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket连接已建立');
  };

  ws.onmessage = (event) => {
    try {
      const newLog = JSON.parse(event.data);
      logs.value.unshift(newLog);
      if (logs.value.length > 50) {
        logs.value = logs.value.slice(0, 50);
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket发生错误:', error);
  };

  ws.onclose = (event) => {
    console.log('WebSocket连接已关闭，代码:', event.code, '原因:', event.reason);
    setTimeout(connectWebSocket, 3000);
  };
};

onUnmounted(() => {
  if (callsTrendChart) {
    callsTrendChart.dispose();
  }
  if (distributionChart) {
    distributionChart.dispose();
  }
  if (ws) {
    ws.close();
  }
});
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
  text-align: center; /* 让按钮居中 */
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

.code {
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
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
@media (max-width: 768px) {
  .content-wrapper {
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
}
</style>