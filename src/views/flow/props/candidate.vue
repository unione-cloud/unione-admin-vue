<template>
    <div class="task-candidate" v-if="modelValue">
        <div class="entry-item" v-for="item in entryItems" :key="item.name">
            <span class="title">{{ item.title }}</span>
            <div class="items">
                <a-tag v-for="i in modelValue[item.name]" :key="i.id" closable @close="removeItem(item, i)">{{
                    i.title }}</a-tag>
            </div>
            <a-button type="text" size="small" class="btn-add" @click="toAddItem(item)">
                <template #icon>
                    <PlusOutlined />
                </template>
            </a-button>
            <component :is="item.widget" v-model:visible="item.visible" :selected="modelValue[item.name]"
                @ok="(e: any) => handelSelected(item, e)" />
        </div>
        <div class="isAssembly" v-if="modelValue">
            <a-checkbox v-model:checked="modelValue.isAssembly">
                启用组合
                <a-tooltip title="开启组合功能后，候选用户是指定的用户、角色、分组、岗位、组织的组合逻辑">
                    <QuestionCircleOutlined class="icon" />
                </a-tooltip>
            </a-checkbox>
        </div>
    </div>
</template>
<script setup lang="ts">
import { utils } from 'unione-base-vue'
import { onMounted, ref } from 'vue'

defineOptions({
    name: 'TaskCandidate',
})

const modelValue = defineModel('value', {
    type: Object
})
const emit = defineEmits(['change'])
const entryItems = ref([{
    title: '指定用户',
    name: 'users',
    widget: 'unione-user-select',
    visible: false,
}, {
    title: '指定角色',
    name: 'roles',
    widget: 'unione-role-select',
    visible: false,
}, {
    title: '指定分组',
    name: 'groups',
    widget: 'unione-group-select',
    visible: false,
}, {
    title: '指定岗位',
    name: 'posts',
    widget: 'unione-post-select',
    visible: false,
}, {
    title: '指定组织',
    name: 'organs',
    widget: 'unione-organ-select',
    visible: false,
}])

function toAddItem(item: any) {
    entryItems.value.forEach((i: any) => {
        i.visible = false
    })
    item.visible = true
}
function removeItem(item: any, i: number) {
    modelValue.value[item.name].splice(i, 1)
    emit('change', modelValue.value)
}
function handelSelected(item: any, { list }: any) {
    const selected = modelValue.value[item.name]?.map((i: any) => i.id) || []
    const added = list.filter((r: any) => !selected.includes(r.id)).map((r: any) => {
        if (item.name == 'users') {
            return { title: r.title + '/' + r.username, id: r.id }
        }
        return { title: r.title, id: r.id }
    })
    if (!modelValue.value[item.name]) {
        modelValue.value[item.name] = []
    }
    item.visible = false
    modelValue.value[item.name] = [...modelValue.value[item.name], ...added]
    emit('change', modelValue.value)
}

onMounted(() => {
    const isEmpty = !modelValue.value
    modelValue.value = utils.obj.ext(modelValue.value, {
        isAssembly: false,
        users: [],
        roles: [],
        groups: [],
        posts: [],
        organs: [],
    })
    if (isEmpty) {
        emit('change', modelValue.value)
    }
})

</script>
<style lang="less" scoped>
.task-candidate {
    display: flex;
    flex-direction: column;

    .entry-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 4px 8px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        width: 100%;
        background-color: #ffffff;
        cursor: pointer;
        transition: all 0.2s;
        box-sizing: border-box;

        .title {
            font-size: 14px;
            color: #303133;
        }

        .items {
            width: calc(100% - 100px);
        }
    }

    .entry-item:hover {
        background-color: #f5f7fa;
        border-color: #c6e2ff;
    }

    .isAssembly {
        margin-top: 2px;
    }

}
</style>