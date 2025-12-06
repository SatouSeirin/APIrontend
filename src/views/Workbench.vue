<template>
  <div class="workbench-page">
    <!-- 顶部导航 -->
    <AppHeader />

    <!-- 主内容区 -->
    <div class="container">
      <h1 class="section-title">API 工作台</h1>

      <!-- 请求配置区 -->
      <el-card class="request-card">
        <div class="request-header">
          <el-select v-model="method" size="small" style="width: 80px;">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
          <el-input
            v-model="url"
            placeholder="输入 http 或 https 起始的完整 URL"
            clearable
            @keyup.enter="sendRequest"
          />
          <el-button type="primary" size="small" @click="sendRequest">发送</el-button>
          <el-button size="small" @click="saveAsApi">保存为接口</el-button>
        </div>

        <!-- 标签页 -->
        <el-tabs v-model="activeTab" type="card" class="request-tabs">
          <el-tab-pane label="Params" name="params">
            <el-table :data="params" border>
              <el-table-column prop="key" label="参数名" width="200">
                <template #default="{ row }">
                  <el-input v-model="row.key" size="small" placeholder="参数名" />
                </template>
              </el-table-column>
              <el-table-column prop="value" label="参数值" width="300">
                <template #default="{ row }">
                  <el-input v-model="row.value" size="small" placeholder="参数值" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{ $index }">
                  <el-button type="danger" size="small" @click="removeParam($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button size="small" @click="addParam">添加参数</el-button>
          </el-tab-pane>

          <el-tab-pane label="Body" name="body">
            <el-input
              v-model="body"
              type="textarea"
              :rows="10"
              placeholder="请求体（JSON 字符串）"
            />
          </el-tab-pane>

          <el-tab-pane label="Headers" name="headers">
            <el-table :data="headers" border>
              <el-table-column prop="key" label="参数名" width="200">
                <template #default="{ row }">
                  <el-input v-model="row.key" size="small" placeholder="Header 名称" />
                </template>
              </el-table-column>
              <el-table-column prop="value" label="参数值" width="300">
                <template #default="{ row }">
                  <el-input v-model="row.value" size="small" placeholder="Header 值" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{ $index }">
                  <el-button type="danger" size="small" @click="removeHeader($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button size="small" @click="addHeader">添加 Header</el-button>
          </el-tab-pane>

          <el-tab-pane label="Auth" name="auth">
            <el-form :model="auth" label-width="80px">
              <el-form-item label="认证方式">
                <el-select v-model="auth.type" placeholder="选择认证方式">
                  <el-option label="无认证" value="none" />
                  <el-option label="Bearer Token" value="bearer" />
                  <el-option label="API Key" value="apikey" />
                </el-select>
              </el-form-item>

              <el-form-item label="Token" v-if="auth.type === 'bearer'">
                <el-input v-model="auth.token" placeholder="Bearer Token" />
              </el-form-item>

              <el-form-item label="API Key" v-if="auth.type === 'apikey'">
                <el-input v-model="auth.apiKey" placeholder="API Key" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 响应结果区 -->
      <el-card class="response-card" v-if="response">
        <div class="response-header">
          <span>响应状态: <b>{{ response.status }}</b></span>
          <span>耗时: {{ response.latency }}ms</span>
          <span>时间: {{ formatDate(response.time) }}</span>
        </div>
        <pre class="response-body"><code>{{ formatResponse(response.data) }}</code></pre>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import AppHeader from '../components/AppHeader.vue'


// ========== 状态 ==========
const method = ref('GET')
const url = ref('')
const activeTab = ref('params')

// 请求参数
const params = ref([])
const body = ref('')
const headers = ref([])

// 认证
const auth = reactive({
  type: 'none',
  token: '',
  apiKey: ''
})

// 响应
const response = ref(null)

// ========== 方法 ==========
const addParam = () => {
  params.value.push({ key: '', value: '' })
}

const removeParam = (index) => {
  params.value.splice(index, 1)
}

const addHeader = () => {
  headers.value.push({ key: '', value: '' })
}

const removeHeader = (index) => {
  headers.value.splice(index, 1)
}

const sendRequest = async () => {
  if (!url.value.startsWith('http')) {
    ElMessage.error('URL 必须以 http 或 https 开头')
    return
  }

  const startTime = Date.now()
  try {
    // 构建请求配置
    const config = {
      method: method.value,
      headers: {}
    }

    // 添加 Headers
    headers.value.forEach(h => {
      if (h.key && h.value) {
        config.headers[h.key] = h.value
      }
    })

    // 添加认证
    if (auth.type === 'bearer') {
      config.headers['Authorization'] = `Bearer ${auth.token}`
    } else if (auth.type === 'apikey') {
      config.headers['X-API-Key'] = auth.apiKey
    }

    // 添加 Body
    if (method.value !== 'GET' && body.value) {
      config.body = body.value
      config.headers['Content-Type'] = 'application/json'
    }

    // 添加 Params
    if (params.value.length > 0) {
      const searchParams = new URLSearchParams()
      params.value.forEach(p => {
        if (p.key && p.value) {
          searchParams.append(p.key, p.value)
        }
      })
      const separator = url.value.includes('?') ? '&' : '?'
      url.value = `${url.value}${separator}${searchParams.toString()}`
    }

    // 发送请求
    const res = await fetch(url.value, config)
    const data = await res.text()

    // 记录响应
    response.value = {
      status: res.status,
      latency: Date.now() - startTime,
      time: new Date(),
      data: data
    }

    ElMessage.success('请求成功')
  } catch (error) {
    ElMessage.error(`请求失败: ${error.message}`)
  }
}

const saveAsApi = () => {
  ElMessage.info('保存功能待实现')
}

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '—'
}

const formatResponse = (data) => {
  try {
    const obj = JSON.parse(data)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return data
  }
}
</script>

<style scoped>
/* ========== 整体页面 ========== */
.workbench-page {
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

/* ========== 请求配置卡 ========== */
.request-card {
  margin-bottom: 30px;
}

.request-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.request-header .el-input {
  flex: 1;
}

.request-tabs {
  margin-top: 20px;
}

/* ========== 响应结果卡 ========== */
.response-card {
  margin-top: 30px;
}

.response-header {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #6b7280;
}

.response-body {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 6px;
  overflow: auto;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.response-body code {
  white-space: pre;
}
</style>