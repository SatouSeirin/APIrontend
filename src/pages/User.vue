<template>
  <div class="dashboard-subpage">
    <!-- 数据卡片行（4个横向排列） -->
    <div class="card-row">
      <el-card class="stat-card" v-for="(item, index) in stats" :key="index">
        <div class="card-header">
          <span>{{ item.label }}</span>
          <el-icon :size="36" style="color: #999;">
            <component :is="item.icon" />
          </el-icon>
        </div>
        <div class="card-value">{{ item.value }}</div>
      </el-card>
    </div>

    <!-- API密钥卡片 -->
    <div class="bottom-section">
      <div class="left-panel">
        <el-card>
          <div class="activity-header">API密钥</div>
          <div class="activity-content">
            <el-icon :size="28" style="color: #e74c3c; margin-right: 10px;">
              <Key />
            </el-icon>
            <span>你的API密钥：</span>
            <span>{{ userStore.userInfo.apiKey }}</span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 日志卡片 -->
<!-- 在 "底部左右布局" 区域 -->
<div class="bottom-section">
  <div class="left-panel">
    <el-card>
      <div class="activity-header">API 调用日志</div>
      
      <!-- 加载中 -->
      <div v-if="loading" class="log-loading">
        <el-icon :size="20"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 无日志 -->
      <div v-else-if="logs.length === 0" class="activity-content">
        <el-icon :size="28" style="color: #999; margin-right: 10px;">
          <Bell />
        </el-icon>
        <span>暂无调用记录</span>
      </div>

      <!-- 有日志 -->
      <div v-else>
        <div 
          v-for="log in logs" 
          :key="log.id"
          class="log-item"
        >
          <div class="log-method" :class="`method-${log.requestMethod}`">
            {{ log.requestMethod }}
          </div>
          <div class="log-info">
            <div class="log-url">{{ log.requestUrl }}</div>
            <div class="log-meta">
              <span>状态: <b>{{ log.responseStatus }}</b></span>
              <span>耗时: {{ log.latency }}ms</span>
              <span>IP: {{ log.ipAddress }}</span>
              <span>{{ formatDate(log.createdAt) }}</span>
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
    </el-card>
  </div>
</div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { Key, Bell, Coin, Document, Loading } from '@element-plus/icons-vue';
import { useUserStore } from '~/store/index';
import { getApiLogs } from '~/api/apis'; // ← 使用你的封装
import axios from "~/axios"; // 确保这是标准 axios 实例
const userStore = useUserStore();

// ============= 日志相关 =============
const logs = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 分页方法（无默认值！）
// const fetchLogs = async (page) => {
// console.log("📥 发送页码到后端:", page - 1); // 点击第2页时应输出 1

//   loading.value = true;
//   try {
//     const res = await getApiLogs({
//       params: {
//         page: page - 1, // 转为 0-based
//         size: pageSize.value
//       }
//     });
//     logs.value = res.data.logs || [];
//     total.value = res.data.total || 0;
//   } catch (error) {
//     console.error('加载日志失败:', error);
//     logs.value = [];
//   } finally {
//     loading.value = false;
//   }
// };

const fetchLogs = async (page) => {
  const res = await getApiLogs({
    page: page - 1,      // 0-based
    size: pageSize.value
  });
  logs.value = res.data.logs;
  total.value = res.data.total;
};

// ============= 工具函数 =============
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============= 原有 stats =============
const stats = computed(() => [
  { 
    label: '剩余调用API额度', 
    value: userStore.userInfo.totalQuota ?? 'N/A',
    icon: Coin
  },
  { 
    label: '总调用API次数', 
    value: userStore.userInfo?.usedQuota ?? 'N/A', 
    icon: Document
  },
  { 
    label: '用户权限', 
    value: userStore.userInfo?.role === 0 ? '用户' : 
           userStore.userInfo?.role === 1 ? '管理员' : 'N/A',
    icon: 'Truck' 
  },
  { 
    label: '账户状态', 
    value: userStore.userInfo?.status === 1 ? '正常' :
           userStore.userInfo?.status === 0 ? '禁用' : 'N/A',
    icon: 'Truck' 
  }
]);

// ============= 生命周期 =============
// 初始加载
onMounted(() => {
  fetchLogs(1); // ← 明确传第一页
});
</script>

<style scoped>
/* ===== 日志样式 ===== */
.log-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #999;
}

.log-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.log-item:last-child {
  border-bottom: none;
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
}

.method-GET { background-color: #409EFF; }
.method-POST { background-color: #67C23A; }
.method-PUT { background-color: #E6A23C; }
.method-DELETE { background-color: #F56C6C; }

.log-info {
  flex: 1;
}

.log-url {
  font-size: 14px;
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

.log-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

/* ===== 保留原有样式 ===== */
.dashboard-subpage {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
  overflow: hidden;
}

.card-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.stat-card {
  flex: 1;
  min-width: 200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-value {
  text-align: center;
  font-size: 2em;
  font-weight: bold;
  color: #409EFF;
}

.bottom-section {
  display: flex;
  gap: 20px;
  padding: 5px;
}

.left-panel {
  flex: 1;
}

.activity-header {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.activity-content {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}
</style>