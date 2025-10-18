<!-- eslint-disable vue/multi-word-component-names -->
<!-- 在线文档管理 -->
<template>
  <div class="unione-page unione-page-list unione-app-doc">

    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="750" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form" :mask-closable="false">
      <unione-form :form="drawer.form" ref="form" v-if="drawer.visible"></unione-form>
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
import { nextTick, ref, computed, onMounted } from 'vue'
import { axios, useDialog } from 'unione-base-vue'
import { useRouter, useRoute, type Router } from 'vue-router'
import { Convertor } from 'unione-form-vue'

const dialog = useDialog()
const route = useRoute()
const router: Router = useRouter()

const stsConvert = new Convertor({ types: 'dict', dictName: 'ONLINEDOCSTS' })
const appId = computed(() => {
  return route.query.appId
})
const appName = computed(() => {
  return route.query.appName
})

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/onlineDoc',
    orderBy: 'lastUpdated desc'
  },
  fields: [
    {
      title: '文档名称',
      name: 'title',
    },
    {
      title: '版本号',
      name: 'versNo'
    },
    {
      title: '图标',
      name: 'icon',
    },
    {
      title: '状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'ONLINEDOCSTS'
      },
      isQuery: true
    },
    {
      title: '发布时间',
      name: 'releaseTime'
    },
    {
      title: '归档时间',
      name: 'archiveTime'
    },
    {
      title: '修改时间',
      name: 'lastUpdated'
    }
  ],
  operation: {
    title: '操作',
    width: 200,
    count: 2,
    btns: ['view',
      {
        name: 'status',
        title: '状态',
        widget: 'dropdown',
        items: [
          {
            name: 'sts-1',
            title: '编制中',
            disabled: ({ row }: any) => {
              return row.status == 1
            }
          },
          {
            name: 'sts-2',
            title: '内审中',
            disabled: ({ row }: any) => {
              return row.status == 2
            }
          },
          {
            name: 'sts-3',
            title: '已发布',
            disabled: ({ row }: any) => {
              return row.status == 3
            }
          },
          {
            name: 'sts-4',
            title: '已归档',
            disabled: ({ row }: any) => {
              return row.status == 4
            }
          }
        ]
      }],
    more: {
      layout: 'vertical'
    }
  }
})

async function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    drawer.value.visible = true
    drawer.value.title = '新增文档'
    drawer.value.placement = 'left'
    drawer.value.row = { appName: appName.value, title: appName.value }
    nextTick(() => {
      form.value.reset()
      form.value.setValue(drawer.value.row)
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑文档'
    drawer.value.placement = 'right'
    drawer.value.row = row
    drawer.value.row.appName = appName.value
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name.startsWith('sts-')) {
    const status = btn.name.split('-')[1]
    const stsLable = await stsConvert.convert(status)
    dialog.confirm({
      content: '确定要设置文档状态为：' + stsLable,
      onOk: () => {
        page.value
          .storage()
          .request({
            url: '/status',
            data: { id: row.id, status }
          })
          .then(() => {
            page.value.reload()
          })
      }
    })
  }
}

const form = ref() //form ref obj
const drawer = ref<any>({
  title: '新增文档',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '应用名称',
        name: 'appName',
        view: 'html'
      },
      {
        title: '文档名称',
        name: 'title',
        required: true
      },
      {
        title: '版本号',
        name: 'versNo',
        required: true
      },
      {
        title: '字体图标',
        name: 'icon',
        control: 'unione-icon-select'
      },
      {
        title: '图片图标(小)',
        name: 'picMix'
      },
      {
        title: '图片图标(中)',
        name: 'picMid'
      },
      {
        title: '图片图标(大)',
        name: 'picMax'
      },
      {
        title: '文档介绍',
        control: 'unione-rich-text',
        view: 'self',
        name: 'profile',
        required: true
      },
      {
        title: '显示顺序',
        name: 'ordered',
        value: 0,
        control: 'a-input-number',
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
      data.appId = appId.value
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

onMounted(() => {
  if (!appId.value) {
    dialog.error('应用ID不能为空')
    router.back()
    return
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
