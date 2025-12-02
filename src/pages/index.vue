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
            <span class="version">v{{ api.version }}</span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="apiList.length === 0 && !loading" class="empty-state">
          暂无可用 API
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="detail.apiName || 'API 详情'"
      width="520px"
      append-to-body
      class="api-detail-dialog"
    >
      <div class="detail-content" v-if="detail.id">
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
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { getAllApis } from '../api/apis';

// ===== API 列表状态 =====
const apiList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const detail = ref({});

const METHOD_MAP = {
  '0': 'GET',
  '1': 'POST',
  '2': 'PUT',
  '3': 'DELETE',
  '4': 'PATCH',
  '5': 'OPTIONS',
  '6': 'HEAD'
};

const transformApi = (raw) => {
  return {
    id: raw.id,
    apiIdentifier: String(raw.id),
    apiName: raw.name,
    description: raw.description,
    breakpointPath: raw.endpoint,
    method: METHOD_MAP[raw.method] || 'GET', // 将 "0" → "GET"
    backendUrl: raw.upstreamUrl,              // upstreamUrl → backendUrl
    apiCategory: raw.category || '未分类',
    version: raw.version,
    isPublic: raw.isPublic,                   // 已是 boolean，直接用
    rateLimit: `${raw.rateLimit}/分钟`,       // 1 → "1/分钟"
    status: raw.status ? 'active' : 'inactive', // true → 'active'
    createTime: raw.createdAt,                // createdAt → createTime
    updateTime: raw.updatedAt,
    creatorId: raw.createdBy
  };
};


const fetchApiList = async () => {
  loading.value = true;
  try {
    const res = await getAllApis();

    // res.data 是 { success, message, data: [...] }
    const rawApis = res.data || [];
    //console.log('原始数据:', res.data);
    apiList.value = rawApis.map(transformApi);
    //console.log('转换后的数据:', apiList.value); // 临时加日志确认
  } catch (error) {
    console.error('加载 API 列表失败', error);
    apiList.value = [];
  } finally {
    loading.value = false;
  }
};

// 详情也做同样转换（如果你有详情接口）
const openDetail = async (api) => {
  try {
    // 如果你有详情接口，比如 /api/apis/1
    // const res = await getApiDetail(api.id);
    // detail.value = transformApi(res.data.data);

    // 如果没有详情接口，直接用列表中的数据
    detail.value = { ...api };
    dialogVisible.value = true;
  } catch (error) {
    console.error('加载详情失败', error);
  }
};

// ===== 轮播广告数据（使用有效图片）=====
const banners = ref([
  {
    image: 'https://picsum.photos/1200/240?random=1',
    title: '全新 API 开放平台上线',
    description: '高效、稳定、安全的 API 服务，助力开发者快速集成'
  },
  {
    image: 'https://picsum.photos/1200/240?random=2',
    title: '新用户享 10,000 次免费调用',
    description: '立即注册，体验高性能 API 服务'
  }
]);




// 工具函数
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

onMounted(() => {
  fetchApiList();
});
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
  justify-items: center;
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
</style>