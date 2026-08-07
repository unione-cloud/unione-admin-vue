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

    <a-drawer :title="dataAuth.title" :width="800" v-model:visible="dataAuth.visible" placement="right"
      class="drawer-form">

      <unione-page-list v-if="dataAuth.visible" ref="authPage" v-bind="dataAuth.define" @btnClick="authBtnClick"
        :params="{ permisId: dataAuth.row.id, defineId }"></unione-page-list>

    </a-drawer>

    <unione-target-select v-model:visible="targetSelect.visible" @ok="targetSelect.handleOk"></unione-target-select>

  </div>
</template>

<script setup lang="ts">
import { axios, useDialog } from 'unione-base-vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route: any = useRoute()
const dialog = useDialog()
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
    dataAuth.value.visible = true
    dataAuth.value.row = row
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


const dataAuth = ref<any>({
  title: '权限管理',
  visible: false,
  row: {},
  define: {
    storage: {
      controller: '/api/data/auth',
    },
    fields: [
      {
        title: '目标类型',
        name: 'targetType',
        convert: {
          types: 'dict',
          dictName: 'DATAAUTHTYPE'
        },
      },
      {
        title: '目标ID',
        name: 'targetId',
      },
      {
        title: '目标编码',
        name: 'targetSn',
      },
      {
        title: '目标标题',
        name: 'targetTitle',
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
    ],
    operation: {
      title: '操作',
      width: 90,
      btns: [
        'view',
        'edit'
      ],
      count: 3,
    }
  }
})

const authPage = ref<any>(null)
const targetSelect = ref<any>({
  visible: false,
  handleOk: (targets: any) => {
    const map: any = {
      3: 'organ',
      4: 'user',
      5: 'role',
    }
    targets.forEach((t: any) => {
      t.targetType = map[t.targetType]
    })
    axios.admin({
      url: '/api/data/auth/saves',
      method: 'post',
      data: {
        permisId: dataAuth.value.row.id,
        targets: targets
      }
    }).then((res: any) => {
      if (res.success) {
        targetSelect.value.visible = false
        authPage.value.reload()
      } else {
        dialog.error(res.message)
      }
    })
  }
})
function authBtnClick({ btn, event, row, keys }: any) {
  console.log('auth btn click', btn, event, row)
  if (btn.name == 'add') {
    targetSelect.value.visible = true
  }
}


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