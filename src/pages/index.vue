<template>
    <div>
        后台首页


        用户信息: {{ userStore.userInfo }}
        <el-button @click="logout">退出登录</el-button>

    </div>
</template>
<script setup>
import { useUserStore } from '../store/index'
import { showModal, toast } from '../composables/util';
import { useRouter } from 'vue-router';


const router = useRouter()
const userStore = useUserStore()

function logout(){
showModal("是否要推出登录？").then(res=>{
    // 1. 清除localStorage中的token
    localStorage.removeItem('admin-token');
    
    // 2. 清除Cookie中的token
    document.cookie = "admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    // 如果有多个cookie需要清除，可以继续添加
    // document.cookie = "user-info=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    
    // 3. 清除应用状态（如Pinia中的用户信息）
    userStore.CLEAR_USERINFO();

    
    // 5. 跳转到登录页
    router.push('/login');
    toast("退出成功","success")
    
})

}


</script> 