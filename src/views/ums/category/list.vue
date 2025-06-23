<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-ums-category">
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
import { axios, useDialog } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'

const dialog = useDialog()

const page = ref()
const define = ref({
  storage: {
    controller: '/api/ums/category'
  },
  fields: [
    {
      title: '标题',
      name: 'title',
      isQuery: true
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
      title: '链接Url',
      name: 'url'
    },
    {
      title: '使用级别',
      name: 'usel',
      convert: {
        types: 'dict',
        dictName: 'UMSCATEGORYUSEL'
      },
      isQuery: true
    },
    {
      title: '状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'USEORNOT'
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
        title: '启用',
        event: {
          title: (ctx: any) => {
            if (ctx.row?.status == 1) {
              return '停用'
            }
            return '启用'
          }
        }
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
    drawer.value.title = '新增分类'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑分类'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name == 'status') {
    setStatus(row.id, row.status == 1 ? 0 : 1)
  }
}
function setStatus(id: string, status: number) {
  dialog.confirm({
    content: '确定要' + (status == 1 ? '启用' : '停用') + '该分类么?',
    onOk: () => {
      axios.admin
        .request({
          url: '/api/ums/category/status',
          method: 'post',
          data: { id, status }
        })
        .then((res: any) => {
          page.value.reload()
        })
    }
  })
}

const form = ref() //form ref obj
const drawer = ref({
  title: '新增分类',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '标题',
        name: 'title',
        required: true
      },
      {
        title: '类型',
        name: 'types',
        control: 'unione-radio-box',
        value: 'notice',
        convert: {
          types: 'dict',
          dictName: 'UMSTYPES'
        }
      },
      {
        title: '使用级别',
        name: 'usel',
        control: 'unione-radio-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'UMSCATEGORYUSEL'
        }
      },
      {
        title: '状态',
        name: 'status',
        control: 'unione-switch-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'USEORNOT'
        }
      },
      {
        title: '显示顺序',
        name: 'ordered',
        control: 'a-input-number',
        value: 1
      },
      {
        title: '链接Url',
        name: 'url'
      },
      {
        title: '备注信息',
        name: 'remark',
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
