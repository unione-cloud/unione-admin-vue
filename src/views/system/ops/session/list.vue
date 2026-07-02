<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-session">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>
  </div>
</template>

<script setup lang="ts">
import { axios, useDialog } from 'unione-base-vue'
import { nextTick, ref } from 'vue'

const dialog = useDialog()
const page = ref()
const define = ref({
  storage: {
    controller: '/api/session',
    findUrl: '/list'
  },
  fields: [
    {
      title: '租户名称',
      name: 'tenantName',
    },
    {
      title: '机构名称',
      name: 'orgName',
    },
    {
      title: '用户帐号',
      name: 'userName',
    },
    {
      title: '用户姓名',
      name: 'realName',
    },
    {
      title: 'IP地址',
      name: 'ipAddr',
    },
    {
      title: '操作系统',
      name: 'os',
    },
    {
      title: '设备类型',
      name: 'device',
    },
    {
      title: '所在城市',
      name: 'ipCity',
    },
    {
      title: '登录时间',
      name: 'times',
      sort: {
        enable: true,
        defoult: true,
        asc: false,
      }
    },
  ],
  leftBtns: ['add', { name: 'delBatch', custome: true }],
  rightBtns: ['downTmpl', 'impData'],
  operation: {
    title: '操作',
    width: 80,
    btns: [
      'edit', 'view', {
        name: 'delete',
        custome: true
      }
    ],
    count: 2,
    more: {
      layout: 'vertical'
    }
  }
})

function btnClick({ btn, event, row, rows }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'delete' || btn.name == 'delBatch') {
    const data: any = []
    if (rows && rows.length > 0) {
      rows.forEach((item: any) => {
        data.push({
          id: item.id,
          userName: item.userName,
          tenantId: item.tenantId
        })
      })
    } else {
      data.push({
        id: row.id,
        userName: row.userName,
        tenantId: row.tenantId
      })
    }

    dialog.confirm({
      content: '确定踢出该会话吗？',
      onOk: () => {
        axios.admin({
          url: '/api/session/kick',
          method: 'post',
          data
        }).then((res: any) => {
          if (res.success) {
            dialog.success('踢出成功')
            page.value.reload()
          } else {
            dialog.error(res.message)
          }
        })
      }
    })
  }

}

</script>

<style scoped lang="less">
.drawer-form {
  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }

  .logger-form {
    :deep(.form-item-contents) {
      .ant-form-row {
        display: inline-block;

        .ant-form-item-control {
          display: inline;

          .text-view {
            padding: 5px;
            background-color: #f4f4f4;
          }
        }
      }
    }

    :deep(.form-item-errorMessage, ) {
      .ant-form-row {
        display: inline-block;

        .text-view {
          padding: 5px;
          overflow: scroll;
          background-color: #f4f4f4;
          width: 575px;
        }
      }
    }
  }
}
</style>
