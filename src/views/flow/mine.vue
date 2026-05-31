<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <UnionePage class="unione-flow-mine" setting-title="页面设置" :engine="engine">

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

  </UnionePage>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import { UnionePage, UnionePageSetting, UFEngine, Convertor } from 'unione-form-vue'


import { axios, useDialog, useSession, utils } from 'unione-base-vue'
import type { ButtonSetting, PageDefine } from 'unione-form-vue/dist/typing'
import { useRoute, useRouter } from 'vue-router'
import UnioneFlowOpinion from './comps/opinion.vue'

const dialog = useDialog()
const session = useSession()
const route = useRoute()
const router = useRouter()
const dictStatus = new Convertor({
  types: 'dict',
  dictName: 'FLOWLITESTATUS'
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
const opinion = ref<any>(null)

const flowSn = computed(() => {
  return props.fsn || route.query.fsn || ''
})
const flowVers = computed(() => {
  return props.vers || route.query.vers || ''
})

// 页面定义对象
const define: PageDefine = {
  sn: 'new_',
  title: '我的流程',
  types: 'code',
  vers: 1,
  configs: {
    widgets: [
      {
        widget: 'unione-query',
        dsn: 'primary',
        primary: true,
        fields: [{
          title: '发起时间',
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
          name: 'category',
          convert: {
            types: 'dict',
            dictName: 'FLOWLITECATEGORY'
          },
        }, {
          title: '流程名称',
          name: 'title',
        }, {
          title: '提交时间',
          name: 'commitTime',
          sort: {
            enable: true,
            asc: false,
            defoult: true
          }
        }, {
          title: '当前节点',
          name: 'node',
          customCell: (record: any) => {
            if (record.runs) {
              record.node = record.runs.map((run: any) => run.title).join('/')
            } else {
              record.node = '结束'
            }
          }
        }, {
          title: '流程状态',
          name: 'status',
          convert: {
            types: 'dict',
            dictName: 'FLOWLITESTATUS'
          },
        }],
        leftBtns: false,
        rightBtns: ['impData', 'downTmpl'],
        operation: {
          title: '操作',
          width: 180,
          btns: ['edit', 'delete', {
            title: '流程意见',
            name: 'opinion',
          }],
          count: 2,
          more: {
            layout: 'vertical'
          }
        }
      }
    ],
    dsnList: ['primary']
  },
  component: 'unione-flow-mine'
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
              name: 'busiData.' + field.name,
            })
          } else {
            define.configs.widgets[1].columns.push({
              title: field.title,
              name: 'busiData.' + field.name,
            })
          }
        })
      }
      session.setStorage('page-define-flow-done:' + flowSn.value, JSON.stringify(define.configs))
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
  if (btn.name == 'opinion') {
    opinion.value.open({ busiKey: row.busiKey })
  }
  if (btn.name == 'view') {
    router.push({
      path: '/dev/flow/run',
      query: {
        fsn: row.sn,
        fmd: 'view',
        fid: row.id,
      }
    })
  }
  emit('btnClick', e)
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
    controller: '/api/engine/instance',
    findUrl: '/mine',
    findParams: [{ name: 'sn', value: flowSn.value }]
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
