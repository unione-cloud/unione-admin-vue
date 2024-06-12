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
      </div>
    </div>

    <!-- 页面工具 -->
    <div class="unione-tools">
      <a-button class="btn add" type="primary" size="small">
        <template #icon>
          <PlusOutlined />
        </template>
        新增</a-button
      >
      <a-button class="btn delete" type="primary" danger size="small">
        <template #icon>
          <DeleteOutlined />
        </template>
        批量删除</a-button
      >
      <a-button class="btn right tmpl" size="small">
        <template #icon>
          <CloudDownloadOutlined />
        </template>
        模版</a-button
      >
      <a-button class="btn right import" size="small">
        <template #icon>
          <CloudUploadOutlined />
        </template>
        导入</a-button
      >
      <a-button class="btn right export" size="small">
        <template #icon>
          <CloudDownloadOutlined />
        </template>
        导出</a-button
      >
    </div>

    <!-- 页面数据 -->
    <div class="unione-data data-list">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :scroll="{ x: 1500 }"
        :pagination="{
          showTotal: (total) => '共' + total + '记录',
          total: 1000,
          position: ['bottomCenter']
        }"
        bordered
        size="small"
      >
        <template #bodyCell="{ column }">
          <template v-if="column.key === 'operation'">
            <a>action</a>
          </template>
        </template>
      </a-table>
    </div>
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
    sorter: true,
    width: 150
  },
  {
    title: 'Age',
    dataIndex: 'age',
    fixed: 'left',
    sorter: true,
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
.unione-page {
  padding: 10px;

  .unione-query {
    display: flex;
    padding-bottom: 10px;
    padding-left: 5px;

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
    padding-bottom: 10px;
    .btn {
      margin: auto 5px;
      &.right {
        float: right;
      }
    }
    /deep/.ant-btn-sm {
      height: 27px;
    }
  }

  .data-list {
    /deep/.ant-table-content {
      border-inline-start: 1px solid #cfcfcf;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      overflow: hidden;

      table {
        border-top: 1px solid #cfcfcf !important;
      }
      .ant-table-thead {
        .ant-table-cell {
          background-color: #f0f0f0;
          border-inline-end: 1px solid #cfcfcf !important;
          border-bottom: 1px solid #cfcfcf !important;
        }
      }
      .ant-table-tbody {
        .ant-table-cell {
          border-inline-end: 1px solid #cfcfcf !important;
          border-bottom: 1px solid #cfcfcf !important;
        }
        .ant-table-row:hover {
          background-color: #e6f7ff;
          color: #2795f9;

          .ant-table-cell {
            background-color: #e6f7ff;
            color: #2795f9;
          }
        }
      }
    }
  }
}
</style>
