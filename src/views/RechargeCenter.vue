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

    <!-- 🔹 充值确认弹窗 -->
    <el-dialog
      v-model="showConfirmDialog"
      title="🔔 确认充值"
      width="360px"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="true"
    >
      <div class="confirm-content">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="充值套餐">
            {{ confirmInfo.packageName }}
          </el-descriptions-item>
          <el-descriptions-item label="获得额度">
            <span class="highlight-quota">{{ confirmInfo.quota }} 次</span>
          </el-descriptions-item>
          <el-descriptions-item label="支付金额">
            <span class="highlight-price">¥{{ confirmInfo.price }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ confirmInfo.paymentMethod }}
          </el-descriptions-item>
        </el-descriptions>
        
        <el-alert
          title="温馨提示"
          type="info"
          :closable="false"
          class="confirm-tip"
          show-icon
        >
          充值后额度实时到账，不支持退款，请确认支付
        </el-alert>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelRecharge">取消</el-button>
          <el-button type="primary" :loading="confirmLoading" @click="confirmRecharge">
            确认支付
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 🔹 支付结果弹窗 -->
    <el-dialog
      v-model="showResultDialog"
      title="✅ 充值成功"
      width="300px"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="result-content">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <p>已成功充值 <strong>{{ confirmInfo.quota }}</strong> 次调用额度！</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="onConfirmRecharge">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/store/index'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import { Check, CircleCheck } from '@element-plus/icons-vue'
import axios from "~/axios"
import { submitRecharge } from '../api/user'


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
const showConfirmDialog = ref(false)
const confirmLoading = ref(false)
const newTotalQuota = ref(0)
const confirmInfo = ref({})

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

// ✅ 用 computed 包装，确保响应式追踪（解决 usedQuota 显示为0的问题）
const usedQuota = computed(() => userStore.userInfo?.usedQuota ?? 0)

// ========== 方法 ==========
const selectPackage = (id) => {
  selectedPackageId.value = id
}

const formatNumber = (num) => {
  if (num == null) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 🔁 点击充值 → 显示确认弹窗
const handleRecharge = async () => {
  if (!selectedPackageId.value) {
    ElMessage.warning('请先选择充值套餐')
    return
  }
  
  confirmInfo.value = {
    packageName: selectedPackage.value.name,
    price: selectedPackage.value.price,
    quota: selectedPackage.value.quota,
    paymentMethod: {
      wechat: '微信支付',
      alipay: '支付宝', 
      unionpay: '银联支付'
    }[paymentMethod.value]
  }
  
  showConfirmDialog.value = true
}

// ✅ 确认执行充值
const confirmRecharge = async () => {
  if (confirmLoading.value) return  // 防重复点击
  
  confirmLoading.value = true
  
  try {
    // 🎭 模拟支付请求延迟（实际开发请替换为真实接口）
    // ✅ 只提交额度到后端
    const res = await submitRecharge(confirmInfo.value.quota)
    
    // if (!res.data?.success) {
    //   throw new Error(res.data?.error || '充值失败')
    // }
    
    ElMessage.success('充值成功！额度已到账')
    
    // 🎉 切换弹窗
    showConfirmDialog.value = false
    showResultDialog.value = true
    
  } catch (error) {
    console.error('充值异常:', error)
    ElMessage.error(error.response?.data?.error || error.message || '充值失败')
  } finally {
    confirmLoading.value = false
  }
}


const onConfirmRecharge = () => {
  // 1️⃣ 关闭弹窗
  showResultDialog.value = false
  
  // 2️⃣ 🔄 刷新页面（确保显示最新额度）
  // 延迟 200ms 确保弹窗关闭动画完成
  setTimeout(() => {
    window.location.reload()  // ✅ 刷新整个页面
  }, 200)
}


// ✅ 取消充值
const cancelRecharge = () => {
  showConfirmDialog.value = false
  ElMessage.info('已取消充值')
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

.quota-item:last-child {
  margin-bottom: 0;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
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

/* ========== 确认弹窗样式 ========== */
.confirm-content {
  padding: 8px 4px;
}

.highlight-quota {
  color: #409eff;
  font-weight: 600;
  font-size: 16px;
}

.highlight-price {
  color: #f56c6c;
  font-weight: 700;
  font-size: 18px;
}

.confirm-tip {
  margin-top: 16px;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* ========== 结果弹窗样式 ========== */
.result-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  color: #67c23a;
  font-size: 48px;
  margin-bottom: 16px;
}

.result-content p {
  margin: 8px 0;
  color: #606266;
  font-size: 15px;
}

.result-content p strong {
  color: #1f2937;
  font-weight: 600;
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
  
  .quota-value {
    font-size: 20px;
  }
}
</style>