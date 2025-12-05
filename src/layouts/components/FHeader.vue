<!-- src/components/FHeader.vue -->
<template>
  <div class="f-header">
    
    <div class="header-left">
      <el-icon class="collapse-icon" @click="$emit('toggle-collapse')">
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>
      <span class="header-title">甜蜜接口API平台</span>
    </div>

    <!-- 右侧：用户信息（右上角） -->
    <div class="header-right">
      <el-dropdown @command="handleCommand" placement="bottom-end">
        <div class="user-info">
          <el-avatar :size="32" :src="userAvatar" />
          <span class="username">{{ userStore.userInfo.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="settings">系统设置</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '~/store/index'
import { useRouter } from 'vue-router'
import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { showModal, toast } from '../../composables/util'

const router = useRouter()
const userStore = useUserStore()


console.log(userStore.userInfo.username)

defineProps({
  isCollapse: Boolean
})


const userAvatar = ref('')


function logout(){
showModal("是否要推出登录？").then(res=>{
    // 1. 清除localStorage中的token
    localStorage.removeItem('admin-token');
    
    // 2. 清除Cookie中的token
    document.cookie = "admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    // 如果有多个cookie需要清除，可以继续添加
    
    // 3. 清除应用状态（如Pinia中的用户信息）
    userStore.CLEAR_USERINFO();

    // 5. 跳转到登录页
     router.push({ name: 'Login' });

    
    toast("退出成功","success");
    
})
}


const handleCommand = (command) => {
  switch (command) {
    case 'logout':
      logout()
      break
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
  }
}

</script>

<style scoped>
.f-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  width: 100%;  
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 16px;
  color: #666;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.username {
  margin: 0 8px;
  color: #333;
}
</style>