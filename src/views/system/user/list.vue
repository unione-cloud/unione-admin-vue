<template>
  <div class="unione-page user-manage">
    <!-- 查询表单 -->
    <div class="unione-query">
      <a-form-item label="关键字" class="query-field keywords">
        <a-input placeholder="请输入搜索内容"></a-input>
      </a-form-item>
      <div class="query-btn">
        <a-button type="primary" class="btn do-search">搜索</a-button>
        <a-button class="btn do-reset">重置</a-button>
        <a-dropdown class="btn">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1"><a-checkbox>姓名</a-checkbox></a-menu-item>
              <a-menu-item key="2"><a-checkbox>性别</a-checkbox></a-menu-item>
            </a-menu>
          </template>
          <a-button>
            高级搜索
            <DownOutlined />
          </a-button>
        </a-dropdown>
        <a-button class="btn save-search" type="dashed">保存搜索</a-button>
      </div>
    </div>

    <!-- 页面工具 -->
    <div class="unione-tools">
      <a-button class="btn add" type="primary">
        <template #icon>
          <PlusOutlined />
        </template>
        新增</a-button
      >
      <a-button class="btn delete" type="primary" danger>
        <template #icon>
          <DeleteOutlined />
        </template>
        批量删除</a-button
      >
      <a-button class="btn right tmpl">
        <template #icon>
          <CloudDownloadOutlined />
        </template>
        模版</a-button
      >
      <a-button class="btn right import">
        <template #icon>
          <CloudUploadOutlined />
        </template>
        导入</a-button
      >
      <a-button class="btn right export">
        <template #icon>
          <CloudDownloadOutlined />
        </template>
        导出</a-button
      >
    </div>

    <!-- 页面数据 -->
    <div class="unione-data data-list"></div>
  </div>
</template>

<script setup lang="ts">
import {
  DeleteOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons-vue'

interface DataItem {
  key: number
  name: string
  age: number
  address: string
}

const columns = [
  {
    title: 'Full Name',
    dataIndex: 'name',
    fixed: 'left',
    width: 150
  },
  {
    title: 'Age',
    dataIndex: 'age',
    fixed: 'left',
    width: 100
  },
  {
    title: 'Column 1',
    dataIndex: 'address'
  },
  {
    title: 'Column 2',
    dataIndex: 'address'
  },
  {
    title: 'Column 3',
    dataIndex: 'address'
  },
  {
    title: 'Column 4',
    dataIndex: 'address'
  },
  { title: 'Column 5', dataIndex: 'address' },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 100
  }
]
const dataSource: DataItem[] = []
for (let i = 0; i < 1000; i++) {
  dataSource.push({
    key: i,
    name: `Edrward ${i}`,
    age: i + 1,
    address: `London Park no. ${i}`
  })
}
</script>

<style scoped lang="less">
.user-manage {
  .unione-query {
    padding: 10px 20px;
    display: flex;

    .query-field {
      display: inline-block;
      margin-bottom: 5px;
      &.keywords {
        width: 280px;
      }
    }

    .query-btn {
      display: inline-block;
      .btn {
        margin: auto 5px;

        &.save-search {
          float: right;
          position: absolute;
          right: 10px;
        }
      }
    }
  }

  .unione-tools {
    .btn {
      margin: auto 5px;
      &.right {
        float: right;
      }
    }
  }
}
</style>
