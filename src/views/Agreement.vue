<!-- src/views/Agreement.vue -->
<template>
  <div class="agreement-page">
    <!-- 顶部导航 -->
    <AppHeader />
    
    <!-- 主内容区 -->
    <div class="container">
      <h1 class="section-title">用户协议</h1>
      <div class="agreement-content">
        <p>{{ agreementText }}</p>
      </div>
      <div class="agreement-actions">
        <el-checkbox v-model="agree">我已阅读并同意上述协议条款。</el-checkbox>
        <el-button type="primary" @click="becomeDeveloper" :disabled="!agree" size="large">成为开发者</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/store/index'
import { toast } from '../composables/util'
import AppHeader from '../components/AppHeader.vue'
import { userinfo, applyToBeDeveloper } from '../api/user' // 根据您实际存放 api 的路径调整

const router = useRouter()
const userStore = useUserStore()

const agree = ref(false)
const agreementText = `
    【开发者服务协议】

    欢迎您使用我们的API开放平台（以下简称“平台”）提供的开发者服务。请您在注册成为开发者前，仔细阅读并充分理解本协议的各项条款。特别是免除或者限制责任的条款、争议解决和法律适用等，此类条款将以粗体标识。一旦您选择“同意”并完成注册，即表示您已完全接受本协议的全部条款，并承诺遵守。

    1. **服务内容**
       1.1 平台为开发者提供API接口的发布、管理和调用服务。
       1.2 平台为开发者提供API密钥（API Key）以进行身份验证和访问控制。
       1.3 平台提供开发者后台，用于管理接口、查看调用日志和收益等。

    2. **账户注册与管理**
       2.1 开发者必须是合法的自然人或法人实体。
       2.2 开发者需提供真实、准确、完整的个人信息，并及时更新。
       2.3 开发者应妥善保管其账户及密码，并对以其账户进行的所有活动承担责任。

    3. **接口发布与规范**
       3.1 开发者发布的接口必须遵守国家法律法规，不得包含任何违法不良信息。
       3.2 接口应具备良好的可用性、稳定性和安全性。
       3.3 接口返回的数据格式应规范、易于理解。
       3.4 平台保留对接口进行审核的权利，对于不符合规范的接口，有权要求修改或拒绝上线。

    4. **收益与结算**
       4.1 开发者可通过其接口被调用获得相应的收益。
       4.2 平台的收益计算和结算规则以平台公示为准。
       4.3 开发者同意并授权平台在达到结算条件时，将收益支付到其指定的账户。

    5. **知识产权**
       5.1 开发者保证其发布的接口及相关内容不侵犯任何第三方的知识产权。
       5.2 平台对接口的推广和运营不构成对接口内容所有权的转移。

    6. **责任与豁免**
       6.1 开发者对其发布的接口内容负全部责任。
       6.2 平台不保证接口的绝对稳定，但会尽力维护平台的正常运行。
       6.3 因不可抗力因素导致的服务中断，平台不承担违约责任。

    7. **协议变更**
       7.1 平台有权根据运营情况修改本协议。协议修改后，平台将以适当方式通知开发者。若开发者继续使用服务，视为同意修订后的协议。

    8. **争议解决**
       8.1 因本协议引起的争议，双方应友好协商解决；协商不成的，任何一方均可向平台所在地人民法院提起诉讼。

    9. **生效**
       9.1 本协议自您点击“同意”并完成注册之时起生效。
`

const becomeDeveloper = async () => {
  if (!agree.value) {
    toast('请先阅读并同意协议', 'warning');
    return;
  }

try {
    // 1. 调用后端 API 来更新用户角色
    const response = await applyToBeDeveloper();

    // 2. 解析响应
    const result = response;

    if (result.success) { // 检查 success 字段是否为 true
      // 更新成功
      
      // 3. 直接更新本地 Store 中的用户角色
      // 因为后端已成功更新，我们可以安全地更新本地状态
      userStore.userInfo.role = 1; 

      toast(result.message || '恭喜您，已成为开发者！', 'success');
      
      router.push('/developer-console');
    } else {
      // API 返回错误 (success 为 false)
      toast(result.message || '申请失败', 'error');
    }
    
  } catch (error) {
    console.error('Failed to update user role:', error);
    toast('网络错误或服务器繁忙，请稍后再试', 'error');
  }
};
      


</script>

<style scoped>
.agreement-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
}

.agreement-content {
  background: white;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
  margin-bottom: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.agreement-content p {
  line-height: 1.8;
  color: #606266;
}

.agreement-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.el-checkbox {
  margin-bottom: 16px;
}
</style>