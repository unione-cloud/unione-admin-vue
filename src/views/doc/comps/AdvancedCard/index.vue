<!-- 高级卡片组件 -->
<template>
  <div class="y-card">
    <div class="y-card-title">
      <div class="hl"></div>
      {{ cardTitle }}
      <div class="rig-title" v-show="rigTitle">
        <slot name="rigTitle" />
      </div>
    </div>
    <div class="y-card-body" v-show="slot">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdvancedCard',
  props: {
    title: {
      type: String,
    },
  },
  components: {},
  data() {
    return {
      /** 卡片标题 */
      cardTitle: '',
    }
  },
  computed: {
    slot() {
      return this.$slots.default
    },
    rigTitle() {
      return this.$slots.rigTitle
    },
  },
  //创建完成 访问当前this实例
  created() {
    this.cardTitle = this.title || this.$route.meta.title || ''
  },
  watch: {
    title: {
      immediate: true,
      handler(val) {
        if (val) {
          this.cardTitle = val
        }
      },
    },
  },
  //挂载完成 访问DOM元素
  mounted() { },
  //方法集合
  methods: {},
}
</script>
<style lang='less' scoped>
.y-card {
  width: 100%;
  background: white;
  padding: 10px 20px;
  box-shadow: 0 0 10px #c5c5c5;
  // overflow: hidden;
  border-radius: 5px;

  &:after {
    content: '';
    display: block;
    visibility: hidden;
    clear: both;
  }

  .y-card-title {
    font-size: 18px;
    font-weight: bold;
    line-height: 32px;
    position: relative;
    padding-left: 15px;
    padding-bottom: 7px;
    border-bottom: 1px #ededed solid;
    overflow: hidden;

    .hl {
      width: 5px;
      display: inline-block;
      background: #1889f1;
      height: 23px;
      position: absolute;
      top: 5px;
      left: 0;
      border-radius: 20px;
    }
  }

  .y-card-body {
    margin-top: 10px;
    // padding: 28px 0 18px;
  }
}

.rig-title {
  display: inline-block;
  float: right;
}
</style>