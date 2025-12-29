<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-flow-tmpl">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="400" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-flow-history" :mask-closable="false">

      <a-list :dataSource="drawer.list">
        <template #renderItem="{ item, index }">
          <a-list-item class="flow-ver">
            <a-list-item-meta :description="item.descs">
              <template #title>
                {{ index + 1 }}. {{ item.lastUpdated }}<a-tag color="blue" size="small" style="margin-left: 5px;">v{{
                  item.vers
                }}</a-tag>
              </template>
            </a-list-item-meta>
            <template #extra>
              <a-button size="small" @click="drawer.toRun(item)">发起流程</a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>

      <template #footer>
        <div class="btns">
          <a-button @click="drawer.visible = false">关闭</a-button>
        </div>
      </template>
    </a-drawer>
    <Editor ref="editor" @refresh="refresh"></Editor>
  </div>
</template>

<script setup lang="ts">
import { axios, useDialog } from 'unione-base-vue'
import { ref } from 'vue'
import { useRouter, type Router } from 'vue-router'
import Editor from './editor.vue'

const dialog = useDialog()
const router: Router = useRouter()

const page = ref()
const editor = ref()
const define = ref({
  storage: {
    ctx: 'flow',
    controller: '/api/tmpl'
  },
  fields: [
    {
      title: '应用名称',
      name: 'appName',
      isQuery: true
    },
    {
      title: '流程标题',
      name: 'title',
      isQuery: true
    },
    {
      title: '流程编码',
      name: 'sn',
      isQuery: true
    },
    {
      title: '流程版本',
      name: 'vers'
    },
    {
      title: '流程分类',
      name: 'category',
      convert: {
        types: 'dict',
        dictName: 'FLOWLITECATEGORY'
      },
      isQuery: true
    },
    {
      title: '流程状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'FLOWLITEPUBLISHSTS'
      },
      isQuery: true
    },
    {
      title: '创建时间',
      name: 'created'
    },
    {
      title: '修改时间',
      name: 'lastUpdated',
      sort: {
        enable: true,
        asc: false,
        defoult: true
      }
    }
  ],
  operation: {
    title: '操作',
    width: 260,
    btns: [
      'view',
      {
        name: 'vers',
        title: '版本管理'
      },
      {
        name: 'sts-3',
        title: '下架',
        event: {
          disable: ({ row }: any) => {
            return row.status != 2
          }
        }
      },
      {
        name: 'run',
        title: '发起流程',
        event: {
          disable: ({ row }: any) => {
            return row.status != 2
          }
        }
      },
      {
        name: 'mine',
        title: '我的流程',
        event: {
          disable: ({ row }: any) => {
            return row.status != 2
          }
        }
      },
      {
        name: 'todo',
        title: '待办列表',
        event: {
          disable: ({ row }: any) => {
            return row.status != 2
          }
        }
      },
      {
        name: 'done',
        title: '已办列表',
        event: {
          disable: ({ row }: any) => {
            return row.status != 2
          }
        }
      },
      {
        name: 'menu',
        title: '菜单管理',
        event: {
          disable: ({ row }: any) => {
            return row.status != 2
          }
        }
      },
    ],
    count: 3,
    more: {
      layout: 'vertical'
    }
  }
})

async function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    editor.value.open()
  }
  if (btn.name == 'edit') {
    editor.value.open(row)
  }
  if (btn.name == 'vers') {
    drawer.value.visible = true
    drawer.value.load(row)
  }
  if (btn.name == 'mine') {
    router.push({
      path: '/dev/flow/mine',
      query: {
        fsn: row.sn,
      }
    })
  }
  if (btn.name == 'run') {
    router.push({
      path: '/dev/flow/run',
      query: {
        fsn: row.sn,
        fmd: 'start'
      }
    })
  }
  if (btn.name == 'todo') {
    router.push({
      path: '/dev/flow/todo',
      query: {
        fsn: row.sn,
      }
    })
  }
  if (btn.name == 'done') {
    router.push({
      path: '/dev/flow/done',
      query: {
        fsn: row.sn,
      }
    })
  }
  if (btn.name.startsWith('sts-3')) {
    dialog.confirm({
      content: '确定要下架该流程么？',
      onOk: () => {
        page.value
          .storage()
          .request({
            url: '/status',
            data: { id: row.id, status: 3 }
          })
          .then(() => {
            page.value.reload()
          })
      }
    })
  }
}

const drawer = ref({
  title: '流程版本',
  placement: 'right',
  visible: false,
  list: [],
  load: (row: any) => {
    drawer.value.list = []
    axios.flow({
      url: '/api/tmpl/vers',
      method: 'post',
      data: {
        body: {
          tmplId: row.id
        },
        page: 1,
        pageSize: 1000,
        sorts: [{ name: 'lastUpdated', asc: false }]
      }
    }).then((res: any) => {
      drawer.value.list = res.body
    })
  },
  toRun: (item: any) => {
    router.push({
      path: '/dev/flow/run',
      query: {
        fsn: item.sn,
        fmd: 'start',
        vers: item.vers
      }
    })
  }
})

function refresh() {
  page.value.reload()
}

</script>

<style lang="less">
.drawer-flow-history {
  .flow-ver {
    align-items: start !important;
  }

  .btns {
    text-align: right;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }
}
</style>
