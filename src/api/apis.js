import axios from "~/axios";

export function getAllApis(){
  return  axios.get("/api/api/apis")
}