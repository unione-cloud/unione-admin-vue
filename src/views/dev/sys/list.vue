<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-sys">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <UnioneSystemDesign ref="designRef"></UnioneSystemDesign>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useDialog } from 'unione-base-vue'
import { Convertor, viewRegistry } from 'unione-form-vue'

const dialog = useDialog()
const stsConvert = new Convertor({ types: 'dict', dictName: 'APPSTATUS' })

viewRegistry.regViewFactory((name: string) => {
  const fullPath = `/src${name}`;
  // 预加载views目录下所有.vue文件，{ eager: false }保持懒加载特性
  const modules: any = import.meta.glob('@/views/**/*.vue', { eager: false });
  return modules[fullPath]
})

const designRef = ref()

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/sys'
  },
  fields: [
    {
      title: '系统名称',
      name: 'name',
    },
    {
      title: '系统简称',
      name: 'alias',
    },
    {
      title: '全局',
      name: 'isGlobal',
      convert: {
        types: 'dict',
        dictName: 'TRUEORFALSE'
      },
    },
    {
      title: '类型',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'APPTYPES'
      },
      isQuery: true
    },
    {
      title: '系统ctx',
      name: 'ctx',
    },
    {
      title: '版本号',
      name: 'versNo',
    },
    {
      title: '系统主题',
      name: 'themeName',
    },
    {
      title: '显示顺序',
      name: 'ordered',
      sort: {
        enable: true,
        defoult: true,
        asc: true
      }
    },
    {
      title: '状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'SYSSTATUS'
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
    width: 250,
    btns: [
      {
        name: 'view',
        title: '预览',
      },
      {
        name: 'status',
        title: '状态',
        widget: 'dropdown',
        items: [
          {
            name: 'sts-2',
            title: '内测',
            disabled: ({ row }: any) => {
              console.log('=====内测====', row)
              return row.status == 2
            }
          },
          {
            name: 'sts-3',
            title: '发布',
            disabled: ({ row }: any) => {
              return row.status == 3
            }
          },
          {
            name: 'sts-4',
            title: '撤销',
            disabled: ({ row }: any) => {
              return row.status == 4
            }
          }
        ]
      },
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
    designRef.value.open()
  }
  if (btn.name == 'edit') {
    designRef.value.open(row.id)
  }
  if (btn.name.startsWith('sts-')) {
    const status = btn.name.split('-')[1]
    const stsLable = await stsConvert.convert(status)
    dialog.confirm({
      content: '确定要设置应用状态为：' + stsLable,
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

</script>

<style scoped lang="less">
.system-sys-drawer-form {

  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }

  .drawer-form {
    :deep(.unione-code-editor) {
      max-height: 400px;
      overflow-y: auto;
    }
  }

}
</style>
