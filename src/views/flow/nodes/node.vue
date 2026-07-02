<template>
  <Node class="unione-flow-node-custom node-box">
    <template #default="{data}">
      <div class="head">
        <AndroidOutlined class="icon" />
        <span class="title">{{ data.title }}</span>
      </div>
      <div class="body">{{ data.info }}</div>
    </template>
  </Node>
</template>
<script setup lang="ts">
import {Node} from 'unione-flow-vue'
defineOptions({
  name: 'UnioneFlowNodeCustom',
})

</script>
<style lang="less" scoped>
.unione-flow-node-custom {
  width: 200px;
  background-color: #FFFFFF98;
  border-radius: 10px;
 

  .head{
    display: flex;
    flex-direction: row;
    padding: 5px 10px;
    background-image: linear-gradient(to right, #e09d70, #e06614);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    border-top:solid 2px transparent;
    border-left: solid 2px #e09d70;
    border-right: solid 2px #e06614;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;

    .icon{
      color:#1890ff;
      width: 20px;
      height: 20px;
      margin-right: 5px;
      font-weight: bold;
    }
    .title{
      font-size: 13px;
      font-weight: bold;
      color: #000000;
    }
  }
  .body{
    height: 58px;
    padding: 5px 10px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    border-left: solid 2px transparent;
    border-right: solid 2px transparent;
    border-bottom: solid 2px transparent;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
}
</style>