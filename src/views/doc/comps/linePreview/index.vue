<!-- eslint-disable vue/multi-word-component-names -->
<!-- 在线预览 -->
<template>
  <div class="ViewBoxLine">

    <!-- 视频文件播放 -->
    <div v-if="VIDEO_SUFFIX.includes(suffix)" class="video_Player">
      <div class="popur-node" @click="Hide"></div>
      <span class="close-bgmask" @click="Hide"></span>
      <video class="video-player mp4" :src="mp4Url" controls v-if="mp4Url" autoplay></video>
      <div class="video-player" ref="videoPlayer" v-else></div>
    </div>

    <!-- PDF文件预览 -->
    <div v-if="pdfUrl" class="Pdf_box">
      <!-- <iframe :src="config.axios.admin + `/pdf/web/viewer.html?file=${pdfUrl}&permisKeys=${Pdata.permisKeys}`"></iframe> -->
      <unione-pdf-view :url="pdfUrl" :title="Pdata.title" @close="Hide"></unione-pdf-view>
    </div>

    <!-- 文本文件预览 -->
    <a-modal wrapClassName="unione-modal-full txt-file-preview" v-model:open="textVisible" :title="Pdata.name"
      :footer="null">
      <unione-code-editor v-model:value="txtData" :lang="Pdata.suffix" disabled></unione-code-editor>
    </a-modal>
  </div>
</template>

<script>
import { VIDEO_SUFFIX, PDF_SUFFIX, TXT_SUFFIX } from '../../config'
import { getFile } from '../../docApi'
import { useConfigStore } from '@/config';
import { message } from 'ant-design-vue';
import UnionePdfView from '../../pdf.vue'

export default {
  name: 'LinePreview',
  components: {
    UnionePdfView
  },
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
      mp4Url: null,
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
      if (this.suffix === 'mp4') {
        this.mp4Url = this.config.axios.admin + `/api/common/store/stream/${this.Pdata.id}.mp4`
        return
      }
      if (window.Jessibuca) {
        this.$nextTick(() => {
          this.initVideoPlayer()
        })
      } else {
        const dom = document.querySelector('#JessibucaLoader')
        if (dom) {
          dom.remove()
        }
        const script = document.createElement('script')
        script.src = this.config.web.ctx + '/video/jessibuca.js'
        script.id = 'JessibucaLoader'
        script.onload = () => {
          this.initVideoPlayer()
        }
        document.body.appendChild(script)
      }
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

    initVideoPlayer() {
      this.videoPlayer = new Jessibuca({
        container: this.$refs.videoPlayer,
        videoBuffer: 0.2, // 缓存时长
        enableStashBuffer: false,
        cacheSegmentCount: 0,
        lowLatencyMode: true,
        isResize: false,
        text: '',
        loadingText: '加载中...',
        useMSE: true,
        autoWasm: true,
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
        decoder: this.config.web.ctx + '/video/decoder.js'
      })
      this.videoPlayer.on('audioInfo', function (audioInfo) {
        console.log('audioInfo', audioInfo)
      })
      this.videoPlayer.on('videoInfo', function (videoInfo) {
        console.log('videoInfo', videoInfo)
      })
      const host = window.location.protocol + '//' + window.location.host
      const url = host + this.config.axios.admin + `/api/common/store/stream/${this.Pdata.id}.${this.Pdata.suffix}`
      console.log('play video url', url)
      this.videoPlayer.play(url)
      // //this.videoPlayer.play('http://pull-demo.volcfcdnrd.com/live/st-4536523_yzmhde.flv')
      // this.videoPlayer.play(url.replace('5173', '8080') + '?token=Y0Spf/Rz6no/rekGaC5OJ4N0uhk6ZiyfNaEgOOASZgyetcEXGIGE1eQXNLLK9KEf')

    },

    /**
     * @description: Hide 隐藏当前显示的图片
     */
    Hide() {
      this.$emit('onHide')
      if (this.videoPlayer) {
        this.videoPlayer.destroy()
      }
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

  .video-player {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    display: block;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    text-align: center;
    font-size: 0;

    &.mp4 {
      background-color: #000000;
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