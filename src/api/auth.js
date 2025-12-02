import axios from "~/axios";

export function login(username,password){
  return  axios.post("/api/auth/login",{
    username,
    password
    })
}

export function register(username,email,password){
  return  axios.post("/api/auth/register",{
    username,
    email,
    password
    })
}

