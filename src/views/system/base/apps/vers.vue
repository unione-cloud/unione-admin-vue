<!-- eslint-disable vue/multi-word-component-names -->
<!-- 应用版本管理 -->
<template>
  <div class="unione-page unione-page-list unione-system-vers">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="750" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form" :mask-closable="false">
      <unione-form :form="drawer.form" ref="form" v-if="drawer.visible"></unione-form>
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
import { nextTick, ref, computed, onMounted } from 'vue'
import { axios, useDialog } from 'unione-base-vue'
import { useRouter, useRoute, type Router } from 'vue-router'

const dialog = useDialog()
const route = useRoute()
const router: Router = useRouter()

const appInfo = ref<any>()
const appId = computed(() => {
  return route.query.appId
})
function loadAppInfo() {
  return new Promise((resolve, reject) => {
    if (appInfo.value) {
      resolve(appInfo.value)
    }
    if (appId.value) {
      axios.admin({
        url: '/api/system/appInfo/detail',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: appId.value
      }).then((res: any) => {
        appInfo.value = res.body
        resolve(res.body)
      })
    } else {
      reject('应用ID不能为空')
    }
  })
}

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/changeLog',
    orderBy: 'releaseTime desc'
  },
  fields: [
    {
      title: '应用名称',
      name: 'appName',
    },
    {
      title: '版本号',
      name: 'versNo'
    },
    {
      title: '版本类型',
      name: 'versType',
      convert: {
        types: 'dict',
        dictName: 'VERSTYPE'
      },
      isQuery: true
    },
    {
      title: '变更类型',
      name: 'changeType',
      convert: {
        types: 'dict',
        dictName: 'CHANGETYPE'
      },
      isQuery: true
    },
    {
      title: '发布时间',
      name: 'releaseTime'
    },
    {
      title: '修改时间',
      name: 'lastUpdated'
    }
  ],
  operation: {
    title: '操作',
    width: 200,
    count: 2,
    btns: [],
    more: {
      layout: 'vertical'
    }
  }
})

async function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    drawer.value.visible = true
    drawer.value.title = '新增版本'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    drawer.value.form.model = 'run'
    loadAppInfo().then((app: any) => {
      form.value.reset()
      form.value.setValue({ appName: app.name, versNo: app.versNo, versDesc: app.versDesc })
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑版本'
    drawer.value.placement = 'right'
    drawer.value.row = row
    drawer.value.form.model = 'run'
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name == 'view') {
    drawer.value.visible = true
    drawer.value.title = '查看版本'
    drawer.value.placement = 'right'
    drawer.value.row = row
    drawer.value.form.model = 'view'
    nextTick(() => {
      form.value.setValue(row)
    })
  }
}

const form = ref() //form ref obj
const drawer = ref({
  title: '新增版本',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    model: 'edit',
    fields: [
      {
        title: '应用名称',
        name: 'appName',
        view: 'html'
      },
      {
        title: '版本号',
        name: 'versNo',
        required: true
      },
      {
        title: '版本类型',
        name: 'versType',
        value: 'dev',
        control: 'unione-radio-box',
        convert: {
          types: 'dict',
          dictName: 'VERSTYPE'
        }
      },
      {
        title: '版本说明',
        control: 'unione-rich-text',
        view: 'self',
        name: 'versDesc',
        required: true
      },
      {
        title: '变更类型',
        name: 'changeType',
        value: 'patch',
        control: 'unione-radio-box',
        convert: {
          types: 'dict',
          dictName: 'CHANGETYPE'
        }
      },
      {
        title: '变更说明',
        control: 'unione-rich-text',
        view: 'self',
        name: 'changeTxt',
        required: true
      },
      {
        title: '升级指南',
        name: 'upgradeTips',
        control: 'unione-rich-text',
        view: 'self',
      },
      {
        title: '发布时间',
        name: 'releaseTime',
        control: 'a-date-picker',
        props: {
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm:ss'
        },
        required: true
      },

    ],
    setting: {
      showColumn: 1,
      labelWidth: 5
    }
  },
  tosave: () => {
    form.value.validate().then((data: any) => {
      data.appId = appId.value
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

onMounted(() => {
  if (!appId.value) {
    dialog.error('应用ID不能为空')
    router.back()
    return
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
