<template>
  <div class="home-page">
    <!-- 顶部轮播广告 -->
    <el-carousel
      height="240px"
      :autoplay="true"
      :interval="5000"
      indicator-position="none"
      class="banner"
    >
      <el-carousel-item v-for="(item, index) in banners" :key="index">
        <img :src="item.image" :alt="item.title" class="banner-img" />
        <div class="banner-overlay">
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- API 卡片区域 -->
    <div class="api-cards-container">
      <h1 class="section-title">可用 API 接口</h1>
      <div class="api-cards">
        <div
          v-for="api in apiList"
          :key="api.id"
          class="api-card"
          @click="openDetail(api)"
        >
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
            <span class="version">{{ api.version }}</span>
          </div>
        </div>

        <div v-if="apiList.length === 0 && !loading" class="empty-state">
          暂无可用 API
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
      <div class="detail-layout" v-if="detail.id">
        <!-- 左侧：基本信息 -->
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
              <label>后端地址</label>
              <span class="code">{{ detail.backendUrl }}</span>
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

        <!-- 右侧：示例区域 -->
        <div class="detail-right" v-if="showExample">
          <div class="response-header">
            <h4>{{ exampleType === 'request' ? 'Curl 请求示例' : '返回示例' }}</h4>
            <el-button size="small" @click="copyExample">
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
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import { getAllApis } from '../api/apis';

// ===== 状态定义 =====
const apiList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const detail = ref({});
const showExample = ref(false);
const exampleType = ref('response'); // 'request' | 'response'

// ===== 方法映射 =====
const METHOD_MAP = {
  '0': 'GET',
  '1': 'POST',
  '2': 'PUT',
  '3': 'DELETE',
  '4': 'PATCH',
  '5': 'OPTIONS',
  '6': 'HEAD'
};

// ===== 数据转换函数 =====
const transformApi = (raw) => {
  return {
    id: raw.id,
    apiIdentifier: String(raw.id),
    apiName: raw.name,
    description: raw.description,
    breakpointPath: raw.endpoint,
    method: METHOD_MAP[raw.method] || 'GET',
    backendUrl: raw.upstreamUrl,
    apiCategory: raw.category || '未分类',
    version: raw.version,
    isPublic: raw.isPublic,
    rateLimit: raw.rateLimit ? `${raw.rateLimit}/分钟` : '无限制',
    status: raw.status ? 'active' : 'inactive',
    createTime: raw.createdAt,
    updateTime: raw.updatedAt,
    creatorId: raw.createdBy,
    // 👇 直接使用后端存储的完整 curl 命令字符串
    curlExample: raw.curlExample || '',
    // 返回示例
    responseExample: raw.responseExample || '{}'
  };
};

// ===== 获取 API 列表 =====
const fetchApiList = async () => {
  loading.value = true;
  try {
    const res = await getAllApis();
    console.log(res);
    const rawApis = res.data || [];
    apiList.value = rawApis.map(transformApi);
  } catch (error) {
    console.error('加载 API 列表失败', error);
    apiList.value = [];
  } finally {
    loading.value = false;
  }
};

// ===== 打开详情弹窗 =====
const openDetail = (api) => {
  detail.value = { ...api };
  dialogVisible.value = true;
  showExample.value = false; // 初始隐藏示例区域
};

// ===== 当前显示的示例内容 =====
const currentExample = computed(() => {
  if (exampleType.value === 'request') {
    return detail.value.curlExample || '# 未提供 Curl 请求示例';
  } else {
    const example = detail.value.responseExample;
    if (!example) return '{}';
    try {
      const obj = typeof example === 'string' ? JSON.parse(example) : example;
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return String(example);
    }
  }
});

// ===== 按钮事件 =====
const showRequestExample = () => {
  exampleType.value = 'request';
  showExample.value = true;
};

const showResponseExample = () => {
  exampleType.value = 'response';
  showExample.value = true;
};

const copyExample = async () => {
  await navigator.clipboard.writeText(currentExample.value);
  ElMessage.success('已复制到剪贴板');
};

// ===== 工具函数 =====
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '—';
};

const getTagType = (status) => {
  return status === 'active' ? 'success' : 'danger';
};

const getMethodTagType = (method) => {
  const map = {
    GET: 'success',
    POST: 'warning',
    PUT: 'primary',
    DELETE: 'danger'
  };
  return map[method] || 'info';
};

// ===== 轮播图数据 =====
const banners = ref([
  {
    image: 'https://youke1.picui.cn/s1/2025/12/03/693050209b946.jpg',
    title: '全新 API 开放平台上线',
    description: '高效、稳定、安全的 API 服务，助力开发者快速集成'
  },
  {
    image: 'https://youke1.picui.cn/s1/2025/12/03/693050225ebd9.png',
    title: '新用户享 10,000 次免费调用',
    description: '立即注册，体验高性能 API 服务'
  }
]);

// ===== 初始化 =====
fetchApiList();
</script>

<style scoped>
.home-page {
  background-color: #f9fafb;
  min-height: 100vh;
}

/* 轮播图 */
.banner {
  position: relative;
  margin-bottom: 40px;
}
.banner-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}
.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
  padding: 20px;
  box-sizing: border-box;
}
.banner-overlay h2 {
  margin: 0 0 8px;
  font-size: 24px;
}
.banner-overlay p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

/* API 卡片区 */
.section-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 32px;
  color: #1f2f3d;
}

.api-cards-container {
  padding: 0 20px 40px;
}

.api-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.api-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.api-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.api-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2f3d;
  margin: 0;
  flex: 1;
  word-break: break-word;
}

.api-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
  margin: 8px 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-size: 13px;
  color: #909399;
}

.empty-state {
  text-align: center;
  color: #909399;
  grid-column: 1 / -1;
}

/* 弹窗详情 */
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
</style>