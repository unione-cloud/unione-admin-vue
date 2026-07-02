<template>
    <a-upload class="flow-attach" name="file" :fileList="fileList">
    </a-upload>
</template>
<script setup lang="ts">
import { useConfigStore } from '@/config';
import { axios } from 'unione-base-vue';
import { ref, watch } from 'vue';

const props = defineProps({
    ownerId: {
        type: String,
        required: true
    }
})

const config = useConfigStore().config
const fileList = ref<any>([])
const loading = ref(false)
watch(() => props.ownerId, (newVal: any, oldValue: any) => {
    if (newVal && newVal != oldValue) {
        loadAttach(newVal)
    }
}, { immediate: true })
function loadAttach(ownerId: String) {
    if (loading.value) {
        return
    }
    loading.value = true
    axios.admin({
        url: '/api/common/file/find',
        method: 'post',
        data: {
            body: {
                ownerId
            },
            pageSize: 100
        }
    }).then((result: any) => {
        fileList.value = result.body.map((item: any) => {
            return {
                uid: item.id,
                name: item.title,
                url: config.axios.admin + '/api/common/store/download/' + item.id
            }
        })
    })
}

</script>
<style lang="less" scoped>
.flow-attach {}
</style>