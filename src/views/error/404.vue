<template>
  <div class="error-404">
    <div class="warp">
      <img :src="Img404" class="image-404" />
      <div class="tip-box">
        <div class="title">无法访问此页面</div>
        <div class="tip-way">请尝试一下方法：</div>
        <div class="tip-item">检查网络连接</div>
        <div class="tip-item">检查代理服务</div>
        <div class="tip-btns">
          <a-button type="primary" class="tip-btn" @click="goback">返回</a-button>
          <a-button type="primary" class="tip-btn" @click="gohome">首页</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Img404 from '@/assets/error/404.png'
import { useRouter } from 'vue-router'

const router = useRouter()
function gohome() {
  router.push('/')
}
function goback() {
  router.go(-1)
}
</script>

<style lang="less" scoped>
.error-404 {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;

  .warp {
    width: 100%;
    text-align: center;
    .image-404 {
      display: inline-block;
      margin-top: -100px;
    }
    .tip-box {
      display: inline-block;

      .title {
        font-size: 30px;
      }
      .tip-way {
        font-size: 16px;
        padding: 10px;
      }

      .tip-item {
        color: darkgray;
      }
    }
    .tip-btns {
      .tip-btn {
        margin: 10px;
      }
    }
  }
}
</style>
