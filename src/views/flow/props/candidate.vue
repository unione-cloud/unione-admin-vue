<template>
    <div class="task-candidate" v-if="modelValue">
        <div class="entry-item" v-for="item in entryItems" :key="item.name">
            <span class="title">{{ item.title }}</span>
            <div class="items" v-if="types != 'formVar'">
                <a-tag v-for="(i, j) in modelValue[item.name]" :key="j" closable @close="removeItem(item, j)">{{
                    i.title }}</a-tag>
            </div>
            <div v-else class="var-select">
                <FlowFormVar ref="formVar" v-if="item.visible" :value="modelValue[item.name]?.[0]?.name"
                    :selected="modelValue[item.name]" @select="(v: any, o: any) => formVarSelected(item, v, o)" />
                <span v-else>{{ modelValue[item.name]?.[0]?.title }}</span>
            </div>
            <a-button type="text" size="small" class="btn-add" @click="toAddItem(item)">
                <template #icon>
                    <template v-if="types == 'formVar'">
                        <FormOutlined v-if="!item.visible" />
                        <SaveOutlined v-else />
                    </template>
                    <PlusOutlined v-else />
                </template>
            </a-button>
            <component v-if="types == 'specify'" :is="item.widget" v-model:visible="item.visible"
                :selected="modelValue[item.name]" @ok="(e: any) => handelSelected(item, e)" />
        </div>
        <div class="isAssembly" v-if="modelValue">
            <a-checkbox v-model:checked="modelValue.isAssembly">
                启用组合
                <a-tooltip title="开启组合功能后，候选用户是指定的用户、角色、分组、岗位、组织的组合逻辑">
                    <QuestionCircleOutlined class="icon" />
                </a-tooltip>
            </a-checkbox>
        </div>
        <VarSelect ref="varSelect" v-if="types == 'flowVar'" v-model:visible="varVisible" @ok="handelSelectedVar">
        </VarSelect>
    </div>
</template>
<script setup lang="ts">
import { utils } from 'unione-base-vue'
import { onMounted, ref } from 'vue'
import VarSelect from './varSelect/index.vue'

defineOptions({
    name: 'TaskCandidate',
})

const props = defineProps({
    types: {
        type: String,
        default: 'specify'  //specify:指定用户，flowVar：流程变量，formVar：表单变量
    },
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

const activeItem = ref<any>(null)
const varVisible = ref(false)
function toAddItem(item: any) {
    activeItem.value = item
    if (props.types == 'formVar') {
        entryItems.value.forEach((i: any) => {
            if (i.name != item.name) {
                i.visible = false
            }
        })
        item.visible = !item.visible
        return
    }
    entryItems.value.forEach((i: any) => {
        i.visible = false
    })
    if (props.types == 'flowVar') {
        varVisible.value = true
    }
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
function formVarSelected(item: any, v: any, o: any) {
    if (!modelValue.value[item.name]) {
        modelValue.value[item.name] = []
    }
    modelValue.value[item.name] = [{ title: o.titleFull, name: o.name }]
    emit('change', modelValue.value)
}
function handelSelectedVar({ list }: any) {
    if (!activeItem.value) {
        return
    }
    modelValue.value[activeItem.value.name] = list.map((r: any) => {
        return { title: r.title, name: r.name }
    })
    varVisible.value = false
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

        .var-select {
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