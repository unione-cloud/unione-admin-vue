<!-- 自定义弹窗 -->
<template>
  <div v-if="!isClose">
    <div class="custom_window" :id="`custom_window_${name}_${id}`" :style="{
      width: widthNum + 'px',
      height: heightNum + 'px',
      borderColor: isActive ? '#1889f1' : '#d4cbcb',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: isActive ? '1000' : '999',
    }" @mousedown="$emit('active', { name, id })">
      <div class="head" @mousedown="mousedown">
        <div class="title" :style="{ color: isActive && '#000' }">{{ title }}</div>
        <div class="close" @click="onClose">
          <a-icon type="close" />
        </div>
      </div>
      <div class="content">
        <slot name="content" />
      </div>
      <div class="footer">
        <div class="btn" :class="[isActive && 'active']" @click="toConfirm">确定</div>
        <div class="btn" @click="onClose">取消</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomWindow',
  components: {},
  props: {
    name: {
      type: String,
    },
    id: {
      type: String,
    },
    title: {
      type: String,
    },
    /** 是否激活 */
    isActive: {
      type: Boolean,
      default: true,
    },
    /** 元素下标 */
    elIndex: {
      type: Number,
    },
    width: {
      type: [String, Number],
      default: () => 420,
    },
    height: {
      type: [String, Number],
      default: () => 680,
    },
  },
  data() {
    return {
      x: 0,
      y: 0,
      isPublic: false,
      widthNum: null,
      heightNum: null,
      isClose: false,
    }
  },
  watch: {
    width: {
      immediate: true,
      handler(val) {
        if (typeof val == 'string') {
          this.widthNum = parseInt(val.split('px')[0])
          return false
        }
        this.widthNum = val
      },
    },
    height: {
      immediate: true,
      handler(val) {
        if (typeof val == 'string') {
          this.heightNum = parseInt(val.split('px')[0])
          return false
        }
        this.heightNum = val
      },
    },
  },
  //创建完成 访问当前this实例
  created() {
    this.x = document.documentElement.clientWidth / 2 - this.widthNum / 2 + this.elIndex * 5
    this.y = document.documentElement.clientHeight / 2 - this.heightNum / 2 + this.elIndex * 5
  },
  //挂载完成 访问DOM元素
  mounted() { },
  //方法集合
  methods: {
    onClose() {
      this.$emit('close', { name: this.name, id: this.id })
      this.$nextTick(() => {
        this.isClose = true
      })
    },

    /** 确认 */
    toConfirm() {
      this.$emit('confirm', { name: this.name, id: this.id })
    },

    /** 鼠标按下事件 */
    mousedown(event) {
      let flag = true
      let videoModal = document.getElementById(`custom_window_${this.name}_${this.id}`)

      const disX = event.clientX - videoModal.offsetLeft
      const disY = event.clientY - videoModal.offsetTop
      let MaxH = document.documentElement.clientHeight
      let MaxW = document.documentElement.clientWidth

      // 开始移动
      document.onmousemove = (ev) => {
        if (!flag) {
          return false
        }
        videoModal.style.left =
          ev.clientX - disX > 0
            ? ev.clientX - disX < MaxW - videoModal.clientWidth
              ? `${ev.clientX - disX}px`
              : `${MaxW - videoModal.clientWidth}px`
            : '0px'
        videoModal.style.top =
          ev.clientY - disY > 0
            ? ev.clientY - disY < MaxH - videoModal.clientHeight
              ? `${ev.clientY - disY}px`
              : `${MaxH - videoModal.clientHeight}px`
            : '0px'
      }
      // // 鼠标弹起
      document.onmouseup = (ev) => {
        if (!flag) return false
        flag = false
      }
      return false
    },
  },
}
</script>
<style lang='less' scoped>
.custom_window {
  width: 420px;
  height: 680px;
  position: fixed;
  left: 30px;
  top: 30px;
  background: white;
  border: 1px #1889f1 solid;
  z-index: 999;

  .head {
    height: 32px;
    line-height: 32px;
    margin-left: 10px;

    .title {
      cursor: default;
    }

    .close {
      width: 32px;
      height: 32px;
      position: absolute;
      top: 0;
      right: 0;
      text-align: center;

      &:hover {
        background: red;
        color: white;
      }
    }
  }

  .content {
    width: 100%;
    height: calc(100% - 32px - 50px);
    background: #f0f0f0;
    padding: 10px;
    padding-bottom: 0;
  }

  .footer {
    width: 100%;
    height: 50px;
    text-align: right;
    background: #f0f0f0;
    padding: 0 10px;
    line-height: 50px;

    .btn {
      width: 80px;
      text-align: center;
      display: inline-block;
      margin-left: 10px;
      background: #f0f0f0;
      border: 1px #d9d9d9 solid;
      font-size: 14px;
      line-height: 26px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: #e5f1fb;
        border: 1px #1889f1 solid;
      }

      &.active {
        background: #e5f1fb;
        border: 2px #1889f1 solid;
      }

      &.isdisabled {
        background: #cccccc;
        color: #a7a2a2;
        cursor: default;

        &:hover {
          background: #cccccc;
          border: 1px #d9d9d9 solid;
        }
      }
    }
  }
}
</style>