<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-schedule-task">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="650" :mask-closable="false" v-model:visible="drawer.visible"
      :placement="drawer.placement" class="drawer-form">
      <unione-form :form="drawer.form" ref="form"></unione-form>

      <template #footer>
        <div class="btns">
          <a-button type="primary" @click="drawer.tosave">保存</a-button>
          <a-button @click="drawer.visible = false">取消</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { axios } from 'unione-base-vue'
import { nextTick, ref } from 'vue'
import { useRouter, type Router } from 'vue-router'


const router: Router = useRouter()
const page = ref()
const define = ref({
  storage: {
    ctx: 'job',
    controller: '/api/task'
  },
  fields: [
    {
      title: '任务标题',
      name: 'title',
      isQuery: true
    },
    {
      title: 'cron表达式',
      name: 'cron',
      isQuery: true
    },
    {
      title: '任务状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'USEORNOT'
      },
      isQuery: true
    },
    {
      title: '描述',
      name: 'descs',
    },
    {
      title: '创建时间',
      name: 'created'
    },
    {
      title: '修改时间',
      name: 'lastUpdated'
    }
  ],
  operation: {
    title: '操作',
    width: 190,
    btns: [
      {
        name: 'view',
        visible: false
      },
      {
        name: 'status',
        title: (row: any) => {
          return row.status == 1 ? '停用' : '启用'
        }
      },
    ],
    count: 2,
    more: {
      layout: 'vertical'
    }
  }
})

function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    drawer.value.visible = true
    drawer.value.title = '新增任务'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑任务'
    drawer.value.placement = 'right'
    axios.job({
      url: '/api/task/detail',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: row.id,
    }).then((res: any) => {
      if (res.success) {
        drawer.value.row = res.body
        form.value.setValue(drawer.value.row)
      }
    })
  }
}

const form = ref() //form ref obj
const drawer = ref({
  title: '新增任务',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '任务标题',
        name: 'title',
        required: true,
      },
      {
        title: 'cron表达式',
        name: 'cron',
        required: true,
      },
      {
        title: '执行器',
        name: 'exeId',
        required: true,
        control: 'unione-select-box',
        convert: {
          types: 'local',
          ctx: 'job',
          url: '/jobgroup/pageList',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          params: {
            appname: '',
            title: '',
            start: 0,
            length: 10
          },
          process: (data: any, opt: string) => {
            if (opt == 'request') {
              data.title = data.keywords || ''
              data.start = 0
              data.length = 10
              data.appname = ''
              delete data.body
            }
            if (opt == 'response') {
              data.body = data.data || []
              data.success = true
            }
            console.log('job group data', data)
          },
          labelField: 'title',
          search: true
        },
        event: {
          visible: (val: any, formValue: any) => {
            return formValue.runScript?.type != 'script'
          }
        }
      },
      {
        title: '任务类型',
        name: 'runScript.type',
        control: 'unione-select-box',
        value: 'sql',
        convert: {
          types: 'dict',
          dictName: 'TASKSCRIPTYPE'
        },
      },
      {
        title: '数据源',
        name: 'runScript.dsId',
        required: true,
        control: 'unione-select-box',
        convert: {
          types: 'local',
          url: '/api/data/source/find',
          labelField: 'title',
          search: true
        },
        event: {
          visible: (val: any, formValue: any) => {
            return formValue.runScript?.type != 'script'
          }
        }
      },
      {
        title: '任务脚本',
        control: 'unione-code-editor',
        props: {
          lang: 'javascript'
        },
        name: 'runScript.script',
        required: true,
        event: {
          visible: (val: any, formValue: any) => {
            return formValue.runScript?.type == 'script'
          }
        }
      },
      {
        title: 'SQL',
        control: 'unione-code-editor',
        props: {
          lang: 'sql'
        },
        name: 'runScript.sql',
        required: true,
        event: {
          visible: (val: any, formValue: any) => {
            return formValue.runScript?.type == 'sql'
          }
        }
      },
      {
        title: '任务处理',
        control: 'JobTaskHandleScript',
        name: 'handleSript',
      },
      {
        title: '任务状态',
        name: 'status',
        control: 'unione-select-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'USEORNOT'
        }
      },
      {
        title: '备注',
        control: 'a-textarea',
        name: 'descs'
      }
    ],
    setting: {
      showColumn: 1,
      labelWidth: 5
    }
  },
  tosave: () => {
    form.value.validate().then((data: any) => {
      data = {
        ...drawer.value.row,
        ...data
      }
      page.value
        .storage()
        .save({ data })
        .then(() => {
          drawer.value.visible = false
          page.value.reload()
        })
    })
  }
})
</script>

<style scoped lang="less">
.drawer-form {
  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }
}
</style>
