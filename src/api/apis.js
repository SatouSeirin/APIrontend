import axios from "~/axios";

export function getAllApis(){
  return axios.get("/api/api/apis")
}

export function getApisByUser(){
  return axios.get("/api/api/getApisByUser")
}


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


export function deleteApiById(id) {
  return axios.delete(`/api/api/deleteApi/${id}`);
}



export function updateApi(id, apiData) {
  return axios.put(`/api/api/updateApi/${id}`, apiData);
}

export function getCallTrendData(timeRange) {
  return axios.get('/api/api/calls-trend', {
    params: {
      timeRange
    }
  })
}

export function getApiDistributionData() {
  return axios.get('/api/api/api-distribution');
}


export function getTopTodayApis() {
  return axios.get('/api/api/top-today');
}


export function getTopAllTimeApis() {
  return axios.get('/api/api/top-all-time');
}

export function getTotalIncome () {
  return axios.get('/api/api/total-income')
}


