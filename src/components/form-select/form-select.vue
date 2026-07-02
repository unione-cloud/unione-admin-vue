<!-- 表单设计：列表 -->
<template>
  <div class="form-select">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['select'])
const page = ref()
const define = ref({
  storage: {
    controller: '/api/data/define',
    findUrl: '/list'
  },
  fields: [
    {
      title: '类型',
      name: 'types',
      convert: {
        types: 'option',
        options: [{
          label: '动态表单',
          value: 'form'
        }, {
          label: '数据定义',
          value: 'setting'
        }]
      },
      visible: true,
      isQuery: true
    },
    {
      title: '表单名称',
      name: 'title',
    },
    {
      title: '表单编码',
      name: 'sn',
    },
    {
      title: '版本号',
      name: 'vers',
      width: 60
    },
  ],
  leftBtns: false,
  rightBtns: false,
  queryBtns: ['advanced'],
  selection: {
    model: 'single',
  },
  operation: {
    title: '操作',
    width: 80,
    btns: [
      'view', 'edit',
      'delete',
      {
        title: '选择',
        name: 'select'
      },
    ],
  }
})

function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click 222', btn, event, row)
  if (btn.name == 'select') {
    // 选择
    emit('select', row)
  }
}

/**
 * 获取选中记录
 */
function getSelected() {
  return page.value?.getSelected()
}

defineExpose({
  getSelected
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

  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }
}
</style>
