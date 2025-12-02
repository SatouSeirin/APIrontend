<!-- src/components/FMenu.vue -->
<template>
  <el-menu
    :default-active="$route.path"        
    class="f-menu"
    background-color="#001529"
    text-color="#bfcbd9"
    active-text-color="#1890ff"
    :collapse="collapse"
    router                               
  >
    <div class="menu-logo">
      <span v-if="!collapse">甜蜜接口API</span>
      <span v-else>API</span>
    </div>

    <!-- 首页 -->
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>

    <!-- 工作空间（子菜单 index 必须是子路由之一） -->
    <el-sub-menu index="/workspace"> <!-- ✅ 改为完整路径 -->
      <template #title>
        <el-icon><Folder /></el-icon>
        <span>工作空间</span>
      </template>
      <el-menu-item index="/workspace/projects">项目管理</el-menu-item>
      <el-menu-item index="/workspace/teams">团队协作</el-menu-item>
    </el-sub-menu>

    <!-- API数据 -->
    <el-sub-menu index="/api"> <!-- ✅ 改为完整路径 -->
      <template #title>
        <el-icon><DataAnalysis /></el-icon>
        <span>API数据</span>
      </template>
      <el-menu-item index="/api/statistics">API统计</el-menu-item>
      <el-menu-item index="/api/hall">API前厅数据</el-menu-item>
      <el-menu-item index="/api/access">API总访问量</el-menu-item>
    </el-sub-menu>

    <!-- 其他菜单项 -->
    <el-menu-item index="/monitor">
      <el-icon><Monitor /></el-icon>
      <span>API监控</span>
    </el-menu-item>

    <el-menu-item index="/user"> <!-- ⚠️ 注意大小写（建议统一小写） -->
      <el-icon><User /></el-icon>
      <span>用户信息</span>
    </el-menu-item>

    <el-menu-item index="/settings">
      <el-icon><Setting /></el-icon>
      <span>系统设置</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { defineProps } from 'vue'
import {
  HomeFilled,
  Folder,
  DataAnalysis,
  Monitor,
  Setting,
  User
} from '@element-plus/icons-vue'

// ✅ 删除 activeMenu 计算属性和 useRouter
defineProps({
  collapse: Boolean
})
</script>

<style scoped>
.f-menu {
  border: none;
  height: 100%;
  overflow-y: auto;
}

.menu-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #002140;
}

.el-menu-item.is-active {
  background-color: #1890ff !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #000c17 !important;
}

:deep(.el-menu-item:hover) {
  background-color: #000c17 !important;
}
</style>