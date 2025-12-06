<template>
  <div class="recharge-page">
    <!-- 顶部导航 -->
    <AppHeader />

    <!-- 主内容区 -->
    <div class="container">
      <h1 class="section-title">API 调用额度充值</h1>

      <!-- 额度概览卡片 -->
      <el-card class="quota-card">
        <div class="quota-item">
          <div class="quota-label">剩余调用额度</div>
          <div class="quota-value">{{ formatNumber(userStore.userInfo.totalQuota) }} 次</div>
        </div>
        <div class="quota-item">
          <div class="quota-label">历史总调用</div>
          <div class="quota-value">{{ formatNumber(userStore.userInfo.usedQuota) }} 次</div>
        </div>
      </el-card>

      <!-- 充值套餐 -->
      <div class="package-section">
        <h2 class="section-subtitle">选择充值套餐</h2>
        <div class="package-cards">
          <el-card
            v-for="pkg in packages"
            :key="pkg.id"
            class="package-card"
            :class="{ 'selected': selectedPackageId === pkg.id }"
            @click="selectPackage(pkg.id)"
          >
            <div class="package-header">
              <div class="package-name">{{ pkg.name }}</div>
              <el-icon v-if="selectedPackageId === pkg.id" class="check-icon">
                <Check />
              </el-icon>
            </div>
            <div class="package-price">{{ pkg.price }}<span class="unit">元</span></div>
            <div class="package-quota">{{ pkg.quota }} 次调用</div>
            <div class="package-desc">{{ pkg.description }}</div>
          </el-card>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-section">
        <h2 class="section-subtitle">选择支付方式</h2>
        <div class="payment-methods">
          <el-radio-group v-model="paymentMethod" size="large">
            <el-radio-button label="wechat">微信支付</el-radio-button>
            <el-radio-button label="alipay">支付宝</el-radio-button>
            <el-radio-button label="unionpay">银联支付</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 充值按钮 -->
      <div class="action-section">
        <el-button
          type="primary"
          size="large"
          :disabled="!selectedPackageId"
          @click="handleRecharge"
        >
          立即充值 {{ selectedPackagePrice }} 元
        </el-button>
      </div>
    </div>

    <!-- 支付结果弹窗 -->
    <el-dialog
      v-model="showResultDialog"
      title="充值成功"
      width="300px"
      center
    >
      <div class="result-content">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <p>已成功充值 {{ selectedPackageQuota }} 次调用额度！</p>
        <p>当前剩余额度：{{ newTotalQuota }} 次</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="showResultDialog = false">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '~/store/index'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import { Check, CircleCheck } from '@element-plus/icons-vue'

const userStore = useUserStore()

// ========== 充值套餐 ==========
const packages = ref([
  { id: 1, name: '基础包', price: 10, quota: 100, description: '适合个人开发者' },
  { id: 2, name: '标准包', price: 50, quota: 500, description: '性价比最高' },
  { id: 3, name: '高级包', price: 100, quota: 1000, description: '推荐企业使用' },
  { id: 4, name: '尊享包', price: 200, quota: 2000, description: '无限畅用' }
])

// ========== 状态 ==========
const selectedPackageId = ref(null)
const paymentMethod = ref('wechat')
const showResultDialog = ref(false)
const newTotalQuota = ref(0)

// ========== 计算属性 ==========
const selectedPackage = computed(() => {
  return packages.value.find(p => p.id === selectedPackageId.value)
})

const selectedPackagePrice = computed(() => {
  return selectedPackage.value ? selectedPackage.value.price : 0
})

const selectedPackageQuota = computed(() => {
  return selectedPackage.value ? selectedPackage.value.quota : 0
})

// ========== 方法 ==========
const selectPackage = (id) => {
  selectedPackageId.value = id
}

const formatNumber = (num) => {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'
}

const handleRecharge = async () => {
  if (!selectedPackageId.value) {
    ElMessage.warning('请先选择充值套餐')
    return
  }

  // 模拟支付成功
  ElMessage.success('支付成功！额度已充值')

  // 更新额度（模拟）
  const oldQuota = userStore.userInfo.totalQuota || 0
  newTotalQuota.value = oldQuota + selectedPackageQuota.value

  // 更新 Store（实际应调用 API）
  userStore.userInfo.totalQuota = newTotalQuota.value

  // 显示结果弹窗
  showResultDialog.value = true
}
</script>

<style scoped>
/* ========== 整体页面 ========== */
.recharge-page {
  background: #ffffff;
  min-height: 100vh;
  padding-top: 60px;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.section-title {
  text-align: center;
  font-size: 28px;
  margin: 40px 0 32px;
  color: #1f2937;
  font-weight: 800;
}

.section-subtitle {
  font-size: 20px;
  margin: 30px 0 20px;
  color: #374151;
  font-weight: 600;
}

/* ========== 额度卡片 ========== */
.quota-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 40px;
}

.quota-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.quota-label {
  opacity: 0.9;
  font-size: 16px;
}

.quota-value {
  font-size: 24px;
  font-weight: 700;
}

/* ========== 套餐卡片 ========== */
.package-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.package-card {
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.package-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.package-card.selected {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.package-name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.check-icon {
  color: #409eff;
  font-size: 20px;
}

.package-price {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 8px;
}

.package-price .unit {
  font-size: 16px;
  color: #6b7280;
}

.package-quota {
  color: #409eff;
  font-weight: 600;
  margin-bottom: 12px;
}

.package-desc {
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.5;
}

/* ========== 支付方式 ========== */
.payment-methods {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

/* ========== 操作区 ========== */
.action-section {
  text-align: center;
  margin-top: 40px;
}

/* ========== 结果弹窗 ========== */
.result-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  color: #67c23a;
  font-size: 48px;
  margin-bottom: 16px;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .package-cards {
    grid-template-columns: 1fr;
  }

  .payment-methods {
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>