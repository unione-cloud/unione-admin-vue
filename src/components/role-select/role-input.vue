<template>
    <div class="unione-role-input">
        <div class="input-box">
            <div class="warp">
                <a-tag closable v-for="(role, index) in roleList" @close="handleClose(index)" :key="index">
                    {{ role.title }}
                </a-tag>
            </div>
            <a-button @click="selectorVisible = true" size="small">添加</a-button>
        </div>
        <RoleSelector v-model:visible="selectorVisible" @ok="handleRoleSelect" :selected="selectedRoles"
            targetType="assign" />
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import RoleSelector from './index.vue'
import { axios } from 'unione-base-vue'

const props = defineProps({
    model: {
        type: String,
        default: 'run'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    returnType: {
        type: String,
        default: 'string'   //string | array
    }
})

const emit = defineEmits(['change'])
const modelValue = defineModel('value', {
    type: String || Array<any>,
})
const roleList = ref<any>([])
const selectedRoles = computed(() => {
    return roleList.value.map((item: any) => item.id)
})

const selectorVisible = ref<any>(false)
function handleRoleSelect({ list }: any) {
    roleList.value = list.map((item: any) => {
        return {
            title: item.title,
            sn: item.sn,
            id: item.id,
        }
    })
    if (props.returnType === 'string') {
        modelValue.value = roleList.value.map((item: any) => item.sn).join(',')
    } else {
        modelValue.value = roleList.value
    }
    emit('change', roleList.value)
    selectorVisible.value = false
}
function handleClose(index: any) {
    roleList.value.splice(index, 1)
}

watch(() => modelValue.value, (newVal) => {
    if (newVal) {
        if (props.returnType === 'string') {
            if (newVal.startsWith('[')) {
                roleList.value = JSON.parse(newVal)
            } else {
                const sns = newVal.split(',')
                loadRoleList(sns)
            }
        } else {
            roleList.value = newVal
        }
    }
}, { immediate: true })

/**
 * 加载角色列表
 * @param list 
 */
function loadRoleList(list: Array<String>) {
    const tmp = roleList.value.map((item: any) => item.sn)
    const unload = list.filter((item: any) => !tmp.includes(item))
    if (unload.length > 0) {
        //加载缺失的角色
        axios.admin({
            url: `/api/common/selector/role/list`,
            method: 'post',
            data: {
                body: { targetType: 'view', sns: list },
            }
        }).then((res: any) => {
            if (!res.body) {
                return
            }
            roleList.value = res.body.map((item: any) => {
                return {
                    title: item.title,
                    sn: item.sn,
                    id: item.id,
                }
            })
        })
    } else {
        roleList.value = roleList.value.filter((item: any) => list.includes(item.sn))
    }
}


</script>
<style lang="less" scoped>
.unione-role-input {
    .input-box {
        width: 100%;
        display: flex;
        flex-direction: row;
        border: 1px solid #d9d9d9;
        border-radius: 6px;
        padding: 2px;

        .warp {
            width: calc(100% - 50px);
        }
    }
}
</style>