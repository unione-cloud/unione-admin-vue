<template>
    <div class="unione-breadcrumb">
        <a-breadcrumb>
            <a-breadcrumb-item href="/home">
                <HomeOutlined />首页
            </a-breadcrumb-item>
            <a-breadcrumb-item>列表</a-breadcrumb-item>
            <a-breadcrumb-item>详情</a-breadcrumb-item>
        </a-breadcrumb>
        {{ routeList }}
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router'
const route = useRoute()

const routeList = computed(() => {
    const list: any = [];
    console.log('route', route)
    return list;
})

</script>
<style scoped lang="less">
.unione-breadcrumb {
    padding: 2px 20px;
    background-color: #f5f5f5;
}
</style>
