<!-- eslint-disable vue/multi-word-component-names -->
<!-- 表单设计：列表 -->
<template>
  <div class="unione-page unione-page-list unione-form-design">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick" :params="{ types: 'form' }"></unione-page-list>

    <a-drawer :title="drawer.title" :width="550" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form">
      <a-timeline v-if="drawer.historys?.length > 0">
        <a-timeline-item v-for="item in drawer.historys" :key="item.id">
          <div class="info" @click="drawer.toUseHistory(item)"><span>{{ item.publishDate }}</span> <span
              class="vers">v{{
                item.vers
              }}</span></div>
          <div class="vert">{{ item.vert }}</div>
        </a-timeline-item>
      </a-timeline>
      <a-empty v-else description="暂无历史"></a-empty>
      <template #footer>
        <div class="btns">
          <a-button @click="drawer.visible = false">取消</a-button>
        </div>
      </template>
    </a-drawer>

    <UnioneFormDesign ref="formDesign" :sn="designModal.sn" :title="designModal.title"
      v-model:visible="designModal.visible"></UnioneFormDesign>

    <ResRelease :targetType="drawerRes.targetType" :targetId="drawerRes.targetId" :targetSn="drawerRes.targetSn"
      :title="drawerRes.title" :iconFont="drawerRes.iconFont" v-model:visible="drawerRes.visible"></ResRelease>

    <a-modal :title="releaseModal.title" :width="550" v-model:visible="releaseModal.visible"
      wrapClassName="data-define-release-modal" center>
      <a-form-item label="数据定义">
        <div class="text-label">{{ releaseModal.row?.title }}</div>
      </a-form-item>
      <a-form-item label="版本号">
        <div class="text-label">{{ releaseModal.row?.vers }}</div>
      </a-form-item>
      <a-form-item label="版本说明" required>
        <a-textarea v-model:value="releaseModal.vert" :rows="4" />
      </a-form-item>
      <template #footer>
        <div class="btns">
          <a-button @click="releaseModal.visible = false">取消</a-button>
          <a-button type="primary" @click="releaseModal.doRelease">发布</a-button>
        </div>
      </template>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { type Router } from 'vue-router'
import { axios, useDialog } from 'unione-base-vue'
import { useConfigStore } from '@/config'
import ResRelease from '@/components/res-release/index.vue'

const config = useConfigStore().config
const router: any | Router = inject('router') //useRouter()
const dialog = useDialog()
const page = ref()
const define = ref({
  storage: {
    controller: '/api/data/define',
  },
  fields: [
    {
      title: '应用名称',
      name: 'appName',
      isQuery: true
    },
    {
      title: '数据源',
      name: 'dsName',
      isQuery: true
    },
    {
      title: '表单名称',
      name: 'title',
      isQuery: true
    },
    {
      title: '表单编码',
      name: 'sn',
      isQuery: true
    },
    {
      title: '版本号',
      name: 'vers',
    },
    {
      title: '同步标志',
      name: 'syncFlag',
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      },
      isQuery: true
    },
    {
      title: '发布状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'PUBLISHSTATUS'
      },
      isQuery: true
    },
    {
      title: '发布日期',
      name: 'publishDate'
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
    width: 250,
    btns: [
      {
        title: '预览',
        name: 'view'
      },
      {
        title: '发布',
        name: 'release',
        props: {
          ghost: true,
          type: 'primary'
        }
      },
      {
        title: '版本管理',
        name: 'vers'
      },
      // {
      //   title: '配置管理',
      //   name: 'configs'
      // },
      {
        title: '权限管理',
        name: 'permis'
      },
      // {
      //   title: '权限分配',
      //   name: 'auth'
      // },
      // {
      //   title: '复制',
      //   name: 'copy'
      // }
      {
        name: 'menu',
        title: '菜单管理',
      },
    ],
    count: 3,
    more: {
      layout: 'vertical'
    }
  }
})

function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add' || btn.name == 'edit') {
    designModal.value.sn = row ? row.sn : ''
    designModal.value.title = row ? row.title : '新建表单'
    designModal.value.visible = true
  }
  if (btn.name == 'vers') {
    drawer.value.visible = true
    drawer.value.title = '版本管理'
    drawer.value.placement = 'right'
    drawer.value.define = row
    drawer.value.loadHistorys(row)
  }
  if (btn.name == 'release') {
    releaseModal.value.row = row
    releaseModal.value.visible = true
    releaseModal.value.vert = ''
  }
  if (btn.name == 'view') {
    router.push({
      path: config.listPageUrl,
      query: {
        psn: row.sn + ':list',
        model: 'preview'
      }
    })
  }
  if (btn.name == 'menu') {
    drawerRes.value.targetType = 'form'
    drawerRes.value.targetId = row.id
    drawerRes.value.targetSn = row.sn
    drawerRes.value.title = row.title
    drawerRes.value.iconFont = row.iconFont
    drawerRes.value.visible = true
  }
}

const drawer = ref<any>({
  title: '版本管理',
  placement: 'right',
  visible: false,
  define: null,
  historys: {},
  loadHistorys: (row: any) => {
    axios.admin({
      url: '/api/data/define/his/find',
      method: 'post',
      data: {
        body: {
          defineId: row.id
        },
        sorts: [{ name: 'publishDate', asc: false }]
      }
    }).then((result: any) => {
      if (result.success) {
        drawer.value.historys = result.body
      } else {
        dialog.error({
          title: '加载版本失败',
          content: result.body
        })
      }
    })
  },
  toUseHistory: ((his: any) => {
    if (drawer.value.define.vers == his.vers) {
      dialog.error({
        content: '版本一致，不需要切换'
      })
      return
    }
    dialog.confirm({
      content: '确定要切换到该版本么？',
      onOk: () => {
        axios.form({
          url: '/api/data/define/revert',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: his.id
        }).then((result: any) => {
          if (result.success) {
            page.value.reload()
            dialog.confirm({
              content: '切换成功，是否进入表单设计页面？',
              onOk: () => {
                designModal.value.sn = drawer.value.define.sn
                designModal.value.title = drawer.value.define.title
                designModal.value.visible = true
                drawer.value.visible = false
              },
              onCancel: () => {
                drawer.value.visible = false
              }
            })
          } else {
            dialog.error({
              content: result.body
            })
          }
        })
      }
    })
  })
})

const drawerRes = ref({
  visible: false,
  targetType: '',
  targetId: '',
  targetSn: '',
  title: '',
  iconFont: ''
})

const designModal = ref({
  visible: false,
  sn: '',
  title: '表单设计',
})

const releaseModal = ref<any>({
  visible: false,
  title: '发布表单',
  row: {},
  vert: '',
  doRelease: () => {
    if (!releaseModal.value.vert) {
      dialog.error('请输入版本说明')
      return
    }
    axios.admin({
      url: '/api/data/define/release',
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        id: releaseModal.value.row.id,
        vert: releaseModal.value.vert
      }
    }).then((result: any) => {
      if (result.success) {
        releaseModal.value.visible = false
        dialog.success({
          title: '发布成功',
          content: result.body
        })
        page.value.reload()
      } else {
        dialog.error({
          title: '发布失败',
          content: result.body
        })
      }
    })
  }
})

</script>

<style scoped lang="less">
.drawer-form {
  .info {
    cursor: pointer;

    .vers {
      margin-left: 10px;
    }
  }

  .vert {
    color: #999;
  }

  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }
}
</style>

<style lang="less">
.data-define-release-modal {
  .ant-form-item {
    margin-bottom: 10px;
  }
}
</style>