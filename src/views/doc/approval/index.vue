<!-- 审批管理 -->
<template>
  <div class="doc-approval">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="400" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-doc-audit" :mask-closable="false">

      <unione-form ref="form" :form="drawer.form"></unione-form>

      <template #footer>
        <div class="btns">
          <a-button @click="drawer.visible = false">取消</a-button>
          <a-button @click="drawer.toAudit" type="primary">提交</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { axios, useDialog } from 'unione-base-vue'
import { nextTick, ref } from 'vue'


defineOptions({
  name: 'DocApproval',
})

const dialog = useDialog()
const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/doc/permis',
    findUrl: '/toAudit'
  },
  fields: [
    {
      title: '文档名称',
      name: 'fileTitle',
    },
    {
      title: '文档类型',
      name: 'fileType',
      isQuery: true
    },
    {
      title: '审核类型',
      name: 'auditType',
      convert: {
        types: 'option',
        options: [
          {
            label: '公开审核',
            value: 1
          },
          {
            label: '共享审核',
            value: 2
          }
        ]
      },
      isQuery: true
    },
    {
      title: '申请权限',
      name: 'list',
      convert: {
        types: 'dict',
        dictName: 'DOCPERMISLIST'
      },
      isQuery: true
    },
    {
      title: '目标类型',
      name: 'ownerType',
      convert: {
        types: 'dict',
        dictName: 'DOCPERMISTYPE'
      },
      isQuery: true
    },
    {
      title: '目标名称',
      name: 'ownerTitle',
    },
    {
      title: '提交时间',
      name: 'created',
      sort: {
        enable: true,
        asc: false,
        defoult: true
      }
    },
    {
      title: '审核时间',
      name: 'auditTime',
      sort: {
        enable: true,
        asc: false,
        defoult: true
      }
    }, {
      title: '审核结果',
      name: 'auditResult',
      isQuery: true,
      convert: {
        types: 'dict',
        dictName: 'DOCFILEAUDITSTS'
      },
    }
  ],
  leftBtns: ['add', 'delBatch', {
    title: '批量审核',
    name: 'auditBatch',
    props: {
      type: 'primary'
    }
  }],
  rightBtns: ['downTmpl', 'impData'],
  operation: {
    title: '操作',
    width: 90,
    btns: [
      'view', 'edit', 'delete',
      {
        name: 'audit',
        title: '审核'
      },
    ],
    count: 2,
    more: {
      layout: 'vertical'
    }
  }
})

async function btnClick({ btn, row, rows }: any) {
  if (btn.name == 'audit') {
    // 审核
    drawer.value.title = '文档审核'
    drawer.value.row = row
    drawer.value.visible = true
    nextTick(() => {
      form.value.setValue({
        auditOpinion: '',
        auditResult: '3'
      })
    })
  }
  if (btn.name == 'auditBatch') {
    // 批量审核
    drawer.value.title = '批量审核'
    drawer.value.row = rows
    drawer.value.visible = true
    nextTick(() => {
      form.value.setValue({
        auditOpinion: '',
        auditResult: '3'
      })
    })
  }
}

const form = ref()
const drawer = ref<any>({
  title: '文档审核',
  placement: 'right',
  visible: false,
  row: null,
  form: {
    fields: [{
      title: '审核意见',
      name: 'auditOpinion',
      control: 'a-textarea',
      props: {
        required: true,
        placeholder: '请输入审核意见',
        rows: 8
      }
    }, {
      title: '审核结果',
      name: 'auditResult',
      control: 'unione-radio-box',
      value: '3',
      convert: {
        types: 'dict',
        dictName: 'DOCFILEAUDITSTS',
        filter: (items: any) => {
          return items.filter((item: any) => item.value != 1)
        }
      },
      props: {
        required: true,
      }
    }],
    setting: {
      labelAlign: 'top'
    }
  },
  toAudit: () => {
    // 提交审核
    form.value.validate().then((data: any) => {
      dialog.confirm({
        content: '确定提交审核么？',
        onOk: () => {

          const params: any = {
            body: data
          }
          if (Array.isArray(drawer.value.row)) {
            params.ids = drawer.value.row.map((item: any) => item.id)
          } else {
            params.body.id = drawer.value.row.id
          }

          axios.admin({
            url: '/api/system/doc/permis/doAudit',
            data: params,
            method: 'POST'
          }).then((result: any) => {
            if (result.success) {
              message.success('审核成功')
              drawer.value.visible = false
              page.value.reload()
            } else {
              dialog.error(result.message || '审核失败')
            }
          })
        }
      })
    })
  }
})

</script>
<style lang='less' scoped>
.doc-approval {}
</style>
<style lang='less'>
.drawer-doc-audit {
  .btns {
    text-align: right;

    .ant-btn {
      margin: 5px 10px;
    }
  }
}
</style>