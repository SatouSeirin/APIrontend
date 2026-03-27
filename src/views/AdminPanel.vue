<!-- src/views/AdminPanel.vue -->
<template>
  <div class="admin-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <div class="sidebar-logo">管理系统</div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :unique-opened="true"
        :collapse-transition="false"
        router
      >
        <el-sub-menu index="user-management">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users/list">用户列表</el-menu-item>
          <el-menu-item index="/admin/users/roles">角色管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="api-management">
          <template #title>
            <el-icon><Connection /></el-icon>
            <span>API管理</span>
          </template>
          <el-menu-item index="/admin/apis/list">接口列表</el-menu-item>
          <el-menu-item index="/admin/apis/approval">待审批</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/system-config">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
        </el-menu-item>

        <el-menu-item index="/admin/dashboard">
          <template #title>
            <el-icon><Monitor /></el-icon>
            <span>仪表盘</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header class="admin-header">
        <div class="header-left">
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              管理员 <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="admin-main">
        <!-- 这里是动态加载的子页面内容 -->
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  User,
  Connection,
  Setting,
  Monitor,
  ArrowDown,
} from '@element-plus/icons-vue'

const route = useRoute()

// 根据当前路由计算激活的菜单项和页面标题
const activeMenu = ref('')
const pageTitle = ref('仪表盘')

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath.split('/')[2] || 'dashboard' // 简单处理，取第三级路径作为菜单索引
    switch (newPath) {
      case '/admin/dashboard':
        pageTitle.value = '系统仪表盘'
        break
      case '/admin/users/list':
        pageTitle.value = '用户列表'
        break
      case '/admin/users/roles':
        pageTitle.value = '角色管理'
        break
      case '/admin/apis/list':
        pageTitle.value = 'API接口列表'
        break
      case '/admin/apis/approval':
        pageTitle.value = '待审批接口'
        break
      case '/admin/system-config':
        pageTitle.value = '系统配置'
        break
      default:
        pageTitle.value = '管理中心'
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.admin-container {
  height: 100vh;
  display: flex;
}

.sidebar {
  background-color: #304156;
  color: #fff;
  overflow-x: hidden;
}

.sidebar-logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: #2b2f3a;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
}

.sidebar-menu :deep(.el-menu-item), .sidebar-menu :deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-menu-item:hover), .sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #263445;
  color: #fff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #409EFF;
  color: #fff;
}

.admin-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: normal;
}

.admin-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>