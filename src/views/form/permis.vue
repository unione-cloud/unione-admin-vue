<!-- eslint-disable vue/multi-word-component-names -->
<!-- 表单设计：列表 -->
<template>
  <div class="unione-page unione-page-list unione-data-permis">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick" :params="{ defineId }"></unione-page-list>

    <a-drawer :title="drawer.title" :width="750" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form">
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
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route: any = useRoute()
const defineId = computed(() => {
  return route.params.did || route.query.did
})

const page = ref()
const define = ref({
  storage: {
    controller: '/api/data/permis',
  },
  fields: [
    {
      title: '应用名称',
      name: 'extra.appName',
    },
    {
      title: '数据标题',
      name: 'extra.dfTitle',
    },
    {
      title: '权限类型',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'DATAPERMISTYPE'
      }
    },
    {
      title: '权限名称',
      name: 'name',
    },
    {
      title: '是否需要授权',
      name: 'needAuth',
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      }
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
    width: 250,
    btns: [
      'view',
      {
        title: '权限分配',
        name: 'auth'
      },
    ],
    count: 3,
  }
})

function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    drawer.value.visible = true
    drawer.value.title = '新增权限'
    drawer.value.placement = 'left'
    drawer.value.row = {
      defineId: defineId.value,
      configs: '{}'
    }
    isSensitive.value = false
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑权限'
    drawer.value.placement = 'right'
    drawer.value.row = row
    if (row.types?.includes('sensitive')) {
      isSensitive.value = true
    }
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name == 'auth') {
    drawer.value.visible = true
    drawer.value.title = '版本管理'
    drawer.value.placement = 'right'
    drawer.value.define = row
    drawer.value.loadHistorys(row)
  }
}

const form = ref<any>(null)
const isSensitive = ref<boolean>(false)
const expressHelper = ref('')
watch(isSensitive, (newVal) => {
  if (newVal) {
    expressHelper.value = '数据脱敏处理脚本'
  } else {
    expressHelper.value = '数据权限过滤SQL'
  }
}, { immediate: true })

const drawer = ref<any>({
  title: '添加权限',
  placement: 'left',
  visible: false,
  permis: null,
  form: {
    fields: [
      {
        title: '权限类型',
        name: 'types',
        control: 'unione-check-box',
        convert: {
          types: 'dict',
          dictName: 'DATAPERMISTYPE'
        },
        props: {
          tooltip: '脱敏权限和其他权限不能同时选择'
        },
        event: {
          change: (val: any, formValue: any) => {
            isSensitive.value = false
            if (val?.includes('sensitive')) {
              formValue.types = 'sensitive'
              isSensitive.value = true
            }
          }
        }
      },
      {
        title: '权限名称',
        name: 'name',
        required: true
      },
      {
        title: '是否需要授权',
        name: 'needAuth',
        control: 'unione-switch-box',
        convert: {
          types: 'dict',
          dictName: 'TUREORFALSE'
        },
      },
      {
        title: '表达式',
        name: 'express',
        control: 'unione-code-editor',
        props: {
          help: expressHelper
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
        ...data,
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
  .info {
    cursor: pointer;

    .vers {
      margin-left: 10px;
    }
  }

  .vert {
    color: #999;
  }

  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }
}
</style>

<style lang="less">
.data-define-release-modal {
  .ant-form-item {
    margin-bottom: 10px;
  }
}
</style>