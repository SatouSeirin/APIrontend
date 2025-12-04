import axios from "axios";
import { toast } from './composables/util'
import { getToken } from './composables/auth'

const service = axios.create({
    //baseURL:"http://127.0.0.:8080"
})

const apiClient  = axios.create({
    //baseURL:"http://127.0.0.:8080"
})


// ===== API Key 拦截器（仅用于 apiClient）=====
apiClient.interceptors.request.use(function (config) {
  // 从环境变量或配置中读取 API Key（⚠️ 不能是用户敏感信息！）
  const apiKey = import.meta.env.VITE_API_KEY; // 或 process.env.VUE_APP_API_KEY（Vue 2）
  
  if (apiKey) {
    config.headers["X-API-Key"] = apiKey;
  } else {
    console.warn("Missing VITE_API_KEY in environment");
  }
  
  // ⚠️ 明确不携带 JWT，即使有也不加
  delete config.headers["Authorization"]; // 确保不残留
  
  return config;
}, function (error) {
  return Promise.reject(error);
});



// 添加请求拦截器专门处理JWT Token（用户登录状态）
service.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    // 往header头装token
    const token = getToken()
    if(token){
        config.headers["Authorization"] = `Bearer ${token}`
    }

    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
service.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response.data;
  }, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么

    toast(error.response?.data?.error || error.response?.data?.message || "请求失败","error")
    return Promise.reject(error);
  });

export default service