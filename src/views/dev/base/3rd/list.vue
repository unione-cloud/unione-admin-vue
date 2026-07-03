<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-conf-3rd">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="550" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form" :bodyStyle="{ paddingTop: 0 }">
      <unione-form :form="drawer.form" ref="form"></unione-form>

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
import { nextTick, ref } from 'vue'
import { useDialog } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'

const dialog = useDialog()
const stsConvert = new Convertor({ types: 'dict', dictName: 'USEORNOT' })

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/3rdAuth'
  },
  fields: [
    {
      title: '场景',
      name: 'scene',
      convert: {
        types: 'dict',
        dictName: '3RDSCENE'
      },
    },
    {
      title: '标题',
      name: 'title',
    },
    {
      title: '编码',
      name: 'sn',
    },
    {
      title: 'URL',
      name: 'url',
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
      title: '修改时间',
      name: 'lastUpdated'
    }
  ],
  operation: {
    title: '操作',
    width: 175,
    btns: [
      'view',
      {
        name: 'status',
        title: '状态',
        widget: 'dropdown',
        items: [
          {
            name: 'sts-1',
            title: '使用',
            disabled: ({ row }: any) => {
              return row.status == 1
            }
          },
          {
            name: 'sts-0',
            title: '停用',
            disabled: ({ row }: any) => {
              return row.status == 0
            }
          },
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
    drawer.value.title = '新增3rd认证'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑3rd认证'
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
      content: '确定要设置状态为：' + stsLable,
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
  title: '新增3rd认证',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        widget: 'unione-tabs',
        widgets: [
          {
            title: '基础信息',
            widgets: [
              {
                title: '场景',
                name: 'scene',
                control: 'unione-select-box',
                value: 'other',
                required: true,
                convert: {
                  types: 'dict',
                  dictName: '3RDSCENE'
                }
              },
              {
                title: '标题',
                name: 'title',
                required: true,
              },
              {
                title: '编码',
                name: 'sn',
                required: true,
              },
              {
                title: 'URL',
                name: 'url',
                required: true,
              },
              {
                title: '字体图标',
                name: 'icon',
                control: 'unione-icon-select'
              },
              {
                title: '图片图标(小)',
                name: 'picMix',
                control: 'unione-upload-box',
                props: {
                  accept: 'image/*',
                  listType: 'picture-card',
                  limit: 1,
                  valueType: 'string',
                  bucket: 'system'
                }
              },
              {
                title: '图片图标(中)',
                name: 'picMid',
                control: 'unione-upload-box',
                props: {
                  accept: 'image/*',
                  listType: 'picture-card',
                  limit: 1,
                  valueType: 'string',
                  bucket: 'system'
                }
              },
              {
                title: '图片图标(大)',
                name: 'picMax',
                control: 'unione-upload-box',
                props: {
                  accept: 'image/*',
                  listType: 'picture-card',
                  limit: 1,
                  valueType: 'string',
                  bucket: 'system'
                }
              },
              {
                title: '技术文档',
                name: 'docLink',
              },
              {
                title: '租户配置',
                widget: 'unione-section',
                props: {
                  type: 'line'
                }
              },
              {
                title: '状态',
                name: 'status',
                control: 'unione-radio-box',
                value: 1,
                convert: {
                  types: 'dict',
                  dictName: 'USEORNOT'
                }
              },
              {
                title: '显示顺序',
                name: 'ordered',
                value: 0,
                control: 'a-input-number',
                required: true
              },
              {
                title: '备注信息',
                name: 'descs',
                control: 'a-textarea'
              },
            ]
          },
          {
            title: '认证信息',
            widgets: [{
              title: '认证信息',
              name: 'dataJson',
              control: 'unione-code-editor',
              props: {
                language: 'json'
              },
              view: {
                hideLabel: 0
              }
            },
            ]
          },
          {
            title: '认证脚本',
            widgets: [{
              title: '认证脚本',
              name: 'scriptTxt',
              control: 'unione-code-editor',
              props: {
                language: 'javascript',
              },
              view: {
                hideLabel: 0
              }
            },]
          },
        ]
      },
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

  :deep(.unione-code-editor) {
    height: 400px !important;
  }

  .btns {
    text-align: right;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }
}
</style>
