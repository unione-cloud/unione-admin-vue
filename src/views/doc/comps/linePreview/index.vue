<!-- eslint-disable vue/multi-word-component-names -->
<!-- 在线预览 -->
<template>
  <div class="ViewBoxLine">
    <div v-if="VIDEO_SUFFIX.includes(suffix)" class="video_Player">
      <div class="popur-node" @click="Hide"></div>
      <span class="close-bgmask" @click="Hide"></span>
      <div class="video-player" ref="videoPlayer"></div>
    </div>
    <div v-if="pdfUrl" class="Pdf_box">
      <span class="close-bgmask" @click="Hide"></span>
      <iframe :src="config.axios.admin + `/pdf/web/viewer.html?file=${pdfUrl}&permisKeys=${Pdata.permisKeys}`"></iframe>
    </div>
    <a-modal wrapClassName="unione-modal-full txt-file-preview" v-model:open="textVisible" :title="Pdata.name"
      :footer="null">
      <unione-code-editor v-model:value="txtData" :lang="Pdata.suffix" disabled></unione-code-editor>
    </a-modal>
  </div>
</template>

<script>
import { VIDEO_SUFFIX, PREVIEW_TYPE, PDF_SUFFIX, TXT_SUFFIX } from '../../config'
import { getFile } from '../../api'
import { useConfigStore } from '@/config';
import { message } from 'ant-design-vue';

export default {
  name: 'LinePreview',
  props: {
    Pdata: {
      type: Object,
      default: () => { },
    },
  },
  data() {
    return {
      suffix: null,
      imgWidth: 300,
      VIDEO_SUFFIX,
      /**
       * bDrag  鼠标移动的开关
       * imgLeft  图片的X轴
       * imgTop 图片的Y轴
       */
      bDrag: false,
      imgLeft: 0,
      imgTop: 0,
      pdfUrl: null,
      /** 文本视图控制器 */
      textVisible: false,
      /** 文本内容 */
      txtData: null,
    }
  },
  setup(props) {
    const config = useConfigStore().config

    return {
      config
    }
  },
  watch: {
    textVisible: {
      handler(val) {
        if (!val) {
          this.Hide()
        }
      },
    },
  },
  created() {
    this.suffix = this.Pdata.suffix
    this.imgLeft = document.documentElement.clientWidth / 2 - 150
    this.imgTop = document.documentElement.clientHeight / 2 - 150
  },
  mounted() {
    if (VIDEO_SUFFIX.includes(this.suffix)) {
      this.$nextTick(() => {
        this.videoPlayer = new Jessibuca({
          container: $container,
          videoBuffer: 0.2, // 缓存时长
          isResize: false,
          text: '',
          loadingText: '',
          useMSE: false,
          debug: true,
          showBandwidth: true, // 显示网速
          operateBtns: {
            fullscreen: true,
            screenshot: true,
            play: true,
            audio: true,
            recorder: false
          },
          forceNoOffscreen: true,
          isNotMute: false,
          decoder: '/video/decoder.js'
        })

        this.jessibuca.on('audioInfo', function (audioInfo) {
          console.log('audioInfo', audioInfo)
        })

        this.jessibuca.on('videoInfo', function (videoInfo) {
          console.log('videoInfo', videoInfo)
        })
      })
    } else {
      this.getFile(this.Pdata)
    }
  },
  // 方法集合
  methods: {
    /** 获取文件 */
    async getFile(record) {
      this.pdfUrl = ''
      this.textVisible = false
      if (TXT_SUFFIX.includes(this.suffix)) {
        this.textVisible = true
        let data = await getFile(record, 'text').catch((err) => {
          message.error(err)
        })
        this.txtData = data.data
      } else if (PDF_SUFFIX.includes(this.suffix)) {
        this.pdfUrl = this.config.axios.admin + `/api/common/store/preview/${record.id}`
      }
    },

    /**
     * @description: Hide 隐藏当前显示的图片
     */
    Hide() {
      this.$emit('onHide')
    },

    handleError() {
      message.error('图片加载失败')
    },

    /**
     * @description: handlePulley 滑轮放大事件
     * @param {object}  event事件
     * @return: false
     */
    handlePulley(event) {
      const UpDown = event.wheelDelta
      if (UpDown > 0) {
        this.imgWidth += 20
        this.imgTop -= 5
        this.imgLeft -= 10
      } else {
        if (this.imgWidth > 20) {
          this.imgWidth -= 20
          this.imgTop += 5
          this.imgLeft += 10
        } else {
          this.imgWidth = 20
        }
      }

      return false
    },

    /**
     * @description: handleDragStart 图片移动事件
     *    移动事件使用document事件是因为解决卡顿问题
     * @param {object} event事件
     * @return: false
     */
    handleDragStart(event) {
      let bDrag = true
      const disX = event.clientX - document.querySelector('.view-img-wrap').offsetLeft
      const disY = event.clientY - document.querySelector('.view-img-wrap').offsetTop
      // 开始移动
      document.onmousemove = (ev) => {
        if (!bDrag) {
          return false
        }
        this.imgLeft = ev.clientX - disX
        this.imgTop = ev.clientY - disY
      }
      // 鼠标弹起
      document.onmouseup = (ev) => {
        if (!bDrag) return false
        bDrag = false
      }
      return false
    },
  },
  unmounted() {
    if (this.videoPlayer) {
      this.videoPlayer.pause()
    }
  },
}
</script>
<style lang='less' scoped>
.ViewBoxLine {
  .img_box {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10000000000;
    display: block;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    text-align: center;
    font-size: 0;

    .popur-node {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 100;
    }

    .view-img-wrap {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 1002;
      width: 40%;
      vertical-align: middle;
      cursor: move;
      -moz-user-select: none;
      /*火狐*/
      -webkit-user-select: none;
      /*webkit浏览器*/
      -ms-user-select: none;
      /*IE10*/
      -khtml-user-select: none;
      /*早期浏览器*/
      user-select: none;

      img {
        position: relative;
        z-index: -1;
        width: 100%;
        height: 100%;
      }
    }
  }

  .Pdf_box {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10000000000;
    display: block;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    text-align: center;
    font-size: 0;

    iframe {
      width: 100%;
      height: 100%;
    }
  }

  .close-bgmask {
    position: absolute;
    top: 30px;
    right: 30px;
    z-index: 19921202;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #c2c2c2;
    cursor: pointer;

    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -2px;
      margin-left: -10px;
      width: 20px;
      height: 4px;
      background-color: #fff;
      content: '';
      transform: rotateZ(-45deg);
    }

    &::after {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -2px;
      margin-left: -10px;
      width: 20px;
      height: 4px;
      background-color: #fff;
      content: '';
      transform: rotateZ(45deg);
    }
  }

  .video_Player {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10000000000;
    display: block;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    text-align: center;
    font-size: 0;

    .popur-node {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 100;
    }

    #example_video_1 {
      top: 50%;
      left: 50%;
      position: absolute;
      width: 60%;
      height: 50%;
      z-index: 101;
      transform: translate(-50%, -50%);
    }
  }

  .loading {
    .popur-node {
      width: 100vw;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999;
    }

    .bgmask {
      position: absolute;
      top: 50%;
      left: 50%;
    }
  }
}
</style>
<style lang="less">
.txt-file-preview {
  .left-mask {
    height: calc(100% - 75px) !important;
  }

  .ant-modal-body {
    overflow-y: auto;
  }
}
</style>