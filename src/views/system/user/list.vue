<template>
  <div class="unione-page user-manage">
    <div class="unione-query">
      <a-form-item label="关键字" class="query-field keywords">
        <a-input placeholder="请输入搜索内容"></a-input>
      </a-form-item>
      <div class="query-btn">
        <a-button type="primary" class="btn search">搜索</a-button>
        <a-button class="btn search">重置</a-button>
      </div>
      <div class="tool-btn">
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
    </div>
    <div class="unione-data data-list"></div>
  </div>
</template>

<script setup lang="ts">
import { CloudUploadOutlined, CloudDownloadOutlined } from '@ant-design/icons-vue'
</script>

<style scoped lang="less">
.user-manage {
  .unione-query {
    padding: 10px 20px;
    display: flex;

    .query-field {
      display: inline-block;
      &.keywords {
        width: 280px;
      }
    }

    .query-btn {
      display: inline-block;
      .btn {
        margin: auto 5px;
      }
    }

    .tool-btn {
      display: inline-block;
      width: calc(100% - 450px);
      .btn {
        margin: auto 5px;
        &.right {
          float: right;
        }
      }
    }
  }
}
</style>
