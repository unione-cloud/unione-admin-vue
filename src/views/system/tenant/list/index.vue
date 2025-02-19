<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-tenant">
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
    controller: '/api/system/tenant'
  },
  fields: [
    {
      title: '租户标识',
      name: 'sn',
      isQuery: true
    },
    {
      title: '租户名称',
      name: 'name',
      isQuery: true
    },
    {
      title: '租户域名',
      name: 'domain',
      isQuery: true
    },
    {
      title: '联系人',
      name: 'linkMan',
      isQuery: true
    },
    {
      title: '联系地址',
      name: 'linkAdd'
    },
    {
      title: '联系电话',
      name: 'linkTel',
      isQuery: true
    },
    {
      title: '所在城市',
      name: 'locationCity'
    },
    {
      title: '所在省份',
      name: 'locationProvince'
    },
    {
      title: '租户状态',
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
    drawer.value.title = '新增租户'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑租户'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
}

const form = ref() //form ref obj
const drawer = ref({
  title: '新增租户',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '租户标识',
        name: 'sn',
        required: true
      },
      {
        title: '租户名称',
        name: 'name',
        required: true
      },
      {
        title: '租户域名',
        name: 'domain'
      },
      {
        title: '系统图标',
        name: 'logo'
      },
      {
        title: '登录图标',
        name: 'loginAd'
      },
      {
        title: '联系人',
        name: 'linkMan'
      },
      {
        title: '联系地址',
        name: 'linkAdd'
      },
      {
        title: '联系电话',
        name: 'linkTel'
      },
      {
        title: '所在城市',
        name: 'locationCity'
      },
      {
        title: '所在省份',
        name: 'locationProvince'
      },
      {
        title: '开户时间',
        name: 'openTime'
      },
      {
        title: '租户状态',
        name: 'status',
        convert: {
          types: 'dict',
          dictName: 'USERSTATUS'
        }
      },
      {
        title: '备注信息',
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
