<template>
  <a-modal wrapClassName="unione-modal-full flow-editor" v-model:visible="visible" :footer="null" :mask="false"
    :closable="false" :bodyStyle="{ padding: '0 5px' }">
    <template #title>
      <div class="title">
        <ApartmentOutlined />
        {{ flowObj.title }}<a-tag :color="flowObj.status == 2 ? 'green' : 'red'" style="margin-left: 5px;">版本v{{
          flowObj.vers }}</a-tag>
        <span class="btn-upgrade" v-if="flowObj.status == 2">流程已发布，<span
            style="color: #1890ff;">请先升级版本</span>后进行编辑</span>
      </div>
      <div :class="['steps', 'step-len-' + stepItems.length]">
        <a-steps v-model:current="stepsCurrentIndex" size="small" :items="stepItems"></a-steps>
      </div>
      <div class="opts">
        <a-button type="primary" @click="toSave" shape="round" v-if="flowObj.status != 2">保存</a-button>
        <a-button type="primary" @click="toPublish" shape="round" v-if="flowObj.status != 2">发布</a-button>
        <a-button @click="close" shape="round">关闭</a-button>
      </div>
    </template>

    <UFEditor ref="ufEditor" :value="ufmValue" :toolbar="toolbar" model="edit"></UFEditor>

  </a-modal>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Graph } from '@antv/x6'
import { UFEditor, registerNode, registerOpts } from 'unione-flow-vue'
import Custome from './nodes/node.vue'
import type { UFDefine, UFToolItem } from 'unione-flow-vue/dist/typing'
import { utils } from 'unione-base-vue'

defineOptions({
  name: 'DemoIndex',
})

registerNode({
  shape: 'custom',
  component: Custome,
  icon: 'AndroidOutlined',
  width: 200,
  height: 90,
  data: {
    title: '自定义节点',
    info: '发起人'
  },
})

registerOpts({
  name: 'custom',
  title: '自定义节点',
  icon: 'AndroidOutlined',
  color: '#1890ff',
  // click:()=>{
  //   alert(22)
  // }
})

const toolbar = ref<any>([
  {
    widget: 'AndroidOutlined',
    name: 'custom',
    title: '自定义节点',
    location: 'left',
    props: {
      style: {
        color: '#1890ff',
      }
    },
  }
])

const visible = ref(false)
const stepItems = computed(() => {
  const items = [
    {
      title: '基础设置',
      name: 'baseInfo'
    },
    {
      title: '流程设计',
      name: 'flowEditor'
    },
    {
      title: '流程设置',
      name: 'flowSetting'
    },
  ]
  if (!flowObj.value?.id) {
    items.filter(item => item.name !== 'baseInfo').forEach((i: any) => {
      i.disabled = true
    })
  }
  return items;
})
const stepsCurrentIndex = ref(0)
const stepCurrentItem = computed(() => stepItems.value[stepsCurrentIndex.value] || {})

const flowObj = ref<any>({
  title: '流程',
  vers: 1,
  status: 1
})
const ufEditor = ref()
const ufmValue = ref<UFDefine>({
  setting: {},
  nodes: [],
  routes: [],
})

function toSave() {
  visible.value = false
}
function toPublish() {
  visible.value = false
}
function close() {
  visible.value = false
}
function open(flow: any) {
  flowObj.value = utils.obj.ext(flow, {
    title: '流程',
    vers: 1,
    status: 1
  })
  utils.obj.ext(flowObj.value, {
    configs: {
      setting: {
      },
      nodes: [],
      routes: [],
    }
  })
  ufmValue.value = flowObj.value.configs
  visible.value = true
}

onMounted(() => {


})
defineExpose({
  open,
  close
})

</script>
<style lang="less">
.flow-editor {
  height: 100%;
  overflow: hidden;

  .ant-modal-title {
    padding: 5px 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;

    .btn-upgrade {
      font-size: 11px;
      margin-left: 10px;
      cursor: pointer;
    }

    .steps {
      justify-content: center;
      display: flex;

      .ant-steps {
        width: 400px;
      }

      &.step-len-3 {
        .ant-steps {
          width: 320px;
        }
      }
    }

    .opts {
      .ant-btn {
        margin-right: 5px;
      }
    }
  }

  .ant-modal-content {
    padding: 0;
  }



}
</style>