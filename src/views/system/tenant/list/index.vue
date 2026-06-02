<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-tenant">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="550" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form">
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
import { useDialog } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'

const dialog = useDialog()
const stsConvert = new Convertor({ types: 'dict', dictName: 'TENANTSTATUS' })

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
        dictName: 'TENANTSTATUS'
      },
      isQuery: true
    },
    {
      title: '开始时间',
      name: 'timeLimitStart'
    },
    {
      title: '过期时间',
      name: 'timeLimitEnd'
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
        title: '状态',
        widget: 'dropdown',
        items: [
          {
            name: 'sts-1',
            title: '试用',
            disabled: ({ row }: any) => {
              return row.status == 1
            }
          },
          {
            name: 'sts-2',
            title: '开通',
            disabled: ({ row }: any) => {
              return row.status == 2
            }
          },
          {
            name: 'sts-3',
            title: '关闭',
            disabled: ({ row }: any) => {
              return row.status == 3
            }
          }
        ]
      }
    ],
    count: 4,
    more: {
      layout: 'vertical'
    }
  }
})

async function btnClick({ btn, event, row, keys }: any) {
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
  if (btn.name.startsWith('sts-')) {
    const status = btn.name.split('-')[1]
    const stsLable = await stsConvert.convert(status)
    dialog.confirm({
      content: '确定要设置租户状态为：' + stsLable,
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
      // {
      //   title: '租户logo',
      //   name: 'logo',
      //   control: 'unione-upload-box',
      //   props: {
      //     accept: 'image/*',
      //     listType: 'picture-card',
      //     limit: 1,
      //     valueType: 'string',
      //     bucket: 'system'
      //   }
      // },
      // {
      //   title: '登录图标',
      //   name: 'loginAd',
      //   control: 'unione-upload-box',
      //   props: {
      //     accept: 'image/*',
      //     listType: 'picture-card',
      //     limit: 1,
      //     valueType: 'string',
      //     bucket: 'system'
      //   }
      // },
      {
        title: '联系人',
        name: 'linkMan',
        required: true
      },
      {
        title: '联系电话',
        name: 'linkTel',
        required: true
      },
      {
        title: '所在省份',
        name: 'locationProvince'
      },
      {
        title: '所在城市',
        name: 'locationCity'
      },
      {
        title: '联系地址',
        name: 'linkAdd'
      },
      {
        title: '租户配置',
        widget: 'unione-section',
        props: {
          type: 'line'
        }
      },
      {
        title: '租户状态',
        name: 'status',
        control: 'unione-radio-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'TENANTSTATUS'
        }
      },
      {
        title: '最大机构数',
        name: 'maxOrganCount',
        control: 'a-input-number'
      },
      {
        title: '最大用户数',
        name: 'maxUserCount',
        control: 'a-input-number'
      },
      {
        title: '最大在线用户',
        name: 'maxUserOnline',
        control: 'a-input-number'
      },
      {
        title: '开始时间',
        name: 'timeLimitStart',
        control: 'a-date-picker',
        props: {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD'
        }
      },
      {
        title: '到期时间',
        name: 'timeLimitEnd',
        control: 'a-date-picker',
        props: {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD'
        }
      },
      {
        title: '角色',
        name: 'roleList',
        control: 'unione-role-input',
        value: 'TENANT-ADMIN,FORM-DEV',
        event: {
          visible: (value: any, formValue: any) => {
            return !formValue.id
          }
        }
      },
      {
        title: '备注信息',
        name: 'descs',
        control: 'a-textarea'
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
        ...data,
        registeWay: 2
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
