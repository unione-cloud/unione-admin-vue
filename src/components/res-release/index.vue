<template>
    <a-drawer v-model:visible="visible" title="菜单发布" :width="500" :placement="placement" rootClassName="res-release">

        <unione-form :form="baseFormObj" ref="baseFormRef"></unione-form>

        <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane tab="PC端" key="pc">
            </a-tab-pane>
            <a-tab-pane tab="移动端" key="app">
            </a-tab-pane>
        </a-tabs>

        <template #footer>
            <div class="btns">
                <a-button @click="visible = false">取消</a-button>
                <a-button type="primary" @click="torelease">发布</a-button>
            </div>
        </template>
    </a-drawer>
</template>
<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
    name: 'ResRelease'
})

const props = defineProps({
    targetType: {
        type: String,
        default: 'form',
        required: true
    },
    targetId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    iconFont: {
        type: String
    },
    placement: {
        type: String,
        default: 'right'
    }
})

const visible = defineModel('visible', {
    type: Boolean,
    default: false
})

const baseFormRef = ref()
const baseFormObj = ref({
    fields: [{
        title: '菜单标题',
        name: 'title',
        placeholder: '请输入菜单标题'
    }, {
        title: '字体图标',
        name: 'iconName',
        control: 'unione-icon-select',
        placeholder: '请输入菜单图标'
    }, {
        title: '显示顺序',
        name: 'ordered',
        value: 0,
        control: 'a-input-number'
    }, {
        title: '是否授权',
        name: 'isNeedPermis',
        control: 'unione-switch-box',
        value: 1,
        convert: {
            types: 'dict',
            dictName: 'TUREORFALSE'
        }
    },]
})

const activeKey = ref('pc')



function torelease() {
    visible.value = false
}

</script>
<style scoped lang="less">
.res-release {
    .btns {
        text-align: right;

        .ant-btn {
            margin-right: 10px;
        }
    }
}
</style>