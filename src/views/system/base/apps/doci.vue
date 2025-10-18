<!-- eslint-disable vue/multi-word-component-names -->
<!-- 在线文档内容管理 -->
<template>
  <unione-page-tree v-bind="unionePage" class="unione-app-doc-item" ref="treePage" @btnClick="btnClick"
    @treeClick="treeClick">
    <template #form-warp>
      <div class="doc-editor">
        <unione-rich-text v-model:value="editorContents" :toolbar="['all']"></unione-rich-text>
      </div>
      <div class="doc-footer">
        <a-button type="primary" @click="tosave">保存</a-button>
      </div>
      <!-- 资源设置对话框 -->
      <a-modal v-model:open="modalSetting.visible" :title="modalSetting.title" centered :width="600"
        @ok="modalSetting.ok" :maskClosable="false" :confirmLoading="modalSetting.loading">
        <unione-form :form="modalSetting.form" ref="formRef"></unione-form>
      </a-modal>
    </template>
  </unione-page-tree>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
const treePage = ref()

const route = useRoute()
const docName = computed(() => {
  return route.query.docName || ''
})

const unionePage = ref<any>({
  storage: {
    controller: '/api/system/onlineDoc/item',
    orderBy: 'ordered asc',
  },
  opts: [{
    name: 'setting',
    tooltip: '设置',
    icon: 'SettingOutlined',
    props: {
      type: 'text'
    }
  }],
  event: {
    createNode: (node: any, parent: any, params: any) => {
      node.pid = parent?.id || -1
      node.isLeaf = true
      nextTick(() => {
        toSetting(node)
      })
    }
  }
})


const editorContents = ref('{"header":[],"main":[],"footer":[]}')
const activeItemObj = ref<any>()

const formRef = ref()
const modalSetting = ref<any>({
  visible: false,
  loading: false,
  title: '内容设置',
  data: {},
  form: {
    fields: [{
      title: '文档名称',
      name: 'docName',
      view: 'html',
    }, {
      title: '内容标题',
      name: 'title',
      required: true
    }, {
      title: '内容图标',
      name: 'icon',
      control: 'unione-icon-select'
    },
    {
      title: '显示顺序',
      name: 'ordered',
      value: 1,
      control: 'a-input-number'
    }, {
      title: '资源描述',
      name: 'descs',
      control: 'a-textarea'
    }],
    setting: {
      showColumn: 1,
      labelWidth: 4
    }
  },
  ok: () => {
    formRef.value.validate().then((data: any) => {
      modalSetting.value.loading = true
      const formData: any = { ...data }
      if (data.id && !/^new_.*/.test(data.id)) {
        formData.id = data.id
      } else {
        delete formData.id
      }
      delete formData.parentNode
      formData.pid = modalSetting.value.data.pid
      formData.isLeaf = formData.isLeaf ? 1 : 0
      treePage.value.storage().save({ data: formData }).then((res: any) => {
        treePage.value.setActiveNode({ id: res.body })
        modalSetting.value.data.id = res.body
        modalSetting.value.visible = false
      }).finally(() => {
        modalSetting.value.loading = false
      })
    })
  }
})

function toSetting(node: any) {
  modalSetting.value.visible = true
  modalSetting.value.data = node
  nextTick(() => {
    node.docName = docName.value
    formRef.value.setValue(node)
  })
}

function btnClick({ btn, node }: any) {
  if (btn.name == 'setting') {
    toSetting(node)
  }
}
function treeClick({ event }: any) {
  const { node } = event;
  activeItemObj.value = node
  editorContents.value = node.contents || '{"header":[],"main":[],"footer":[]}'
}

function tosave() {
  activeItemObj.value.loading = true
  activeItemObj.value.contents = editorContents.value
  const { title, icon, picMax, picMid, picMix, ordered, descs } = activeItemObj.value
  const formData: any = { title, icon, picMax, picMid, picMix, ordered, descs }
  if (activeItemObj.value.id && !/^new_.*/.test(activeItemObj.value.id)) {
    formData.id = activeItemObj.value.id
  }
  formData.contents = editorContents.value
  formData.pid = activeItemObj.value.pid
  treePage.value.storage().save({ data: formData }).then((res: any) => {
    treePage.value.setNode(activeItemObj.value.id, { id: res.body, contents: editorContents.value })
    modalSetting.value.data.id = res.body
    modalSetting.value.visible = false
  }).finally(() => {
    activeItemObj.value.loading = false
  })
}

</script>

<style scoped lang="less">
.unione-app-doc-item {

  :deep(.tree-warp) {
    width: 320px;
  }

  :deep(.form-warp) {
    width: calc(100% - 320px);

    .doc-editor {
      padding: 0 10px 10px 10px;
      height: calc(100% - 70px);
    }

    .doc-footer {
      text-align: center;
      padding: 5px 10px;
    }
  }

}
</style>
