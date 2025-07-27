<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-ums-message-list">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="850" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form">
      <unione-form :form="drawer.form" ref="form" v-if="drawer.visible"></unione-form>

      <div class="btns">
        <a-button type="primary" @click="drawer.tosave">保存</a-button>
        <a-button @click="drawer.visible = false">取消</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { axios, useDialog } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'

const dialog = useDialog()

const page = ref()
const define = ref({
  storage: {
    controller: '/api/ums/message',
    saveUrl: '/send'
  },
  fields: [
    {
      title: '分类',
      name: 'categoryName'
    },
    {
      title: '类别',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'UMSTYPES'
      },
      isQuery: true
    },
    {
      title: '标题',
      name: 'title',
      isQuery: true
    },
    {
      title: '优先级',
      name: 'priority',
      convert: {
        types: 'dict',
        dictName: 'UMSMSGPRIORITY'
      },
      isQuery: true
    },
    {
      title: '来源',
      name: 'fromId',
      convert: {
        types: 'dict',
        dictName: 'UMSMSGFROM'
      },
      isQuery: true
    },
    {
      title: '发布时间',
      name: 'publicDate',
      sort: {
        enable: true,
        defoult: true,
        asc: false
      }
    },
    {
      title: '修改时间',
      name: 'lastUpdated'
    }
  ],
  operation: {
    title: '操作',
    width: 175,
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
    drawer.value.title = '新增消息'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    drawer.value.form.model = 'run'
    drawer.value.form.fields.forEach((field: any) => {
      if (field.name == 'bodyText') {
        field.props = {
          options: { margins: [10, 10, 10, 10] }
        }
      }
    })
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑消息'
    drawer.value.placement = 'right'
    drawer.value.row = { ...row }
    drawer.value.form.model = 'run'
    if (drawer.value.row.bodyText) {
      drawer.value.row.bodyText = JSON.parse(drawer.value.row.bodyText)
    }
    drawer.value.form.fields.forEach((field: any) => {
      if (field.name == 'bodyText') {
        field.props = {
          options: { margins: [10, 10, 10, 10] }
        }
      }
    })
    nextTick(() => {
      form.value.setValue(drawer.value.row)
    })
  }
  if (btn.name == 'view') {
    drawer.value.visible = true
    drawer.value.title = '查看消息'
    drawer.value.placement = 'right'
    drawer.value.row = { ...row }
    drawer.value.form.model = 'view'
    if (drawer.value.row.bodyText) {
      drawer.value.row.bodyText = JSON.parse(drawer.value.row.bodyText)
    }
    drawer.value.form.fields.forEach((field: any) => {
      if (field.name == 'bodyText') {
        field.props = {
          options: { margins: [0, 0, 0, 0] }
        }
      }
    })
    nextTick(() => {
      form.value.setValue(drawer.value.row)
    })
  }
}

const form = ref() //form ref obj
const drawer = ref<any>({
  title: '新增消息',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '类别',
        name: 'types',
        required: true,
        control: 'unione-radio-box',
        value: 'notice',
        convert: {
          types: 'dict',
          dictName: 'UMSTYPES'
        },
        event: {
          change: (value: any, formValue: any) => {
            formValue.categoryId = ''
          }
        }
      },
      {
        title: '分类',
        name: 'categoryId',
        required: true,
        control: 'unione-select-box',
        convert: {
          types: 'local',
          url: '/api/ums/category/find',
          labelField: 'title',
          search: true,
          refValue: 'types'
        },
        event: {
          select: (value: any, ctx: any) => {
            ctx.formValue.isConfirm = ctx.option.isConfirm
            ctx.formValue.confirmType = ctx.option.confirmType
          }
        }
      },
      {
        title: '模版',
        name: 'tmplId',
        control: 'unione-select-box',
        convert: {
          types: 'local',
          url: '/api/ums/tmpl/find',
          labelField: 'title',
          search: true,
          params: {
            types: 'normal'
          }
        },
        props: {
          allowClear: true
        },
        event: {
          select: (value: any, ctx: any) => {
            if (ctx.option.ways) {
              ctx.formValue.ways = ctx.option.ways.split(',')
            }
            if (ctx.option.bodyText) {
              ctx.formValue.bodyText = JSON.parse(ctx.option.bodyText)
            }
          }
        }
      },
      {
        title: '标题',
        name: 'title',
        required: true
      },
      {
        title: '内容',
        name: 'bodyText',
        view: 'self',
        value: {},
        control: 'unione-rich-text',
        props: {
          options: { margins: [0, 0, 0, 0] }
        }
      },
      {
        title: '手动确认',
        name: 'isConfirm',
        control: 'unione-switch-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'TRUEORFALSE'
        }
      },
      {
        title: '确认方式',
        name: 'confirmType',
        control: 'unione-radio-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'UMSCONFIRMTYPE'
        },
        event: {
          visible: (value: any, formData: any) => {
            return formData.isConfirm == 1
          }
        }
      },
      {
        title: '通知方式',
        name: 'ways',
        control: 'unione-check-box',
        value: ['site'],
        props: {
          returnType: 'array'
        },
        convert: {
          types: 'dict',
          dictName: 'UMSMESSAGEWAY'
        }
      },
      {
        title: '通知目标',
        name: 'targets',
        control: 'unione-target-list',
        view: 'self'
      },
      {
        title: '优先级',
        name: 'priority',
        control: 'unione-radio-box',
        value: 4,
        convert: {
          types: 'dict',
          dictName: 'UMSMSGPRIORITY'
        }
      }
    ],
    model: 'run',
    setting: {
      showColumn: 1,
      labelWidth: 3
    }
  },
  tosave: () => {
    form.value.validate().then((data: any) => {
      data = {
        ...drawer.value.row,
        ...data
      }
      if (!data.fromId) {
        data.fromId = 'portal'
      }
      data.bodyText = JSON.stringify(data.bodyText)
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
