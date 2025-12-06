import axios from "~/axios";

export function getAllApis(){
  return axios.get("/api/api/apis")
}

export function getApiLogs(params) {
  return axios.get('/api/api/apiLogs', { params });
}

export function getApisTotal() {
  return axios.get('/api/api/total');
}

// ~/api/apis.js
// 获取当前用户的调用次数（无参数）
export function getUserTotalCalls() {
  return axios.get('/api/api/totalUser');

}