import axios from "~/axios";

export function userinfo(){
  return  axios.get("/api/user/userinfo")
}

export function submitRecharge(quota) {
  return axios.post('/api/user/recharge', { quota });
}

export function applyToBeDeveloper() {
  return axios.post('/api/user/updateToDeveloper'); 
}