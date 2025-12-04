import axios from "~/axios";

export function getAllApis(){
  return axios.get("/api/api/apis")
}

export function getApiLogs(params) {
  return axios.get('/api/api/apiLogs', { params });
}