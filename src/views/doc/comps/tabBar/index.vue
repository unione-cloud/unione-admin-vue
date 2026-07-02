<!-- TabBar 按钮栏 -->
<template>
  <div class="TabBarBox">
    <div class="TabBar">
      <div class="btn" @click="showUpload" v-if="!PublicType">
        <a-icon type="upload" />
        <span>上传</span>
      </div>
      <div class="loading" v-if="loading">
        <div class="bgmask"><a-spin size="large" tip="加载中..." /></div>
        <div class="popur-node"></div>
      </div>
      <div class="btn" @click="downloadBtn" :class="[
        {
          isdisabled:
            PInArray.length < 1 ||
            (docQueryType == 3 &&
              PInArray.filter((e) => e.permisKeys && e.permisKeys.includes('download')).length <= 0),
        },
      ]">
        <a-icon type="download" />
        <span>下载</span>
      </div>
      <!-- <div
        class="btn"
        :class="[{ isdisabled: PInArray.filter((e) => e.fileType == 'DIR').length == PInArray.length }]"
        @click="onMenu"
      >
        <a-icon type="share-alt" />
        <span>公开</span>
      </div> -->
      <div v-if="!PublicType" class="btn" :class="[{ isdisabled: PInArray.length < 1 }]" @click="deleteBtn">
        <a-icon type="delete" />
        <span>删除</span>
      </div>
      <div class="btn" @click="onNewFolder" v-if="!PublicType">
        <a-icon type="folder-add" />
        <span>新建文件夹</span>
      </div>
      <div class="btn" @click="changeShowtype" onselectstart="return false">
        <a-icon :type="showType ? 'unordered-list' : 'appstore'" />
      </div>
    </div>
    <div class="FileOn">
      <div class="TopLeft">
        <div :title="PMapIndex > -1 ? (PMapIndex > 0 ? titleMap[PMapIndex].name : `全部`) : null"
          :class="[{ isdisabled: PMapIndex === -1 }, 'btn']" @click="onBack">
          <LeftOutlined />
        </div>
        <div :title="PMapIndex < ProadMap.length - 1 ? ProadMap[PMapIndex + 1].name : null"
          :class="[{ isdisabled: PMapIndex === ProadMap.length - 1 }, 'btn']" @click="onForward">
          <RightOutlined />
        </div>
        <div class="btn" @click="onRefresh" title="重新加载">
          <a-icon type="redo" />
        </div>
      </div>
      <div class="TOPRight" onselectstart="return false">
        <span @click="onTitleNav(null, -1)">
          {{ $route.meta.title || '全部' }}
          <RightOutlined />
        </span>
        <span v-for="(item, index) in titleMap" :key="item.sid" @click="onTitleNav(item, index)">
          {{ item.title }}
          <RightOutlined />
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { useSession } from 'unione-base-vue';


export default {
  name: 'DocTabBar',
  props: {
    PublicType: {
      type: Boolean,
      default: () => false,
    },
    /** 传入来的路线图 */
    ProadMap: {
      type: Array,
      default: () => [],
    },
    /** 传入的当前指针 */
    PMapIndex: {
      type: Number,
      default: -1,
    },
    /** 传入的选择数据 */
    PInArray: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      /** showType 查看方式 0.视图 1.表格 */
      showType: 0,
      loading: false,
      /** 当前指针前的数据 */
      titleMap: [],
      MapIndex: -1,
    }
  },
  setup() {
    const session = useSession()

    return {
      session,
    }
  },
  created() {
    this.principal = this.session.getPrincipal()
    /** 获取本地缓存中的查看模式 */
    this.showType = this.session.getStorage('doc:showType') || 0
  },
  watch: {
    PMapIndex: {
      deep: true,
      immediate: true,
      handler(value) {
        if (value > -1) {
          // if (this.MapIndex < value) {
          const arr = []
          for (let i = 0; i <= value; i++) {
            arr.push(this.ProadMap[i])
          }
          this.titleMap = arr
          // } else {
          //   this.titleMap.pop()
          // }
        } else {
          this.titleMap = []
        }
        // this.MapIndex = value
      },
    },
    PInArray: {
      deep: true,
      immediate: true,
      handler(val) { },
    },
  },
  computed: {
    docQueryType() {
      return this.session.getStorage('doc:queryType') || 0
    },
  },
  // 方法集合
  methods: {
    /**
     * @description: onMenu 右键事件回调
     * @param {Object} param 回调数据
     */
    onMenu(param) {
      if (this.PInArray.filter((e) => e.fileType == 'DIR').length == this.PInArray.length) {
        return false
      }
      // console.log(1)
      let fileSids = this.PInArray.filter((e) => e.fileType != 'DIR')
      console.log(fileSids, 'fileSids')
      return
      // let obj = this.in_array[0]
      // if (obj.orgId !== this.principal.orgId) {
      //   return this.$message.warning('非本部门人员无法进行操作')
      // }
      // let open = obj.open == 0 ? 1 : 0
      // let pass = obj.fileType
      // let thes = this
      // this.$confirm({
      //   title: '提示',
      //   content: (h) => <div>确定{thes.PublicTitle}该资料?</div>,
      //   onOk() {
      //     let index = 0
      //     let length = thes.in_array.filter((e) => e.open != open).length
      //     thes.in_array.map((v) => {
      //       if (v.open != open) {
      //         getdocumentsFileOpenPassWith({ sid: v.sid, open, type: 1, pass: v.fileType }).then((res) => {
      //           if (res.success) {
      //             index++
      //             if (index >= length) {
      //               thes.onRefresh()
      //             }
      //           }
      //         })
      //       }
      //     })
      //   },
      //   onCancel() { },
      //   class: 'test',
      // })
    },

    /**
     * @description: showUpload 附件上传事件
     */
    showUpload() {
      this.$emit('onUpload')
      return false
    },

    /**
     * @description: changeShowtype 切换浏览视图事件
     */
    changeShowtype() {
      this.$emit('onShowtype')
      this.showType = this.showType == 0 ? 1 : 0
      return false
    },

    /**
     * @description: showDir 新建文件夹事件
     */
    onNewFolder() {
      this.$emit('onNewFolder')
      return false
    },

    /**
     * @description: deleteBtn 删除事件
     */
    deleteBtn() {
      if (this.PInArray.length <= 0) {
        return false
      }
      this.$emit('onDeleteBtn')
    },

    /**
     * @description: onBack 后退
     */
    onBack() {
      if (this.PMapIndex > -1) {
        this.$emit('onTabBarEvent', 'onBack')
      }
      return false
    },

    /**
     * @description: onForward 前进事件
     */
    onForward() {
      if (this.PMapIndex === this.ProadMap.length - 1) {
        return false
      }
      this.$emit('onTabBarEvent', 'onForward')
    },

    /**
     * @description: onRefresh 刷新文件
     */
    onRefresh() {
      this.$emit('onTabBarEvent', 'onRefresh')
      return false
    },

    /**
     * @description: onTitleNav 路线导航
     * @param {Object} record title数据本身
     * @param {Number} index 指针下标
     * @return:
     */
    onTitleNav(record, index) {
      this.$emit('onTitleNav', record, index)
    },

    /**
     * @description: downloadBtn 下载事件
     */
    async downloadBtn() {
      // this.$emit('download')
      // return
      if (this.PInArray.length <= 0) {
        return false
      }
      this.$emit('onTabBarEvent', 'download')
      return
      // let fileId = this.PInArray[0].sid

      // let data = {}
      // if (this.PInArray.length > 1) {
      //   fileId = this.PInArray.map((v) => v.sid)
      //   data = await apiStoreDownload(fileId)
      // } else {
      //   data = await apiFileDownload(fileId)
      // }

      // if (data.status == 200) {
      //   let temp = data.headers['content-disposition'].split(';')[1].split('filename=')[1]
      //   var fileName = decodeURIComponent(temp)
      //   var reader = new FileReader()
      //   reader.readAsDataURL(data.data) // 转换为 base64，可以直接放入 a 标签 href
      //   reader.onload = function (e) {
      //     // 转换完成，创建一个 a 标签用于下载
      //     var a = document.createElement('a')
      //     a.download = fileName //自定义下载文件名称
      //     a.href = e.target.result
      //     document.body.appendChild(a)
      //     a.click()
      //     document.body.removeChild(a)
      //   }
      // } else {
      //   thas.$message.error('下载失败!')
      // }
    },

    /**
     * @description: downloadFiles 文件下载
     * @param {String} url API路径
     */
    downloadFiles(url) {
      let thas = this
      this.isloading = true
      // var url = '/documentsFile/download?pass=FILE_2188998458285981756,FILE_2188998458285981758' //请求的 URl
      var xhr = new XMLHttpRequest() //定义 http 请求对象
      xhr.open('get', url, true)
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      xhr.send()
      xhr.responseType = 'blob' // 返回类型 blob
      xhr.onload = function () {
        thas.isloading = false
        // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
        if (this.status === 200) {
          var blob = this.response
          let temp = xhr.getResponseHeader('content-disposition').split(';')[1].split('filename=')[1]
          var fileName = decodeURIComponent(temp)
          var reader = new FileReader()
          reader.readAsDataURL(blob) // 转换为 base64，可以直接放入 a 标签 href
          reader.onload = function (e) {
            // 转换完成，创建一个 a 标签用于下载
            var a = document.createElement('a')
            a.download = fileName //自定义下载文件名称
            a.href = e.target.result
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }
        } else {
          thas.$message.error('下载失败!')
        }
      }
    },
  },
}
</script>
<style lang='less' scoped>
.TabBarBox {
  background: white;

  .TabBar {
    width: 100%;
    overflow: hidden;
    padding: 5px;
    // background: #eee;
    border-bottom: 1px #eee solid;
    line-height: 34px;

    .btn {
      margin: 0 5px;
      cursor: pointer;
      padding: 0 5px;
      float: left;
      transition: all 0.5s;

      span {
        margin: 0 5px;
      }

      &:last-child {
        float: right;
      }

      &.isdisabled {
        color: #aaa;
      }
    }
  }

  .FileOn {
    border-bottom: 1px #eee solid;
    padding: 5px 0;
    width: 100%;
    overflow: hidden;

    .TopLeft {
      display: inline-block;
      padding: 0 5px;
      border-right: 1px #999 solid;
      float: left;

      .btn {
        margin: 0 5px;
        cursor: pointer;
        padding: 0 5px;
        float: left;

        &.isdisabled {
          color: #aaa;
        }
      }
    }

    .TOPRight {
      display: inline-block;
      float: left;
      margin: 0 10px;
      -moz-user-select: none;
      /*火狐*/
      -webkit-user-select: none;
      /*webkit浏览器*/
      -ms-user-select: none;
      /*IE10*/
      -khtml-user-select: none;
      /*早期浏览器*/
      user-select: none;

      span {
        cursor: pointer;
      }
    }
  }

  .loading {
    .popur-node {
      width: 100vw;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      background: rgba(230, 247, 255, 0.2);
      z-index: 999;
    }

    .bgmask {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 10001;
    }
  }
}
</style>
