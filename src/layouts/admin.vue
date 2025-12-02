<!-- src/layouts/Admin.vue -->
<template>
  <el-container class="admin-container">
    <!-- 顶部 Header -->
    <el-header class="header">
      <f-header @toggle-collapse="isCollapse = !isCollapse" />
    </el-header>

    <!-- 主容器 -->
    <el-container class="main-container">
      <!-- 左侧菜单 -->
      <el-aside 
        class="aside" 
        :width="isCollapse ? '64px' : '240px'"
        :class="{ 'is-collapse': isCollapse }"
      >
        <f-menu :collapse="isCollapse" />
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <div class="scroll-wrapper">
          <!-- ⬇️ 关键：强制刷新 -->
          <router-view :key="$route.fullPath" />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import FHeader from './components/FHeader.vue'
import FMenu from './components/FMeun.vue'
import { ref } from 'vue'

const isCollapse = ref(false) // 控制菜单折叠状态
</script>

<style scoped>
.admin-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  flex-shrink: 0;
  padding: 0;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.aside {
  width: 240px !important;
  flex-shrink: 0;
  background: #001529;
  height: 100%;
  border-right: none; /* ❌ 删除任何边框 */
}

.aside.is-collapse {
  width: 64px !important;
}

.main-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
  background: #f5f7fa;
}

.scroll-wrapper {
  height: 100%;
  /* width: 100%; ← 删除 */
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box; /* ✅ 关键！ */
  background: #f5f7fa;
    /* 隐藏滚动条 */
  -ms-overflow-style: none;  /* IE/Edge */
  scrollbar-width: none;     /* Firefox */
}
</style>