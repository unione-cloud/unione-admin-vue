<template>
  <a-modal wrapClassName="unione-modal-full flow-editor" v-model:visible="visible" :footer="null" :mask="false"
    :closable="false" :bodyStyle="{ padding: '0 5px' }" destroyOnClose>
    <template #title>
      <div class="flow-title">
        <ApartmentOutlined />
        {{ flowObj.title }}<a-tag :color="flowObj.status == 2 ? 'green' : 'red'" style="margin-left: 5px;">版本v{{
          flowObj.vers }}</a-tag>
        <span class="btn-upgrade" v-if="flowObj.status == 2" @click="toUpgrade">流程已发布，<span
            style="color: #1890ff;">请先升级版本</span>后进行编辑</span>
      </div>
      <div :class="['steps', 'step-len-' + stepItems.length]">
        <a-steps v-model:current="stepsCurrentIndex" size="small" :items="stepItems"
          @change="handelStepChange"></a-steps>
      </div>
      <div class="opts">
        <a-button danger v-if="error.list.length" shape="round" @click="error.visible = true">
          {{ error.list.length }} 个错误
          <DownOutlined />
        </a-button>
        <a-button type="primary" @click="toSave" shape="round" v-if="flowObj.status != 2"
          :loading="loading">保存</a-button>
        <a-button type="primary" @click="toPublish" shape="round" v-if="flowObj.status != 2"
          :loading="loading">发布</a-button>
        <a-button @click="close" shape="round">关闭</a-button>

        <draggable-resizable-vue :resizable="false" :z="10">
          <a-card class="flow-error-card" size="small" :bodyStyle="{ padding: 0 }" v-if="error.visible">
            <template #title>
              <div class="title">
                <CloseCircleOutlined class="icon" /> 异常信息
              </div>
            </template>
            <template #extra>
              <CloseOutlined @click="error.visible = false" />
            </template>
            <div class="node-error" v-for="(item, i) in error.list" :key="i" @click="setActiveNode(item.node.sn)">
              <div class="title">{{ (i + 1) }}、{{ item.node.title }}节点</div>
              <div class="error-list" v-for="err in item.error" :key="err">
                <div class="error-item">
                  <div class="prop-title">{{ err.title }}</div>
                  <div class="prop-error">{{ err.message }}</div>
                </div>
              </div>
            </div>
          </a-card>
        </draggable-resizable-vue>

      </div>
    </template>

    <div class="flow-base-info" v-if="stepCurrentItem.name == 'baseInfo'">
      <UnioneForm :form="baseFormDef" ref="baseFormRef" class="base-form"
        :model="flowObj?.status == 2 ? 'view' : 'run'">
      </UnioneForm>
    </div>
    <div class="flow-setting-info" v-if="stepCurrentItem.name == 'flowSetting'">
      <UnioneForm :form="settingFormDef" ref="settingFormRef" class="base-form"
        :model="flowObj?.status == 2 ? 'view' : 'run'"></UnioneForm>
    </div>

    <template v-if="flowObj.id">
      <UFEditor ref="ufEditor" :toolbar="toolbar" v-show="stepCurrentItem.name == 'flowEditor'"
        :model="flowObj?.status == 2 ? 'readonly' : 'edit'" :value="ufmValue"></UFEditor>
    </template>

  </a-modal>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue'
import { axios, useDialog } from 'unione-base-vue'
import { UFEditor, getNodeProps, registerNode, registerOpts, setNodeProps } from 'unione-flow-vue'
import type { UFDefine } from 'unione-flow-vue/dist/typing'
import { utils } from 'unione-form-vue'
import { computed, nextTick, provide, ref } from 'vue'
import DraggableResizableVue from 'draggable-resizable-vue3'
import { loadPreForm, loadPreFormSync } from './lib/flowUtil'
import { Axis } from 'echarts'

defineOptions({
  name: 'FlowEditor',
})

const emit = defineEmits(['refresh'])
registerNode([{
  shape: 'sql',
  props: {
    'base.dsId': {
      name: 'dsId',
      control: 'unione-select-box',
      convert: {
        types: 'local',
        url: '/api/data/source/find',
        search: true
      }
    },
    'base.sql': {
      name: 'sql',
      control: 'unione-code-editor',
      props: {
        lang: 'sql'
      }
    }
  }
}, {
  shape: 'start',
  props: {
    'base.formId': {
      name: 'formSn',
      control: 'flow-form-ref',
    },
    'base.copyOption': {
      name: 'copyOption',
      control: 'flow-copy-to',
    },
  }
}, {
  shape: 'data',
  props: {
    'base.formId': {
      name: 'formSn',
      control: 'flow-form-ref',
      props: {
        scope: 'lol'
      },
      event: {
        validate: (val: any, formValue: any) => {
          if (!val) {
            return { error: '请绑定表单' }
          }
          return {
            data: {
              formId: formValue.formId,
              formSn: formValue.formSn,
              formVers: formValue.formVers
            }
          }
        }
      }
    },
    'base.loadFields': {
      name: 'loadFields',
      control: 'flow-data-field'
    },
    'base.bindFields': {
      name: 'bindFields',
      control: 'flow-data-bind',
      event: {
        validate: (val: any, formValue: any) => {
          if (!val || !val.length) {
            return { error: '请绑定字段' }
          }
          for (let i in val) {
            if (!val[i].bindValue) {
              console.log('val[i]', val[i])
              return { error: '请绑定字段' }
            }
          }
        }
      }
    },
    'base.filter': {
      name: 'filter',
      control: 'flow-data-filter'
    },
    'base.validate': {
      name: 'validate',
      control: 'flow-data-filter',
      event: {
        validate: (val: any, formValue: any) => {
          if (val && val.length) {
            for (let i in val) {
              if (!val[i].paramValue) {
                return { error: '请绑定字段' }
              }
            }
          }
        }
      }
    },
    'base.sorts': {
      name: 'sorts',
      control: 'flow-data-sort'
    },
  }
}, {
  shape: 'subflow',
  props: {
    'base.flowId': {
      name: 'flowId',
      control: 'unione-select-box',
      convert: {
        types: 'local',
        ctx: 'flow',
        url: '/api/tmpl/find',
        search: true
      },
      event: {
        select: (val: any, { option, formValue }: any) => {
          formValue.flowKey = option.sn
          formValue.vers = option.vers
          ufEditor.value.trigger('flowRef:change', val)
        },
      }
    },
    'base.flowParams': {
      name: 'flowParams',
      control: 'flow-data-bind',
      props: {
        dataType: 'subflow',
      }
    },
  }
}])
setNodeProps({
  'base.formId': {
    name: 'formSn',
    control: 'flow-form-ref',
    event: {
      validate: (val: any, formValue: any) => {
        if (!val && ufEditor.value) {
          const flowChart = ufEditor.value.toJSON()
          const node = flowChart.nodes.find((item: any) => item.sn === formValue.sn)
          if (node) {
            const preFormId = loadPreFormSync(flowChart, node)
            if (preFormId) {
              return
            }
          }
          return { error: '请绑定表单' }
        }
      }
    }
  },
  'base.approve.handlerType': {
    name: 'approve.handlerType',
    event: {
      select: (val: any, { option, formValue }: any) => {
        formValue.info = option.label
      }
    }
  },
  'base.approve.specify': {
    title: '指定审批人',
    name: 'approve.specify',
    control: 'flow-candidate',
    after: 'base.approve.handlerType',
    props: {
      required: true,
      help: '通过选定的成员，作为审批人'
    },
    event: {
      visible: (val: any, formValue: any) => {
        return formValue.approve?.handlerType === 'specify'
      },
      validate: (val: any, formValue: any) => {
        if (!val) {
          return '指定审批人不能为空'
        }
        const keys = ['users', 'roles', 'groups', 'posts', 'organs']
        for (let i in keys) {
          const key = keys[i]
          if (val[key]?.length) {
            return false
          }
        }
        return {
          error: '指定审批人不能为空'
        }
      }
    }
  },
  'base.approve.flowVar': {
    title: '指定审批人',
    name: 'approve.flowVar',
    control: 'flow-candidate',
    after: 'base.approve.handlerType',
    props: {
      required: true,
      types: 'flowVar',
      help: '通过流程变量，作为审批人'
    },
    event: {
      visible: (val: any, formValue: any) => {
        return formValue.approve?.handlerType === 'flowVar'
      },
      validate: (val: any, formValue: any) => {
        if (!val) {
          return '指定审批人不能为空'
        }
        const keys = ['users', 'roles', 'groups', 'posts', 'organs']
        for (let i in keys) {
          const key = keys[i]
          if (val[key]?.length) {
            return false
          }
        }
        return { error: '指定审批人不能为空' }
      }
    }
  },
  'base.approve.formVar': {
    title: '指定审批人',
    name: 'approve.formVar',
    control: 'flow-candidate',
    after: 'base.approve.handlerType',
    props: {
      required: true,
      types: 'formVar',
      help: '通过前置节点表单变量，作为审批人'
    },
    event: {
      visible: (val: any, formValue: any) => {
        return formValue.approve?.handlerType === 'formVar'
      },
      validate: (val: any, formValue: any) => {
        if (!val) {
          return { error: '指定审批人不能为空' }
        }
        const keys = ['users', 'roles', 'groups', 'posts', 'organs']
        for (let i in keys) {
          const key = keys[i]
          if (val[key]?.length) {
            return false
          }
        }
        return { error: '指定审批人不能为空' }
      }
    }
  },
  'base.approve.chainLevel': {
    title: '审批层级',
    name: 'approve.chainLevel',
    control: 'a-input-number',
    after: 'base.approve.handlerType',
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
  'base.approve.flowNode': {
    title: '流程节点',
    name: 'approve.flowNode',
    control: 'flow-node-select',
    after: 'base.approve.handlerType',
    props: {
      required: true,
      help: '指定当前流程中其他节点，和目标节点保持一样的候选人',
      //  scope: 'pre',
    },
    event: {
      visible: (val: any, formValue: any) => {
        return formValue.approve?.handlerType === 'flowNode'
      }
    }
  },
  'base.copyOption': {
    title: '抄送设置',
    name: 'copyOption',
    control: 'flow-copy-to',
  },
  'notice.notify.remind': {
    name: 'notify.remind',
    control: 'flow-notice',
  },
  'notice.notify.agree': {
    name: 'notify.agree',
    control: 'flow-notice',
  },
  'notice.notify.reject': {
    name: 'notify.reject',
    control: 'flow-notice',
  },
  'notice.notify.back': {
    name: 'notify.back',
    control: 'flow-notice',
  },
  'notice.notify.copy': {
    name: 'notify.copy',
    control: 'flow-notice',
  },
  'notice.notify.timeout': {
    name: 'notify.timeout',
    control: 'flow-notice',
  },
  'time.timeOut.transferTarget': {
    name: 'timeOut.transferTarget',
    control: 'flow-candidate',
    event: {
      validate: (val: any) => {
        if (!val) {
          return { error: '转审对象不能为空' }
        }
        const keys = ['users', 'roles', 'groups', 'posts', 'organs']
        for (let i in keys) {
          const key = keys[i]
          if (val[key]?.length) {
            return false
          }
        }
        return { error: '转审对象不能为空' }
      }
    }
  }
})

// registerOpts({
//   name: 'custom',
//   title: '自定义节点',
//   icon: 'AndroidOutlined',
//   color: '#1890ff',
//   // click:()=>{
//   //   alert(22)
//   // }
// })

const toolbar = ref([])
// const toolbar = ref<any>([
//   {
//     widget: 'AndroidOutlined',
//     name: 'custom',
//     title: '自定义节点',
//     location: 'left',
//     props: {
//       style: {
//         color: '#1890ff',
//       }
//     },
//   }
// ])

// 获取当前节点绑定的表单字段
// provide('loadFormDataModels', loadFormDataModels)
provide('flowChart', () => {
  return ufmValue.value
})

const dialog = useDialog()
const visible = ref(false)
const error = ref<any>({
  visible: false,
  list: [],
})
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
    title: '所属应用',
    name: 'appId',
    control: 'unione-select-box',
    props: {
      required: true
    },
    convert: {
      types: 'local',
      url: '/api/system/appInfo/find',
      labelField: 'name',
      params: {
        category: 'app'
      }
    },
    event: {
      select: (val: any, { option, formValue }: any) => {
        formValue.appName = option.name
      }
    }
  }, {
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
  }, {
    title: '业务字段',
    name: 'busiField',
    control: 'flow-busi-field',
    props: {
      help: '业务字段将在该流程的待办，已办列表中显示，并支持查询'
    },
    view: 'self'
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
          flowChart: {}
        }, true)
      }
      // 提交数据
      message.loading({
        content: '提交中...',
        duration: 3
      })
      data = { ...flowObj.value }
      data.flowChart = '{}'
      axios.flow({
        url: '/api/tmpl/save',
        method: 'POST',
        data
      }).then((res: any) => {
        message.destroy()
        if (res.success) {
          message.success('提交成功')
          if (!flowObj.value.id) {
            flowObj.value.id = res.body
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
          }
          stepsCurrentIndex.value = 1
          emit('refresh')
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
      data = { ...flowObj.value }
      delete data.flowChart
      // 提交数据
      message.loading({
        content: '提交中...',
        duration: 3
      })
      axios.flow({
        url: '/api/tmpl/save',
        method: 'POST',
        data: data
      }).then((res: any) => {
        message.destroy()
        if (res.success) {
          message.success('提交成功')
          stepsCurrentIndex.value = 2
          emit('refresh')
        } else {
          message.error(res.message || '提交失败')
        }
      })
    })
  }
}

/**
 * 发布流程
 */
const loading = ref(false)
function toPublish() {
  error.value = {
    visible: false,
    list: [],
  }
  const flowChart: UFDefine = ufEditor.value.toJSON()
  const nodeMap: any = {}
  flowChart.nodes.forEach((node: any) => {
    nodeMap[node.sn] = node
  })
  const edgeFromMap: any = {}
  const edgeToMap: any = {}
  flowChart.routes.forEach((edge: any) => {
    if (!edgeFromMap[edge.attr?.target?.cell]) {
      edgeFromMap[edge.attr?.target?.cell] = []
    }
    if (edge.attr?.source?.cell) {
      edgeFromMap[edge.attr?.target?.cell].push(edge.attr.source.cell)
    }
    if (!edgeToMap[edge.attr?.source?.cell]) {
      edgeToMap[edge.attr?.source?.cell] = []
    }
    if (edge.attr?.target?.cell) {
      edgeToMap[edge.attr?.source?.cell].push(edge.attr.target.cell)
    }
  })

  const hadLinkStart = (node: any) => {
    if (node.types == 'start') {
      return true
    }
    const froms: any = edgeFromMap[node.sn] || []
    if (froms.length) {
      for (let i = 0; i < froms.length; i++) {
        if (hadLinkStart(nodeMap[froms[i]])) {
          return true
        }
      }
    }
    return false
  }
  const hadLinkEnd = (node: any) => {
    if (node.types == 'end') {
      return true
    }
    const tos: any = edgeToMap[node.sn] || []
    if (tos.length) {
      for (let i = 0; i < tos.length; i++) {
        if (hadLinkEnd(nodeMap[tos[i]])) {
          return true
        }
      }
    }
    return false
  }

  // 节点验证
  flowChart.nodes.forEach((node: any) => {
    // 节点连线验证:开始节点
    if (!hadLinkStart(node)) {
      error.value.list.push({
        node: {
          title: node.title,
          sn: node.sn,
        },
        error: [{
          title: '连线错误',
          message: '节点不再流程图中，请检查连线'
        }]
      })
      return
    }
    // 节点连线验证:结束节点
    if (node.types == 'task' && !hadLinkEnd(node)) {
      error.value.list.push({
        node: {
          title: node.title,
          sn: node.sn,
        },
        error: [{
          title: '连线错误',
          message: '审批节点必须连通结束节点'
        }]
      })
      return
    }

    // 节点属性验证
    const nodeProps = getNodeProps(node.types)
    const result = utils.form.validate(nodeProps, node.data || {})
    if (result.error?.length) {
      error.value.list.push({
        node: {
          sn: node.sn,
          title: node.title
        },
        error: result.error
      })
    } else {
      result.data.title = node.title
      result.data.info = node.info
      nodeMap[node.sn].data = result.data
    }
  })
  // 设置异常信息显示状态
  error.value.visible = error.value.list.length > 0
  if (error.value.visible) {
    return
  }

  loading.value = true
  message.loading({
    content: '发布中...',
  })
  axios.flow({
    url: '/api/tmpl/publish/' + flowObj.value.id,
    method: 'POST',
    data: flowChart
  }).then((res: any) => {
    message.destroy()
    loading.value = false
    if (res.success) {
      flowObj.value.status = 2
      message.success('发布成功')
    } else {
      message.error(res.message || '发布失败')
    }
  })
}
function toUpgrade() {
  if (flowObj.value.status != 2) {
    dialog.warning({
      content: '当前流程未发布，不可升级版本'
    })
    return
  }
  loading.value = true
  message.loading({
    content: '升级中...',
  })
  axios.flow({
    url: '/api/tmpl/upgrad',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: flowObj.value.id
  }).then((res: any) => {
    message.destroy()
    loading.value = false
    if (res.success) {
      flowObj.value.vers++
      flowObj.value.status = 1
      message.success('升级成功')
      emit('refresh')
    } else {
      message.error(res.message || '升级失败')
    }
  })
}

function close() {
  visible.value = false
}
async function open(flow: any) {
  error.value = {
    visible: false,
    list: [],
  }
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

function setActiveNode(sn: string) {
  ufEditor.value.setActiveNode(sn)
}

defineExpose({
  open,
  close
})

</script>
<style lang="less">
.flow-editor {
  height: 100%;
  overflow: hidden !important;

  .ant-modal-title {
    padding: 5px 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;

    .flow-title {
      width: calc(50% - 180px);

      .btn-upgrade {
        font-size: 11px;
        margin-left: 10px;
        cursor: pointer;
      }
    }


    .steps {
      justify-content: center;
      display: flex;

      .ant-steps {
        width: 300px;
      }
    }

    .opts {
      width: calc(50% - 150px);
      text-align: right;

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


  .flow-base-info,
  .flow-setting-info {
    background-color: #f5f5f5;
    padding: 10px;
    display: flex;
    justify-content: center;

    .base-form {
      background-color: #FFFFFF;
      width: 850px;
      height: 100%;
      padding: 20px 30px;
      border-radius: 10px;
      height: calc(100vh - 75px);
      overflow-y: auto;
    }

  }

  .flow-error-card {
    position: fixed;
    top: 0;
    right: 5px;
    width: 400px;
    height: calc(100vh - 50px);
    box-shadow: 0 2px 8px #FDD0D0;

    .ant-card-head {
      background-color: #FDD0D0;
    }

    .title {
      text-align: left;

      .icon {
        color: red;
      }
    }


    .node-error {
      padding: 10px;
      cursor: pointer;
      box-shadow: 0 2px 8px #F2F7FA;

      .title {
        font-size: 14px;
        font-weight: bold;
        padding: 5px 0;
      }

      .error-list {
        .error-item {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 5px;
        }
      }

      .error-list:nth-child(odd) {
        background-color: #e5ebee;
        border-radius: 5px;
      }

    }

    .node-error:hover {
      background-color: #e4e6e7;
      box-shadow: 0 5px 8px #e4e6e7;

      .title {
        color: red;
      }
    }

  }

}
</style>