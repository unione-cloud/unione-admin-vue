<template>
    <a-drawer v-model:visible="visible" title="菜单发布" :width="550" :placement="placement" rootClassName="res-release">

        <unione-form :form="baseFormObj" ref="baseFormRef"></unione-form>

        <unione-section title="资源树" />
        <div class="res-tree">
            <a-tree :showLine="{ showLeafIcon: false }" showIcon blockNode checkable checkStrictly
                :tree-data="resTreeData" :fieldNames="{ key: 'id' }" v-if="resTreeData?.length > 0"
                v-model:selectedKeys="selectedKeys" v-model:checkedKeys="checkedKeys" @check="onCheck"
                v-model:expandedKeys="expandedKeys">
                <template #icon="{ dataRef }">
                    <component :is="dataRef.iconName || iconMap[dataRef.ntype]"></component>
                </template>
                <template #title="{ dataRef }">
                    <div :class="['node-label', dataRef.refId == props.targetId ? 'release-node' : '']"
                        @click="onExpande(dataRef)">
                        <span v-if="dataRef.refId == props.targetId">[{{ dataRef.title }}]</span>
                        <span v-else>{{ dataRef.title }}</span>
                    </div>
                </template>
            </a-tree>
        </div>

        <template #footer>
            <div class="btns">
                <a-button @click="visible = false">取消</a-button>
                <a-button type="primary" @click="torelease">发布</a-button>
            </div>
        </template>
    </a-drawer>
</template>
<script setup lang="ts">
import { axios, useDialog } from 'unione-base-vue'
import { nextTick, onMounted, ref, watch } from 'vue'

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
    targetSn: {
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
const dialog = useDialog()

const baseFormRef = ref()
const baseFormObj = ref({
    fields: [{
        title: '菜单标题',
        name: 'title',
        placeholder: '请输入菜单标题',
        props: {
            required: true
        }
    }, {
        title: '路由path',
        name: 'path',
        placeholder: '请输入路由path',
        props: {
            required: true
        }
    }, {
        title: '组件名称',
        name: 'url',
        placeholder: '请输入组件名称',
        props: {
            required: true
        }
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
    }, {
        title: '是否隐藏',
        name: 'isHide',
        control: 'unione-switch-box',
        value: 0,
        convert: {
            types: 'dict',
            dictName: 'TUREORFALSE'
        }
    }]
})

const iconMap = ref<any>({
    app: 'AppstoreOutlined',
    menu: 'BarsOutlined',
    btn: 'GoldOutlined',
    tool: 'FormatPainterOutlined',
    platpc: 'DesktopOutlined',
    platap: 'MobileOutlined'
})

// tree 选中的节点
const releaseIds = ref<any>([])
const checkedKeys = ref<any>({ checked: [], halfChecked: [] })
const selectedKeys = ref<any>([])
const expandedKeys = ref<any>([])

const resNodeMap = ref<any>({})
const resTreeData = ref<any>([])
const loading = ref(false)
watch(() => visible.value, () => {
    if (visible.value) {
        checkedKeys.value.checked = []
        checkedKeys.value.halfChecked = []
        selectedKeys.value = []
        expandedKeys.value = []
        loadResTreeData()
        nextTick(() => {
            const init: any = {
                title: props.title,
                path: '/',
                url: (props.targetType == 'form' ? '@UnionePageList' : '@UnioneFlowDone'),
                iconName: props.iconFont,
                isNeedPermis: true
            }
            baseFormRef.value.setValue(init)
        })
    }
}, {
    immediate: true
})

function processPath(node: any) {
    if (node.id == 'pc' || node.id == 'app' || !node.path) {
        return
    }
    const init: any = {
        title: props.title,
        path: '/',
        url: (props.targetType == 'form' ? '@UnionePageList' : '@UnioneFlowDone'),
        iconName: props.iconFont,
        isNeedPermis: true
    }
    init.path = node.path + '/' + props.targetSn
    baseFormRef.value.setValue(init)
}

function loadResTreeData() {
    if (loading.value) {
        return
    }
    loading.value = true
    resTreeData.value = [{
        id: 'pc',
        ntype: 'platpc',
        title: 'PC端',
        children: []
    }, {
        id: 'app',
        ntype: 'platap',
        title: '移动端',
        children: []
    }]
    resNodeMap.value = {}
    resTreeData.value.forEach((item: any) => {
        resNodeMap.value[item.id] = item
    })
    axios.admin({
        url: '/api/system/resource/tree/mine',
        method: 'post',
        data: {
        }
    }).then((res: any) => {
        res.body.forEach((item: any) => {
            resNodeMap.value[item.id] = item
            if (props.targetId == item.refId) {
                releaseIds.value.push(item.id)
            }
            item.isLeaf = true
            item.checkable = false
            if (item.ntype == 'app') {
                item.checkable = true
            }
        })
        res.body.forEach((item: any) => {

            const parent = resNodeMap.value[item.pid]
            if (parent) {
                parent.children = parent.children || []
                parent.isLeaf = false
                parent.checkable = true
                if (parent.refId) {
                    parent.isLeaf = true
                    parent.checkable = false
                    return
                }
                parent.children.push(item)
            } else {
                if (item.platform == 'pc') {
                    item.pid = 'pc'
                    resTreeData.value[0].children.push(item)
                } else {
                    item.pid = 'app'
                    resTreeData.value[1].children.push(item)
                }
            }
        })
        if (releaseIds.value.length > 0) {
            const releaseNode = resNodeMap.value[releaseIds.value[0]]
            let releaseParent = resNodeMap.value[releaseNode.pid]
            processPath(releaseParent)
            while (releaseParent) {
                expandedKeys.value.push(releaseParent.id)
                releaseParent = resNodeMap.value[releaseParent.pid]
            }
        }
    }).finally(() => {
        loading.value = false
    })
}

function onCheck(checked: any, { node }: any) {
    checkedKeys.value.checked = [node.id]
    processPath(node)
}

function onExpande(node: any) {
    if (expandedKeys.value.includes(node.id)) {
        expandedKeys.value = expandedKeys.value.filter((item: any) => item != node.id)
    } else {
        expandedKeys.value.push(node.id)
    }
}

function torelease() {
    // visible.value = false
    baseFormRef.value.validate().then((data: any) => {
        console.log('formData', data)
        data.types = props.targetType
        data.refId = props.targetId
        data.isNeedPermis = data.isNeedPermis == true ? 1 : 0
        data.isHide = data.isHide == true ? 1 : 0
        if (props.targetType == 'form') {
            data.configs = JSON.stringify({
                meta: { psn: props.targetSn + ':list' }
            })
        }

        const newRelease = checkedKeys.value.checked.filter((item: any) => !releaseIds.value.includes(item))
        if (newRelease.length == 0) {
            if (releaseIds.value.length == 0) {
                dialog.warning('请选择要发布的资源目录')
                return
            }
            dialog.confirm({
                content: '确定更新资源发布吗？',
                onOk: () => {
                    axios.admin({
                        url: '/api/system/resource/release',
                        method: 'post',
                        data: {
                            body: data,
                            ids: releaseIds.value
                        }
                    }).then((res: any) => {
                        if (res.success) {
                            dialog.success('更新成功')
                        } else {
                            dialog.error(res.message || '发布失败')
                        }
                    })
                }
            })
            return
        }
        const parentNode = resNodeMap.value[newRelease[0]]
        data.appId = parentNode.appId
        data.pid = parentNode.id
        data.name = parentNode.name + ':' + props.targetSn

        // 新增资源发布
        dialog.confirm({
            content: '确定发布到当前资源下吗？',
            onOk: () => {
                axios.admin({
                    url: '/api/system/resource/release',
                    method: 'post',
                    data: {
                        body: data
                    }
                }).then((res: any) => {
                    if (res.success) {
                        dialog.success('发布成功')
                        visible.value = false
                    } else {
                        dialog.error(res.message || '发布失败')
                    }
                })
            }
        })

    })
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

    .res-tree {
        :deep(.ant-tree) {
            height: calc(100% - 30px);
            overflow-y: scroll;

            .ant-tree-title {
                display: inline-block;
                width: calc(100% - 40px);

                .node-label {
                    width: 100%;

                    &.release-node {
                        color: #1890ff;
                    }
                }

                .enDilivery {
                    float: right;

                    .label {
                        margin-right: 5px;
                    }
                }
            }
        }
    }
}
</style>