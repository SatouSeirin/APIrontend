import axios from "~/axios";

export function userinfo(){
  return  axios.get("/api/user/userinfo")
}
