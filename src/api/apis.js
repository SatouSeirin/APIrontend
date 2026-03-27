import axios from "~/axios";

export function getAllApis(){
  return axios.get("/api/api/apis")
}

export function getApisByUser(){
  return axios.get("/api/api/apisByUser")
}

// 修正：改为 POST 请求，并传递 API 数据
export function insertApi(apiData) {
  return axios.post("/api/api/insertApi", apiData);
}

export function getApiLogs(params) {
  return axios.get('/api/api/apiLogs', { params });
}

export function getApiLogsByUser(params) {
  return axios.get('/api/api/apiLogsByUser', { params });
}

export function getApisTotal() {
  return axios.get('/api/api/total');
}

// ~/api/apis.js
// 获取当前用户的调用次数（无参数）
export function getUserTotalCalls() {
  return axios.get('/api/api/totalUser');

}

