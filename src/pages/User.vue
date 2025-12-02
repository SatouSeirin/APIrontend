<template>
  <div class="dashboard-subpage">
    <!-- 数据卡片行（4个横向排列） -->
    <div class="card-row">
      <el-card class="stat-card" v-for="(item, index) in stats" :key="index">
        <div class="card-header">
          <span>{{ item.label }}</span>
          <!-- ⬆️ 图标拉大到 36px -->
          <el-icon :size="36" style="color: #999;">
            <component :is="item.icon" />
          </el-icon>
        </div>
        <div class="card-value">{{ item.value }}</div>
      </el-card>
    </div>

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

    <!-- 底部左右布局 -->
    <div class="bottom-section">
      <!-- 左侧：动态信息栏 -->
      <div class="left-panel">
        <el-card>
          <div class="activity-header">日志</div>
          <div class="activity-content">
            <el-icon :size="28" style="color: #e74c3c; margin-right: 10px;">
              <Bell />
            </el-icon>
            <span>暂无日志</span>
          </div>
        </el-card>
      </div>



    </div>
  </div>
</template>

<script setup>
import { onMounted, ref ,computed } from 'vue';
import { Key, Bell, Coin,Document } from '@element-plus/icons-vue'
import { useUserStore } from '~/store/index'

const userStore = useUserStore()
const chartRef = ref(null);

// 数据卡片（4个）
// 使用计算属性动态构建 stats 数组
const stats = computed(() => [
  { 
    label: '剩余调用API额度', 
    value: userStore.userInfo.totalQuota ?? 'N/A', // 请根据您的 userInfo 实际结构替换字段名
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
           userStore.userInfo?.status === 0 ? '禁用' : 'N/A',// 使用store中的getter
    icon: 'Truck' 
  }
  // 您可以添加更多卡片...
]);


</script>

<style scoped>
/* ✅ 关键：去掉滚动条 */
.dashboard-subpage {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
  overflow: hidden; /* ⬅️ 隐藏滚动条 */
}

/* 确保卡片容器本身是Flex布局并支持换行，同时整体居中 */
.card-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* 这会使一行中的卡片组整体居中 */
  gap: 10px; /* 设置卡片之间的间距 */
}

/* 设置每个卡片的固定宽度 */
.stat-card {
    flex: 1;
   min-width: 200px /* 或者您喜欢的任何宽度 */
}

/* 卡片头部样式：标签和图标分居两侧，垂直居中 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* 卡片数值显示样式 */
.card-value {
  text-align: center;
  font-size: 2em;
  font-weight: bold;
  color: #409EFF; /* 可以设置一个主题色 */
}

.chart-section {
  margin-bottom: 20px;
}

.chart-container {
  height: 280px;
  width: 100%;
}

.bottom-section {
  display: flex;
  gap: 20px;
    padding: 5px;
}

.left-panel {
  flex: 1;
}

.right-panel {
  width: 300px;
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

.sidebar-item {
  margin-bottom: 20px;
}

.sidebar-item h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.sidebar-item p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.update-time {
  font-size: 12px;
  color: #999;
  float: right;
}

.quote {
  font-style: italic;
  color: #555;
  line-height: 1.8;
}
</style>