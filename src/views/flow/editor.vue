<template>
  <a-modal wrapClassName="unione-modal-full flow-editor" v-model:visible="visible" :footer="null" :mask="false"
    :closable="false" :bodyStyle="{ padding: '0 5px' }" destroyOnClose>
    <template #title>
      <div class="title">
        <ApartmentOutlined />
        {{ flowObj.title }}<a-tag :color="flowObj.status == 2 ? 'green' : 'red'" style="margin-left: 5px;">版本v{{
          flowObj.vers }}</a-tag>
        <span class="btn-upgrade" v-if="flowObj.status == 2">流程已发布，<span
            style="color: #1890ff;">请先升级版本</span>后进行编辑</span>
      </div>
      <div :class="['steps', 'step-len-' + stepItems.length]">
        <a-steps v-model:current="stepsCurrentIndex" size="small" :items="stepItems"
          @change="handelStepChange"></a-steps>
      </div>
      <div class="opts">
        <a-button type="primary" @click="toSave" shape="round" v-if="flowObj.status != 2">保存</a-button>
        <a-button type="primary" @click="toPublish" shape="round" v-if="flowObj.status != 2">发布</a-button>
        <a-button @click="close" shape="round">关闭</a-button>
      </div>
    </template>

    <div class="flow-base-info" v-if="stepCurrentItem.name == 'baseInfo'">
      <UnioneForm :form="baseFormDef" ref="baseFormRef" class="base-form">
      </UnioneForm>
    </div>
    <div class="flow-base-info" v-if="stepCurrentItem.name == 'flowSetting'">
      <UnioneForm :form="settingFormDef" ref="settingFormRef" class="base-form"></UnioneForm>
    </div>

    <UFEditor ref="ufEditor" :toolbar="toolbar" v-show="stepCurrentItem.name == 'flowEditor'"
      :model="flowObj?.status == 2 ? 'readonly' : 'edit'" :value="ufmValue"></UFEditor>

  </a-modal>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue'
import { axios, useDialog } from 'unione-base-vue'
import { UFEditor, registerNode, registerOpts, setNodeProps } from 'unione-flow-vue'
import type { UFDefine } from 'unione-flow-vue/dist/typing'
import { utils } from 'unione-form-vue'
import { computed, nextTick, provide, ref } from 'vue'
import Custome from './nodes/node.vue'
import { loadFormFieldList } from './lib/flowUtil'

defineOptions({
  name: 'DemoIndex',
})
registerNode([{
  shape: 'custom',
  component: Custome,
  icon: 'AndroidOutlined',
  width: 200,
  height: 90,
  data: {
    title: '自定义节点',
    info: '发起人'
  },
}, {
  shape: 'start',
  props: {
    'formId': {
      name: 'formId',
      control: 'flow-form-ref'
    },
    'copyOption': {
      name: 'copyOption',
      control: 'flow-copy-to',
    },
  }
}])
setNodeProps({
  'formId': {
    name: 'formId',
    control: 'flow-form-ref'
  },
  'approve.specify': {
    title: '指定审批人',
    name: 'approve.specify',
    control: 'flow-candidate',
    after: 'approve.handlerType',
    props: {
      help: '通过选定的成员，作为审批人'
    },
    event: {
      visible: (val: any, formValue: any) => {
        return formValue.approve?.handlerType === 'specify'
      }
    }
  },
  'approve.flowVar': {
    title: '指定审批人',
    name: 'approve.flowVar',
    control: 'flow-candidate',
    after: 'approve.handlerType',
    props: {
      types: 'flowVar',
      help: '通过流程变量，作为审批人'
    },
    event: {
      visible: (val: any, formValue: any) => {
        return formValue.approve?.handlerType === 'flowVar'
      }
    }
  },
  'approve.formVar': {
    title: '指定审批人',
    name: 'approve.formVar',
    control: 'flow-candidate',
    after: 'approve.handlerType',
    props: {
      types: 'formVar',
      help: '通过前置节点表单变量，作为审批人'
    },
    event: {
      visible: (val: any, formValue: any) => {
        return formValue.approve?.handlerType === 'formVar'
      }
    }
  },
  'approve.chainLevel': {
    title: '审批层级',
    name: 'approve.chainLevel',
    control: 'a-input-number',
    after: 'approve.handlerType',
    value: 3,
    props: {
      min: 0,
      max: 20,
      step: 1,
      style: {
        width: '100%',
      },
      help: '逐级审批最高层级，0或者为空表示不限制'
    },
    event: {
      visible: (val: any, formValue: any) => {
        if (!val) {
          if (!formValue.approve) {
            formValue.approve = {}
          }
          formValue.approve.chainLevel = 3
        }
        return formValue.approve?.handlerType === 'chain'
      }
    }
  },
  'approve.flowNode': {
    title: '流程节点',
    name: 'approve.flowNode',
    control: 'flow-node-select',
    after: 'approve.handlerType',
    props: {
      help: '指定当前流程中其他节点，和目标节点保持一样的候选人',
      //  scope: 'pre',
    },
    event: {
      visible: (val: any, formValue: any) => {
        return formValue.approve?.handlerType === 'flowNode'
      }
    }
  },
  'copyOption': {
    title: '抄送设置',
    name: 'copyOption',
    control: 'flow-copy-to',
  },
  'notify.remind': {
    name: 'notify.remind',
    control: 'flow-notice',
  },
  'notify.agree': {
    name: 'notify.agree',
    control: 'flow-notice',
  },
  'notify.reject': {
    name: 'notify.reject',
    control: 'flow-notice',
  },
  'notify.back': {
    name: 'notify.back',
    control: 'flow-notice',
  },
  'notify.copy': {
    name: 'notify.copy',
    control: 'flow-notice',
  },
  'notify.timeout': {
    name: 'notify.timeout',
    control: 'flow-notice',
  },
  'timeOut.transferTarget': {
    name: 'timeOut.transferTarget',
    control: 'flow-candidate',
  }
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

// 获取当前节点绑定的表单字段
provide('loadFormFieldList', loadFormFieldList)

const dialog = useDialog()
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

const baseFormRef = ref<any>()
const baseFormDef = ref({
  fields: [{
    title: '流程标题',
    name: 'title',
    props: {
      required: true
    }
  }, {
    title: '流程编码',
    name: 'sn',
    control: 'unione-random-input',
    props: {
      required: true
    }
  }, {
    title: '流程版本',
    name: 'vers',
    value: 1,
    props: {
      disabled: true
    }
  }, {
    title: '流程分类',
    name: 'category',
    control: 'unione-select-box',
    props: {
      required: true
    },
    convert: {
      types: 'dict',
      dictName: 'FLOWLITECATEGORY'
    }
  }, {
    title: '流程说明',
    name: 'descs',
    control: 'a-textarea',
  }]
})

const settingFormRef = ref<any>()
const settingFormDef = ref({
  fields: [{
    title: '自由流',
    name: 'isGoto',
    control: 'unione-switch-box',
    convert: {
      types: 'dict',
      dictName: 'TRUEORFALSE'
    },
    props: {
      help: '开启该功能，提交流程时，用户可以自由选择流程流转，自由选择下一个节点'
    }
  }, {
    title: '任务指派',
    name: 'isAssign',
    control: 'unione-switch-box',
    convert: {
      types: 'dict',
      dictName: 'TRUEORFALSE'
    },
    props: {
      help: '开启该功能，用户可以自己决定下一个节点的任务处理人'
    }
  }, {
    title: '公开流程',
    name: 'isOpen',
    control: 'unione-switch-box',
    convert: {
      types: 'dict',
      dictName: 'TRUEORFALSE'
    },
    props: {
      help: '公开流程不需要分配节点候选人，任何人都可以操作流程'
    }
  }]
})


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

function handelStepChange() {
  nextTick(() => {
    if (stepCurrentItem.value?.name == 'flowSetting') {
      settingFormRef.value.setValue(flowObj.value)
    } else if (stepCurrentItem.value?.name == 'baseInfo') {
      baseFormRef.value.setValue(flowObj.value)
    }
  })
  if (!ufEditor.value && stepCurrentItem.value?.name == 'flowEditor') {
    nextTick(() => {
      ufEditor.value.fromJSON(ufmValue.value)
    })
  }
}

function toSave() {
  if (stepCurrentItem.value?.name == 'baseInfo') {
    // 保存基本信息
    baseFormRef.value.validate().then((data: any) => {
      utils.obj.ext(flowObj.value, data, true)
      if (!flowObj.value.id) {
        utils.obj.ext(flowObj.value, {
          isGoto: 0,
          isAssign: 0,
          isAuth: 1,
          isOpen: 0,
          status: 1,
          ordered: 1,
          flowChart: '{}'
        }, true)
      }
      // 提交数据
      message.loading({
        content: '提交中...',
        duration: 3
      })
      axios.flow({
        url: '/api/tmpl/save',
        method: 'POST',
        data: flowObj.value
      }).then((res: any) => {
        message.destroy()
        if (res.success) {
          message.success('提交成功')
          flowObj.value.id = res.body
          stepsCurrentIndex.value = 1
        } else {
          message.error(res.message || '提交失败')
        }
      })
    })
  }
  // 保存流程图
  if (stepCurrentItem.value?.name == 'flowEditor') {
    if (!flowObj.value?.id) {
      dialog.warning({
        content: '请先保存基本信息'
      })
      return
    }
    ufmValue.value = ufEditor.value.toJSON()
    axios.flow({
      url: '/api/tmpl/save/flowChart/' + flowObj.value.id,
      method: 'POST',
      data: ufmValue.value
    }).then((res: any) => {
      message.destroy()
      if (res.success) {
        message.success('提交成功')
      } else {
        message.error(res.message || '提交失败')
      }
    })
  }
  // 保存流程设置
  if (stepCurrentItem.value?.name == 'flowSetting') {
    // 保存基本信息
    settingFormRef.value.validate().then((data: any) => {
      utils.obj.ext(flowObj.value, data, true)
      // 提交数据
      message.loading({
        content: '提交中...',
        duration: 3
      })
      axios.flow({
        url: '/api/tmpl/save',
        method: 'POST',
        data: flowObj.value
      }).then((res: any) => {
        message.destroy()
        if (res.success) {
          message.success('提交成功')
          stepsCurrentIndex.value = 1
        } else {
          message.error(res.message || '提交失败')
        }
      })
    })
  }
}
function toPublish() {

}
function close() {
  visible.value = false
}
async function open(flow: any) {
  flowObj.value = utils.obj.ext(flow, {
    title: '流程',
    vers: 1,
    status: 1,
    sn: utils.randomStr(10)
  })
  if (flow && flow.id) {
    // 加载流程图
    const result = await axios.flow({
      url: '/api/tmpl/load/flowChart/' + flowObj.value.id,
      method: 'POST',
    })
    if (!result.success) {
      dialog.error({
        content: result.message || '加载流程图失败'
      })
      return
    }
    flowObj.value.flowChart = result.body
  }
  utils.obj.ext(flowObj.value, {
    flowChart: {
      setting: {
      },
      nodes: [],
      routes: [],
    }
  }, true)
  ufmValue.value = flowObj.value.flowChart
  if (!hadStartNode(ufmValue.value.nodes)) {
    ufmValue.value.nodes.push({
      types: 'start',
      title: '开始',
      attr: {
        position: {
          x: 100,
          y: 100,
        }
      }
    })
  }

  visible.value = true
  if (!flowObj.value.id) {
    stepsCurrentIndex.value = 0
    nextTick(() => {
      baseFormRef.value.setValue(flowObj.value)
    })
  } else {
    stepsCurrentIndex.value = 1
    nextTick(() => {
      ufEditor.value.fromJSON(ufmValue.value)
    })
  }
}

function hadStartNode(nodes: any[]) {
  if (!nodes) {
    return false
  }
  return nodes.some((item: any) => item.types == 'start')
}

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

    .unione-flow-editor {
      .form-item-approve\.handlerType {
        .unione-form-radio {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
        }
      }
    }
  }


  .flow-base-info {
    background-color: #f5f5f5;
    padding: 10px;
    height: 100%;
    display: flex;
    justify-content: center;

    .base-form {
      background-color: #FFFFFF;
      width: 850px;
      height: 100%;
      padding: 20px 30px;
      border-radius: 10px;
    }

  }

}
</style>