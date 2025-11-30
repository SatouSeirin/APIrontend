<template>
    <div>
        nihao
    </div>
</template>
<script setup>
    import { useCookies } from '@vueuse/integrations/useCookies'
    const cookie = useCookies()

    console.log(cookie);
    


</script>