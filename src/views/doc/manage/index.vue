<!-- doc管理页面 -->
<template>
  <div class="manage">
    <AdvancedSearch @queryBtn="queryBtn" @onHandleReset="emptyBtn" :isFileType="!fileType" />
    <div class="manage-box doc-tab-bar">
      <!-- 操作栏 -->
      <TabBar :PublicType="queryType != 1" @onNewFolder="onNewFolder" :ProadMap="roadMap" @onTitleNav="onTitleNav"
        :PMapIndex="MapIndex" @onShowtype="onShowtype" @onTabBarEvent="onTabBarEvent" @onDeleteBtn="onDeleteBtn"
        :PInArray="in_array" @onUpload="onUpload" />
    </div>

    <FileBox class="doc-file-box" :PublicType="queryType != 1" :spinning="spinning" :listdata="listData"
      @onSend="onSend" :showType="showType" @returnCheckedArray="onChecked" @onMenuCMD="onMenuCMD"
      @onDeleteBtn="onDeleteBtn" />

    <!-- 在线查看 -->
    <LinePreview v-if="currentFile.suffix" @onHide="Hide" :Pdata="currentFile" />

    <!-- 新建文件夹 -->
    <a-modal v-model:open="newDirVisible" width="350px" title="新建文件夹"
      :ok-button-props="{ props: { disabled: !dirName } }" @ok="onNewDir" :maskClosable="false">
      <span style="display: inline-block; margin-right: 5px">文件夹名称:</span>
      <a-input v-model:value="dirName" :maxLength="127" style="width: 200px" placeholder="请输入文件夹名称" />
    </a-modal>

    <!-- 上传文件 -->
    <a-modal v-model:open="uploadVisible" title="上传文件" :footer="null" :maskClosable="false">
      <div class="modalTop" style="margin-bottom: 10px">
        <div>
          是否公开：
          <a-switch checked-children="是" un-checked-children="否" v-model="isUpdatePublic" />
        </div>

        <a-button class="pirmaryBtn" style="margin-top: 10px" @click="selectFileBtn">
          <a-icon type="upload" />选择文件
        </a-button>
        <a-button style="margin: 10px 0 0 10px" type="primary" :loading="uploading"
          v-show="isUpdatePublic || !docConfig.filePermisEnable" :disabled="fileList.length === 0"
          @click="handleUpload">开始上传</a-button>
        <div id="doc-myfile">
          <a-upload :accept="accept" :file-list="fileList" :multiple="true" :before-upload="beforeUpload"
            :remove="handleRemove"></a-upload>
        </div>
      </div>

      <div class="upload-auth">
        <auth-box v-model="authData" v-if="docConfig.filePermisEnable" v-show="!isUpdatePublic" />
      </div>

      <div style="margin-top: 7px; text-align: right" v-if="docConfig.filePermisEnable" v-show="!isUpdatePublic">
        <a-button type="primary" :loading="uploading" :disabled="fileList.length === 0" @click="handleUpload">
          开始上传
        </a-button>
      </div>
      <!-- <div slot="footer">
        <div v-if="!isUpdatePublic && tableData.length > 0">
          <a-button key="submit" type="primary" :loading="loading" @click="handleOk"> 保存 </a-button>
        </div>
      </div> -->
    </a-modal>
  </div>
</template>

<script lang="ts">
//@ts-ignore
import AdvancedSearch from '../comps/search/index.vue' // 高级搜索
//@ts-ignore
import TabBar from '../comps/tabBar/index.vue'
//@ts-ignore
import FileBox from '../comps/fileBox/index.vue' // 视图
//@ts-ignore
import LinePreview from '../comps/linePreview/index.vue' // 在线预览
//@ts-ignore
import AuthBox from '../comps/fileBox/auth.vue'

import {
  apiDirSave,
  apiDirDelete,
  getApiFileFind,
  uploadBatch,
  apiFileDelete,
  apiPermisSave,
  apiConfig,
  apiFileDownload,
  apiStoreDownload,
  apiPermisUpdate,
} from '../api'

import { PREVIEW_TYPE, FILE_SUFFIX, IMAGE_SUFFIX } from '../config'
import dayjs from 'dayjs'
import { useDialog, useSession } from 'unione-base-vue'
import { message } from 'ant-design-vue'

export default {
  name: 'docManage',
  components: {
    AdvancedSearch,
    TabBar,
    FileBox,
    LinePreview,
    AuthBox,
  },
  data() {
    return {
      queryData: {
        type: 0,
        name: ''
      },
      /** 附件类型 null.全部 jpg.图片 等...*/
      fileType: null,
      /** 路线图 */
      roadMap: [],
      /** 新建文件夹视图控制器 */
      newDirVisible: false,
      /** 上传文件视图控制器 */
      uploadVisible: false,
      dirName: null,
      /** 文件、文件夹数据存储 */
      listData: [],
      /** 当前路线图下标指针 */
      MapIndex: -1,
      // 查看模式  视图/列表
      showType: 0,
      /** 选择的数据 */
      in_array: [],
      /** 当前登陆人信息 */
      principal: {},
      /** 上传附件文件数据 */
      fileList: [],
      uploading: false,
      /** 上传成功后返回数据列表 表头 */
      columns: [
        { title: '文件名称', dataIndex: 'title' },
        { title: '文件后缀', dataIndex: 'type' },
        { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: 'operation' } },
      ],
      /** 上传成功后返回数据列表 数据 */
      tableData: [],
      /** 是否默认上传公开文件 */
      isUpdatePublic: false,
      /** 当前附件信息 */
      currentFile: {
        suffix: '',
      },
      spinning: false,
      /** 允许上传的文件类型 */
      accept: '',
      authData: {
        permis: [],
      },
      /** 保存上传时的状态 */
      loading: false,
      /** doc配置 */
      docConfig: {
        filePermisEnable: false,
      },
      /** 查询类型  1.我的文档 2.我的公开 3.公开文件 */
      queryType: null,
      // 所属ID 场景管理使用
      ownerId: undefined
    }
  },
  setup() {
    const session = useSession()
    const dialog = useDialog()

    return {
      session,
      dialog,
    }
  },
  created() {
    this.principal = this.session.getPrincipal()

    /** 获取本地缓存中的查看模式 */
    this.showType = this.session.getStorage('doc:showType') || 0

    this.getConfig()
  },
  watch: {
    MapIndex: {
      handler() {
        this.doQuery()
      },
    },
    $route: {
      deep: true,
      immediate: true,
      handler(val) {
        this.fileType = null
        this.in_array = []

        if (val && val.meta.fileType) {
          this.fileType = val.meta.fileType
        }
        if (val && val.matched && val.matched[1]) {
          this.queryType = val.matched[1].meta.queryType || 1
          this.session.setStorage('doc:queryType', this.queryType + '')
        }
        if (val && val.query.ownerId) {
          this.ownerId = val.query.ownerId
        }
        this.roadMap = []
        this.MapIndex = -1
        this.doQuery()
      },
    },
  },
  methods: {
    /** 获取doc配置 */
    getConfig() {
      apiConfig().then((res: any) => {
        if (res.success) {
          this.docConfig = res.body
          this.session.setStorage('doc:config', JSON.stringify(this.docConfig))
        }
      })
    },
    async doQuery() {
      this.listData = []
      this.spinning = true
      this.listData = await this.getApiFiles().then((res: any) => res)
      this.spinning = false
    },
    /** 获取文件数据 */
    getApiFiles() {
      /** 设置查询类型 */
      let incTypes = FILE_SUFFIX[this.fileType || 0]
      let ninTypes: any = []
      if (this.fileType == 5 || this.queryData.type == 5) {
        incTypes = undefined
        ninTypes = ninTypes.concat(FILE_SUFFIX['1'], FILE_SUFFIX['2'], FILE_SUFFIX['3'], FILE_SUFFIX['4'])
      } else {
        ninTypes = undefined
      }

      if (this.queryData.type && this.queryData.type != 5) {
        //@ts-ignore
        incTypes = FILE_SUFFIX[`${this.queryData.type}`]
      }

      /** 设置上传格式 */
      let accept = ''
      if (incTypes) {
        //@ts-ignore
        incTypes.map((v: any) => {
          accept += `.${v},`
        })
      }
      this.accept = accept

      let params = {
        body: {
          //@ts-ignore
          dirId: this.MapIndex == -1 ? '-1' : this.roadMap[this.MapIndex].id,
          title: this.queryData.name,
          incTypes,
          ninTypes,
          ownerId: this.ownerId
        },
        sortOrder: 'ASC',
        pageSize: 99999,
      }
      return getApiFileFind(params, this.queryType || 0)
        .then((res: any) => {
          if (res.success) {
            res.body.map((v: any) => {
              Object.assign(v, {
                fileType: v.type,
                fileName: v.name,
                name: v.title,
                suffix: v.type,
              })
            })
            return res.body
          } else {
            message.error({ content: res.message, key: '服务器错误' })
            return []
          }
        })
        .catch((e: any) => {
          message.error({ content: '服务器错误', key: '服务器错误' })
          return []
        })
    },

    /** 保存附件上传是的权限 */
    async handleOk() {
      // this.loading = true
      let list = this.tableData
      let ids: any = []
      let permis = JSON.parse(JSON.stringify(this.authData.permis))
      let dirId = undefined

      list.map((v: any) => {
        ids.push(v.id)
        permis.map((p: any) => {
          Object.assign(p, {
            fileId: v.id,
            dirId: v.dirId != '-1' ? v.dirId : undefined,
            fileName: v.name,
            fileTitle: v.title,
            fileType: v.type,
            list: p.list.toString(),
            auditResult: 1,
          })
        })
      })
      let body = {
        ids,
        permis,
      }
      let data = await apiPermisSave(body)
      if (data.success) {
        this.fileList = []
        this.tableData = []
      } else {
        message.error(data.message)
      }
    },

    /** 新建文件夹回调 */
    onNewFolder() {
      this.newDirVisible = true
      this.dirName = null
    },
    /** 确认新建文件夹 事件 */
    onNewDir() {
      let body = {
        title: this.dirName,
        //@ts-ignore
        dirId: this.MapIndex > -1 ? this.roadMap[this.MapIndex].id : '-1',
        isPublic: 0,
        delFlag: 0,
        ownerId: this.ownerId
      }
      apiDirSave(body).then((res: any) => {
        if (res.success) {
          message.success('成功新增文件夹')
          this.newDirVisible = false
          this.dirName = null
          //@ts-ignore
          this.listData.push({
            ...body,
            id: res.body,
            fileType: 'dir',
            created: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          })
        } else {
          message.error(res.message)
        }
      })
    },

    /** 点击文件、文件夹 */
    onSend(record: any) {
      if (record.fileType == 'dir') {
        /**
         *  判断路线图 roadMap 是否存在数据
         *  如果存在数据则判断用户操作的文件夹和路线图的最后一个数据是否相等
         *  相等：指针指向路线图 roadMap 的最后一个
         *  不相等：对路线图 roadMap 的最后一个改为用户所操作的文件夹，指针改变
         */
        if (this.roadMap.length > 0) {
          if (this.cmp(record, this.roadMap[this.roadMap.length - 1])) {
            this.MapIndex = this.roadMap.length - 1
          } else {
            //@ts-ignore
            const index = this.roadMap.findIndex((e) => e.id === record.id)
            if (index === -1) {
              //@ts-ignore
              this.roadMap.splice(this.MapIndex + 1, this.roadMap.length - this.MapIndex, record)
              this.MapIndex = this.roadMap.length - 1
            } else {
              this.MapIndex = index
            }
          }
        } else {
          /**
           *  如果路线图 roadMap 不存在数据 则用户未对任何文件夹进行操作，
           *  则将用户所操作的文件夹数据存储在路线图 roadMap 中
           *  指针改变
           */
          //@ts-ignore
          this.roadMap.push(record)
          this.MapIndex++
        }
        return false
      }

      if (PREVIEW_TYPE.includes(record.suffix)) {
        if (!IMAGE_SUFFIX.includes(record.suffix)) {
          this.currentFile = record
        }
      } else {
        //@ts-ignore
        this.currentFile = {}
        message.warning('该格式类型暂无法在线查看，请自行下载后再查看')
        return false
      }
    },

    /** 隐藏当前显示的图片 */
    Hide() {
      //@ts-ignore
      this.currentFile = {}
    },

    /**
     * @description: onTitleNav 接收 TabBar 的导航标题事件
     * @param {Object} record title数据本身
     * @param {Number} index 指针下标
     */
    onTitleNav(record: any, index: number) {
      this.MapIndex = index
    },

    /**
     * @description: onTabBarEvent TabBar事件
     * @param {String} event onBack.后退  onForward.前进  onRefresh.刷新文件视图 download.下载
     * @return:
     */
    onTabBarEvent(event: any) {
      switch (event) {
        case 'onBack':
          this.MapIndex === -1 ? (this.MapIndex = -1) : this.MapIndex--
          break
        case 'onForward':
          this.MapIndex++
          break
        case 'onRefresh':
          this.doQuery()
          break
        case 'download':
          this.downloadBtn()
          break
      }
    },

    /** 附件右键指令 */
    onMenuCMD(event: any, fileData: any) {
      // console.log(event, fileData)
      switch (event) {
        case 'open':
          {
            this.onSend(fileData)
          }
          break
        case 'download':
          {
            //@ts-ignore
            this.downloadBtn(fileData)
          }
          break
        case 'onPublic':
          {
            //@ts-ignore
            this.doPublic(fileData)
          }
          break
      }
    },

    /**
     * @description: cmp 判断两个对象是否相等
     * @param {Object} x 第一个对象
     * @param {Object} y 第二个对象
     * @return: true/false
     */
    cmp(x: any, y: any) {
      // 如果x和y都为空或未定义且完全相同 返回true
      if (x === y) {
        return true
      }
      // 如果都不完全相等，x和y都必须是对象
      if (!(x instanceof Object) || !(y instanceof Object)) {
        return false
      }
      // 必须有完全相同的原型链
      if (x.constructor !== y.constructor) {
        return false
      }
      for (const p in x) {
        // eslint-disable-next-line no-prototype-builtins
        if (x.hasOwnProperty(p)) {
          // eslint-disable-next-line no-prototype-builtins
          if (!y.hasOwnProperty(p)) {
            return false
          }
          if (x[p] === y[p]) {
            continue
          }
          if (typeof x[p] !== 'object') {
            return false
          }
          //@ts-ignore
          if (!Object.equals(x[p], y[p])) {
            return false
          }
        }
      }

      for (const p in y) {
        // eslint-disable-next-line no-prototype-builtins
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
          return false
        }
      }

      return true
    },

    // 切换查看模式
    onShowtype() {
      this.showType = this.showType == 0 ? 1 : 0
      /** 把查看模式保存本地 */
      this.session.setStorage('showType', this.showType + '')
    },

    /**
     * @description: onChecked 选中某条
     * @param {Array} value 选中后返回来的数据
     */
    onChecked(value: any) {
      this.in_array = value
    },

    /** 公开操作 */
    doPublic(fileData: any) {
      if (!fileData) {
        return false
      }
      this.dialog.confirm({
        title: '提示',
        content: '确定公开此文件?',
        onOk: async () => {
          let permis = [
            {
              ownerType: 'public',
              ownerTitle: '文件公开',
              ownerId: -1,
              list: 'download',
            },
          ]
          let body: any = {
            id: fileData.id,
            title: fileData.title,
            auditStatus: fileData.isPublic == 1 ? undefined : 1,
            isPublic: fileData.isPublic == 1 ? 0 : 1,
            permis: fileData.isPublic == 1 ? [] : permis,
          }
          let data = await apiPermisUpdate(body)
          if (data.success) {
            //@ts-ignore
            this.listData.forEach((e: any) => {
              if (e.id == body.id) {
                e.isPublic = body.isPublic
                e.permis = body.permis
              }
            })
            // message.success('成功申请公开')
          } else {
            message.error(data.message)
          }
        },
      })
    },

    /**
     * @description: downloadBtn 下载事件
     */
    async downloadBtn(fileData?: any) {
      let fileList: any = []
      if (fileData) {
        fileList.push(fileData)
      } else {
        fileList = this.listData.filter((r: any) => r.ischecked)
      }

      let data: any = {}
      if (fileList.length > 1) {
        //@ts-ignore
        let dirIds = fileList.filter((e) => e.fileType == 'dir').map((e) => e.id)
        //@ts-ignore
        let filesIds = fileList.filter((e) => e.fileType != 'dir').map((e) => e.id)
        console.log('目录id', dirIds, '附件id', filesIds)
        // return
        if (filesIds.length <= 0) {
          if (dirIds.length > 0) {
            message.warning('暂不支持文件夹下载!')
          }
          return
        }
        data = await apiStoreDownload(filesIds)
      } else {
        //@ts-ignore
        let dirIds = fileList.filter((e) => e.fileType == 'dir').map((e) => e.id)
        //@ts-ignore
        let filesIds = fileList.filter((e) => e.fileType != 'dir').map((e) => e.id)
        console.log('目录id', dirIds, '附件id', filesIds)
        //@ts-ignore
        if (dirIds.length > 0) {
          message.warning('暂不支持文件夹下载!')
          return
        } else {
          data = await apiFileDownload(filesIds[0])
        }
      }
      //@ts-ignore
      if (data.status == 200) {
        if (!data.headers['content-disposition']) {
          message.error('下载失败!')
          return
        }
        let temp = data.headers['content-disposition'].split(';')[1].split('filename=')[1]
        var fileName = decodeURIComponent(temp)
        var reader = new FileReader()
        reader.readAsDataURL(data.data) // 转换为 base64，可以直接放入 a 标签 href
        reader.onload = function (e) {
          // 转换完成，创建一个 a 标签用于下载
          var a = document.createElement('a')
          a.download = fileName //自定义下载文件名称
          //@ts-ignore
          a.href = e.target.result
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } else {
        message.error('下载失败!')
      }
    },

    /** 删除事件 */
    onDeleteBtn(fileData: any) {
      this.dialog.confirm({
        title: '提示',
        content: `确定删除这些 ${fileData ? (fileData.fileType == 'dir' ? '文件夹' : '文件') : '文件 / 文件夹'} ? `,
        onOk: async () => {
          /** 文件id */
          let fileSids: any = []
          if (fileData) {
            //@ts-ignore
            fileSids.push(fileData.id)
          } else {
            fileSids = this.listData.filter((r: any) => r.ischecked).map((r: any) => r.id)
          }
          // console.log(this.in_array)
          // return

          let isOk = true
          let key = 'deleteMessage'
          if (fileSids.length > 0) {
            isOk = false
            await apiFileDelete(fileSids).then((res: any) => {
              if (res.success) {
                isOk = true
                //@ts-ignore
                this.listData = this.listData.filter((e) => !fileSids.includes(e.id))
              } else {
                message.error({ content: res.message, key })
              }
            })
          }
          if (isOk) {
            message.success(`已删除${fileSids.length}个`)
            this.in_array = []
          }
        },
      })
    },

    /** 上传文件 */
    onUpload() {
      this.uploadVisible = true
      this.tableData = []
    },

    /**
     * @description: selectFileBtn 选择文件
     */
    selectFileBtn() {
      //@ts-ignore
      const btn = document.getElementById('doc-myfile').getElementsByTagName('input')[0]
      btn.click()
    },

    /**
     * @description: deleteItemBtn 上传后回调表格的数据删除按钮
     * @param {Object} record 对象
     */
    deleteItemBtn(record: any) {
      this.dialog.confirm({
        title: '提示',
        content: '确定删除此文件 ? ',
        onOk: async () => {
          await apiFileDelete({ body: [record.id] }).then((res: any) => {
            if (res.success) {
              //@ts-ignore
              const index = this.tableData.findIndex((e) => e.id === record.id)
              this.tableData.splice(index, 1)
              this.listData.splice(
                //@ts-ignore
                this.listData.findIndex((e) => e.id === record.id),
                1
              )
            } else {
              message.error(res.message)
            }
          })
        },
      })
    },

    /**
     * @description: handleRemove 点击移除文件时的回调
     * @return: 上传功能事件
     */
    handleRemove(file: any) {
      //@ts-ignore
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    /**
     * @description: beforeUpload 上传文件之前的钩子，参数为上传的文件 上传功能事件
     * @return: 上传功能事件
     */
    beforeUpload(file: any) {
      if (file.size > 52428800) {
        message.warning('文件过大,文件大小不能超过50MB')
        return false
      }
      //@ts-ignore
      this.fileList = [...this.fileList, file]
      return false
    },

    /**
     * @description: handleUpload 上传提交按钮
     */
    handleUpload() {
      this.uploading = true
      const formData = new FormData()
      this.fileList.map((v, i) => {
        formData.append('file', v)
      })
      this.$nextTick(() => {
        //@ts-ignore
        formData.append('isPublic', this.isUpdatePublic ? 1 : 0)
        //@ts-ignore
        formData.append('dirId', this.MapIndex > -1 ? this.roadMap[this.MapIndex].id : '-1')
        uploadBatch(formData, this.ownerId)
          .then(async (res: any) => {
            this.uploading = false
            if (res.success) {
              res.body.map((v: any) => {
                Object.assign(v, {
                  fileType: v.type,
                  name: v.title,
                  suffix: v.type,
                })
              })
              this.tableData = res.body
              if (this.authData.permis && this.authData.permis.length > 0) {
                await this.handleOk()
              } else {
                this.fileList = []
              }
              this.listData = this.listData
                .concat(res.body)
                //@ts-ignore
                .sort((a, b) => dayjs(a.created).valueOf() - dayjs(b.created).valueOf())
              this.$nextTick(() => {
                this.uploadVisible = false
                message.success('附件上传成功')
              })
            } else {
              message.error(res.message)
            }
          })
          .catch((err: any) => {
            console.log(err.message)
            this.uploading = false
            message.error('上传失败服务器错误')
          })
      })
    },

    /** 高级查询 */
    queryBtn(param: any) {
      this.queryData = param
      this.doQuery()
    },
    /** 重置 */
    emptyBtn() {
      //@ts-ignore
      this.queryData = {}
      this.doQuery()
    },
  },
}
</script>
<style lang='less' scoped>
.manage {
  overflow: hidden;
  padding: 10px;

  .manage-box {
    border: 1px #eee solid;
  }
}

.upload-auth {
  /deep/ .auth_manage {
    .tabs {
      .tab {
        &:first-child {
          border-left: 1px #d9d9d9 solid;
        }
      }
    }

    .content {
      border: 1px #d9d9d9 solid;
    }
  }
}
</style>
