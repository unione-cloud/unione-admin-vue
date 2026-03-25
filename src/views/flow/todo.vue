<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <UnionePage class="unione-flow-todo" setting-title="页面设置" :engine="engine">
    <template v-for="item in widgets" :key="item.wid">
      <component :is="item.widget" :wid="item.wid" :widget="item" :engine="engine" @btnClick="btnClick"
        v-if="item.widget == 'unione-table'" ref="table"></component>
      <component v-else :is="item.widget" :wid="item.wid" :widget="item" :engine="engine" @btnClick="btnClick">
      </component>
    </template>

    <!-- 页面设置 -->
    <template #page-setting v-if="engine">
      <UnionePageSetting :engine="engine"></UnionePageSetting>
    </template>


    <UnioneFlowOpinion ref="opinion"></UnioneFlowOpinion>
    <a-drawer :title="auditDrawer.title" v-model:visible="auditDrawer.visible" :width="600"
      rootClassName="flow-audit-drawer">
      <UnioneFlowAudit ref="audit" @success="handleAuditSuccess" show="drawer"></UnioneFlowAudit>
      <template #footer>
        <a-button type="primary" @click="auditDrawer.commit('submit', true)">同意</a-button>
        <a-button danger @click="auditDrawer.commit('submit', false)">拒绝</a-button>
        <a-button type="primary" danger @click="auditDrawer.commit('reject', false)">驳回</a-button>
      </template>
    </a-drawer>

  </UnionePage>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import { UnionePage, UnionePageSetting, UFEngine, Convertor } from 'unione-form-vue'


import { axios, useDialog, useSession, utils } from 'unione-base-vue'
import type { ButtonSetting, PageDefine } from 'unione-form-vue/dist/typing'
import { useRoute, useRouter } from 'vue-router'
import UnioneFlowAudit from './comps/audit.vue'
import UnioneFlowOpinion from './comps/opinion.vue'

const dialog = useDialog()
const session = useSession()
const route = useRoute()
const router = useRouter()
const dictStatus = new Convertor({
  types: 'dict',
  dictName: 'FLOWLITETASKSTATUS'
})

// 组件属性定义
const props = defineProps({
  psn: {
    type: String,
    required: false
  },
  params: {
    type: Object,
    default() {
      return {}
    }
  },
  // 流程编码,如果为空，则是通用待办列表
  fsn: {
    type: String,
    required: false,
  },
  vers: {
    type: Number,
    required: false
  },
  queryBtns: {
    type: Array<PropType<ButtonSetting>>,
    required: false
  },
  operation: {
    type: Object as PropType<Object | Boolean>,
    required: false
  },
  leftBtns: {
    type: Object as PropType<Array<PropType<ButtonSetting>> | Boolean>,
    required: false
  },
  rightBtns: {
    type: Object as PropType<Array<PropType<ButtonSetting>> | Boolean>,
    required: false
  }
})

// 列表组件对象
const table = ref<any>(null)
const audit = ref<any>(null)
const opinion = ref<any>(null)
const auditDrawer = ref<any>({
  visible: false,
  title: '',
  commit: (action: string, flag: boolean) => {
    audit.value.commit(action, flag)
  }
})

const flowSn = computed(() => {
  return props.fsn || route.query.fsn || ''
})
const flowVers = computed(() => {
  return props.vers || route.query.vers || ''
})

// 页面定义对象
const define: PageDefine = {
  sn: 'new_',
  title: '我的待办',
  types: 'code',
  vers: 1,
  configs: {
    widgets: [
      {
        widget: 'unione-query',
        dsn: 'primary',
        primary: true,
        fields: [{
          title: '接收时间',
          name: 'time',
          widget: 'a-range-picker',
          props: {
            showTime: true,
            format: 'YYYY-MM-DD HH:mm:ss',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            placeholder: ['开始时间', '结束时间']
          }
        }]
      },
      {
        widget: 'unione-table',
        dsn: 'primary',
        columns: [{
          title: '流程类别',
          name: 'instance.category',
          convert: {
            types: 'dict',
            dictName: 'FLOWLITECATEGORY'
          },
        }, {
          title: '流程名称',
          name: 'instance.title',
        }, {
          title: '提交人',
          name: 'instance.commitUserName',
        }, {
          title: '提交时间',
          name: 'instance.commitTime',
        }, {
          title: '节点名称',
          name: 'title',
        }, {
          title: '接收时间',
          name: 'created',
          sort: {
            enable: true,
            asc: false,
            defoult: true
          }
        }, {
          title: '处理状态',
          name: 'handleStatus',
          customCell: (record: any, index: number, column: any) => {
            dictStatus.convert(record.status).then((label: string) => {
              const labels: any = []
              if (label) {
                labels.push(label)
              }
              if (record.handleUserId) {
                labels.push('已签收')
              }
              if (labels.length > 0) {
                record[column.dataIndex] = labels.join('/')
              }
            })
          }
        }],
        leftBtns: ['delBatch', {
          name: 'add',
          title: '发起流程',
          type: 'primary',
          event: {
            visible: (ctx: any) => {
              return !!flowSn.value
            },
          }
        }, {
            title: '批量审核',
            name: 'auditBatch',
            type: 'primary',
            props: {
              danger: true
            }
          }, {
            title: '批量签收',
            name: 'signBatch',
          }, {
            title: '批量放弃',
            name: 'waiveBatch',
            props: {
              danger: true
            }
          }],
        rightBtns: ['impData', 'downTmpl'],
        operation: {
          title: '操作',
          width: 300,
          btns: ['edit', 'delete', {
            title: '签收',
            name: 'sign',
            event: {
              visible: (ctx: any) => {
                return !ctx.row.handleUserId
              },
            }
          }, {
              title: '放弃',
              name: 'waive',
              props: {
                danger: true
              },
              event: {
                visible: (ctx: any) => {
                  return !!ctx.row.handleUserId
                },
              }
            }, {
              title: '办理',
              name: 'handle',
              type: 'primary',
            }, {
              title: '意见',
              name: 'opinion',
            }, {
              title: '审核',
              name: 'audit',
              type: 'primary',
            }],
          count: 5,
          more: {
            layout: 'vertical'
          }
        }
      }
    ],
    dsnList: ['primary']
  },
  component: 'unione-flow-todo'
}
function processDefine() {
  // 加载流程定义
  axios.flow({
    url: `/api/engine/profile/${flowSn.value}${flowVers.value ? ('/' + flowVers.value) : ''}`,
    method: 'post'
  }).then((res: any) => {
    // console.log('loaded flow tmpl info', res)
    if (res.success) {
      const busiField = res.body.busiField
      if (busiField) {
        busiField.forEach((field: any) => {
          if (field.visible == false) {
            return
          }
          if (field.index != null && field.index != undefined) {
            define.configs.widgets[1].columns.splice(field.index, 0, {
              title: field.title,
              name: 'instance.busiData.' + field.name,
            })
          } else {
            define.configs.widgets[1].columns.push({
              title: field.title,
              name: 'instance.busiData.' + field.name,
            })
          }
        })
      }
      session.setStorage('page-define-flow-todo:' + flowSn.value, JSON.stringify(define.configs))
      engine.load(pagesn.value, define)
    }
  })
}

const engine = new UFEngine()
const widgets = computed(() => {
  return engine.$widgetList.value || []
})

const emit = defineEmits(['btnClick'])
function btnClick(e: any) {
  const { btn, row, keys } = e;
  if (btn.name == 'add' && flowSn.value) {
    router.push({
      path: '/dev/flow/run',
      query: {
        fsn: flowSn.value,
        fmd: 'start',
      }
    })
    return
  }
  if (btn.name == 'audit') {
    auditDrawer.value.visible = true
    auditDrawer.value.title = row?.title || '审核'
    nextTick(() => {
      audit.value.init(row ? row.id : keys, { fsn: row?.instance?.sn, nsn: row?.sn, ntitle: row?.title })
    })
  }
  if (btn.name == 'auditBatch') {
    auditDrawer.value.visible = true
    auditDrawer.value.title = '批量审核'
    nextTick(() => {
      audit.value.init(keys, { ntitle: '批量审核' })
    })
  }
  if (btn.name == 'sign') {
    toSignTask(row.id)
  }
  if (btn.name == 'signBatch') {
    if (keys.length == 0) {
      dialog.warning('请选择要签收的任务')
      return
    }
    toSignTask(keys)
  }
  if (btn.name == 'waive') {
    toWaiveTask(row.id)
  }
  if (btn.name == 'waiveBatch') {
    if (keys.length == 0) {
      dialog.warning('请选择要放弃的任务')
      return
    }
    toWaiveTask(keys)
  }
  if (btn.name == 'opinion') {
    // opinion.value.open({flowId:row.instance.id})
    // opinion.value.open({taskId:row.id})
    opinion.value.open({ busiKey: row.instance.busiKey })
  }
  if (btn.name == 'view') {
    router.push({
      path: '/dev/flow/run',
      query: {
        fsn: row.instance.fsn,
        fmd: 'view',
        fid: row.instance.id,
      }
    })
  }
  if (btn.name == 'handle') {
    router.push({
      path: '/dev/flow/run',
      query: {
        fsn: row.instance.fsn,
        fmd: 'run',
        fid: row.instance.id,
      }
    })
  }

  emit('btnClick', e)
}

function toSignTask(tids: string | Array<string>) {
  const data: any = {}
  if (Array.isArray(tids)) {
    data.taskIds = tids
  } else {
    data.taskId = tids
  }
  dialog.confirm({
    content: '确定签收吗？',
    onOk: () => {
      axios.flow({
        url: `/api/engine/task/sign`,
        method: 'post',
        data
      }).then((res: any) => {
        if (res.success) {
          dialog.success('签收成功')
          reload()
        } else {
          dialog.error(res.msg)
        }
      })
    }
  })
}

function toWaiveTask(tids: string | Array<string>) {
  const data: any = {}
  if (Array.isArray(tids)) {
    data.taskIds = tids
  } else {
    data.taskId = tids
  }
  dialog.confirm({
    content: '确定签收吗？',
    onOk: () => {
      axios.flow({
        url: `/api/engine/task/waive`,
        method: 'post',
        data
      }).then((res: any) => {
        if (res.success) {
          dialog.success('操作成功')
          reload()
        } else {
          dialog.error(res.msg)
        }
      })
    }
  })
}

function handleAuditSuccess() {
  reload()
  auditDrawer.value.visible = false
}

const pagesn = ref<any>('new_')
onMounted(() => {

  const route: any = inject('route')
  console.log('unione flow todo route', route)
  pagesn.value = props.psn || route?.query?.psn || route?.meta?.psn || 'new_'
  console.log('unione flow todo psn:' + pagesn.value)

  engine.setModel(route?.query?.model || route?.meta?.model || 'run')
  const params = { ...(props.params || {}), ...(route?.query || {}), ...(route?.params || {}) }
  engine.dataManager().params(params)

  if (props.leftBtns && Array.isArray(props.leftBtns)) {
    define.configs.widgets[1].leftBtns = [...define.configs.widgets[1].leftBtns, ...props.leftBtns]
  }
  if (props.rightBtns && Array.isArray(props.rightBtns)) {
    define.configs.widgets[1].rightBtns = [...define.configs.widgets[1].rightBtns, ...props.rightBtns]
  }
  if (props.operation && typeof props.operation === 'object') {
    define.configs.widgets[1].operation = { ...define.configs.widgets[1].operation, ...props.operation }
  }

  engine.dataManager().use('primary', 'list').store({
    ctx: 'flow',
    controller: '/api/engine/task',
    findUrl: '/todo',
    findParams: [{ name: 'fsn', value: flowSn.value }]
  })

  if (flowSn.value) {
    processDefine()
  } else {
    engine.load(pagesn.value, define)
  }

})

// eslint-disable-next-line vue/no-dupe-keys
function storage() {
  return engine.dataManager().use('primary', 'list')
}
function reload(params?: any) {
  clearSelected()
  if (params) {
    engine.ebus.$emit('table-list-search', params)
  } else {
    engine.ebus.$emit('table-list-reload')
  }
}

function setParams(params: any) {
  engine.dataManager().params(params)
  engine.ebus.$emit('query-form-params', params)
  engine.ebus.$emit('table-list-search', { params })
}

function getTable() {
  return table.value ? table.value[0] : null
}
function getSelected() {
  return table.value ? table.value[0].getSelected() : null
}
function clearSelected() {
  if (table.value) {
    table.value[0].clearSelected(true)
  }
}

defineExpose({ storage, engine, reload, setParams, getTable, getSelected, clearSelected })
</script>

<style lang="less">
.flow-audit-drawer {
  .handel-opinion {
    .ant-input {
      min-height: 400px;
    }
  }
}
</style>
