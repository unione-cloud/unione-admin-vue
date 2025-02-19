<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-apps">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer
      :title="drawer.title"
      :width="550"
      v-model:visible="drawer.visible"
      :placement="drawer.placement"
      class="drawer-form"
    >
      <unione-form :form="drawer.form" ref="form"></unione-form>

      <div class="btns">
        <a-button type="primary" @click="drawer.tosave">保存</a-button>
        <a-button @click="drawer.visible = false">取消</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/appInfo'
  },
  fields: [
    {
      title: '应用名称',
      name: 'name',
      isQuery: true
    },
    {
      title: '应用编码',
      name: 'sn',
      isQuery: true
    },
    {
      title: '微应用',
      name: 'isMp',
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      },
      isQuery: true
    },
    {
      title: '应用URL',
      name: 'url'
    },
    {
      title: '首页URL',
      name: 'welcome'
    },
    {
      title: '版本号',
      name: 'versNo'
    },
    {
      title: '版本说明',
      name: 'versDesc'
    },
    {
      title: '字体图标',
      name: 'icon'
    },
    {
      title: '平台应用',
      name: 'isPlatform',
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      },
      isQuery: true
    },
    {
      title: '状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'USERSTATUS'
      },
      isQuery: true
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
    width: 175,
    btns: [
      {
        name: 'view',
        visible: false
      },
      {
        name: 'status',
        title: (row: any) => {
          return row.status == 1 ? '禁用' : '启用'
        }
      }
    ],
    count: 4,
    more: {
      layout: 'vertical'
    }
  }
})

function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    drawer.value.visible = true
    drawer.value.title = '新增应用'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑应用'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
}

const form = ref() //form ref obj
const drawer = ref({
  title: '新增应用',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '应用名称',
        name: 'name',
        required: true
      },
      {
        title: '应用编码',
        name: 'sn',
        required: true
      },
      {
        title: '微应用',
        name: 'isMp',
        control: 'unione-select-box',
        value: '0',
        convert: {
          types: 'dict',
          dictName: 'TUREORFALSE'
        }
      },
      {
        title: '应用URL',
        name: 'url',
        required: true
      },
      {
        title: '首页URL',
        name: 'welcome'
      },
      {
        title: '版本号',
        name: 'versNo',
        required: true
      },
      {
        title: '版本说明',
        name: 'versDesc'
      },
      {
        title: '字体图标',
        name: 'icon'
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
        title: '平台应用',
        name: 'isPlatform',
        control: 'unione-select-box',
        value: '0',
        convert: {
          types: 'dict',
          dictName: 'TUREORFALSE'
        }
      },
      {
        title: '状态',
        name: 'status',
        control: 'unione-switch-box',
        convert: {
          types: 'dict',
          dictName: 'USERSTATUS'
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
