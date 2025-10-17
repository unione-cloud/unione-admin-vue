<!-- eslint-disable vue/multi-word-component-names -->
<!-- 联系我们 -->
<template>
  <div class="unione-page unione-page-list unione-contact-us">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useDialog } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'
import { useRouter, type Router } from 'vue-router'

const dialog = useDialog()
const stsConvert = new Convertor({ types: 'dict', dictName: 'CUSTRAILSTS' })
const router: Router = useRouter()

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/contactUs'
  },
  fields: [
    {
      title: '公司名称',
      name: 'company',
    },
    {
      title: '姓名',
      name: 'name',
    },
    {
      title: '职务',
      name: 'post',
    },
    {
      title: '电话',
      name: 'tel',
    },
    {
      title: '邮箱',
      name: 'email',
    },
    {
      title: '主题',
      name: 'subject',
      convert: {
        types: 'dict',
        dictName: 'SUBJECTLIST'
      },
      isQuery: true
    },
    {
      title: '消息',
      name: 'message',
    },
    {
      title: '注册状态',
      name: 'regSts',
      convert: {
        types: 'dict',
        dictName: 'TUREORFLASE'
      },
    },
    {
      title: '跟进状态',
      name: 'trailSts',
      convert: {
        types: 'dict',
        dictName: 'CUSTRAILSTS'
      },
    },
    {
      title: '跟进人姓名',
      name: 'trailUname'
    },
    {
      title: '跟进信息',
      name: 'trailInfos'
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
  leftBtns: ['add'],
  rightBtns: ['downTmpl', 'impData'],
  operation: {
    title: '操作',
    width: 200,
    btns: [
      'view', 'edit',
      {
        name: 'status',
        title: '状态',
        widget: 'dropdown',
        items: [
          {
            name: 'sts-1',
            title: '待跟进',
            disabled: ({ row }: any) => {
              return row.trailSts == 1
            }
          },
          {
            name: 'sts-2',
            title: '跟进中',
            disabled: ({ row }: any) => {
              return row.trailSts == 2
            }
          },
          {
            name: 'sts-3',
            title: '已处理',
            disabled: ({ row }: any) => {
              return row.trailSts == 3
            }
          }
        ]
      },
    ],
    count: 2,
    more: {
      layout: 'vertical'
    }
  }
})

async function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name.startsWith('sts-')) {
    const status = btn.name.split('-')[1]
    const stsLable = await stsConvert.convert(status)
    dialog.confirm({
      content: '确定要设置跟进状态为：' + stsLable,
      onOk: () => {
        page.value
          .storage()
          .request({
            url: '/status',
            data: { id: row.id, trailSts: status }
          })
          .then(() => {
            page.value.reload()
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
}
</style>
