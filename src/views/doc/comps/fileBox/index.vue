<!-- 文件/文件夹视图组件 -->
<template>
  <a-spin :spinning="spinning" style="background: white">
    <div class="Box" id="Box">
      <div v-show="showType == 0" :class="['FileBox', env && 'FileBoxPro', 'scrollBar']" ref="fileBox">
        <a-empty v-if="sort_data.length <= 0" style="margin-top: 20px" />
        <!-- @click="isRename ? null : onSend(item)" -->
        <div class="fileItem" :class="{ activity: item.ischecked || currentFileData.id == item.id }" :key="item.id"
          @dblclick="isRename ? null : onSend(item)" @click="(e) => onChecked(e, item, index)" :title="item.name"
          v-for="(item, index) in sort_data" @contextmenu.prevent="(e) => onMenu(e, item)">
          <div class="layui-annex-file-icon fileicon-large-review" :class="[
            item.fileType === 'dir'
              ? 'dir-large'
              : ['jpg', 'jpeg'].includes(item.suffix) && item.error
                ? 'fileicon-large-jpg'
                : ['png'].includes(item.suffix) && item.error
                  ? 'fileicon-large-png'
                  : ['gif'].includes(item.suffix) && item.error
                    ? 'fileicon-large-gif'
                    : ['xls'].includes(item.suffix)
                      ? 'fileicon-large-xls'
                      : ['xlsx'].includes(item.suffix)
                        ? 'fileicon-large-xlsx'
                        : ['mp4'].includes(item.suffix)
                          ? 'fileicon-large-mp4'
                          : ['txt'].includes(item.suffix)
                            ? 'fileicon-large-txt'
                            : ['pdf'].includes(item.suffix)
                              ? 'fileicon-large-pdf'
                              : ['doc', 'docx'].includes(item.suffix)
                                ? 'fileicon-large-doc'
                                : IMAGE_SUFFIX.includes(item.suffix) && !item.error ? 'fileicon-empty' : 'fileicon-large-unknow',
          ]">
            <div class="file-sts">
              <template v-if="(item.isPublic == 1 || item.isShare == 1)">
                <a-tag v-if="item.isPublic == 1" color="green">公开</a-tag>
                <a-tag v-if="item.isShare == 1" color="orange">共享</a-tag>
              </template>
              <template v-if="(item.isPublic == 1 || item.isShare == 1) && item.auditStatus != 2">
                <a-tag color="red" v-if="item.auditStatus == 1">待审</a-tag>
                <a-tag color="red" v-if="item.auditStatus == 3">拒绝</a-tag>
              </template>
            </div>
            <a-image v-if="IMAGE_SUFFIX.includes(item.suffix) && !item.error" @error="item.error = 1"
              :src="config.axios.admin + `/api/common/store/preview/${item.id}`" @click.stop />
          </div>
          <div class="layui-annex-file-name">
            <span v-if="isRename && item.id == currentFileData.id">
              <a-input @blur="onBlur" v-model="currentFileData.name" />
            </span>
            <span v-else>{{ item.title }}</span>
          </div>
          <span class="select-icon" @click="(e) => onChecked(e, item, index)">
            <span class="layui-icon">
              <span class="layui-icon-radio"></span>
            </span>
          </span>
        </div>
      </div>
      <div v-if="showType == 1" style="background: white;margin-top: 5px;" class="common-table scrollBar"
        ref="fileTable">
        <a-table :columns="columns" :rowKey="(record, index) => record.id" :rowSelection="rowSelection"
          :dataSource="sort_data" bordered size="small">

          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex == 'name'">
              <div class="tablename" @click="onSend(record)" :title="record.name">
                <!-- :title="record.status==1?record.name:record.status==2?'未审核':'审核不通过'" -->
                <div class="tableimg">
                  <a-image v-if="IMAGE_SUFFIX.includes(record.suffix) && !record.error" @error="record.error = 1"
                    :src="config.axios.admin + `/api/common/store/preview/${record.id}`" @click.stop />
                  <span v-else class="fileicon-large-review" :class="[
                    record.fileType === 'dir'
                      ? 'dir-large'
                      : ['xls'].includes(record.suffix)
                        ? 'fileicon-large-xls'
                        : ['xlsx'].includes(record.suffix)
                          ? 'fileicon-large-xlsx'
                          : record.suffix == 'mp4'
                            ? 'fileicon-large-mp4'
                            : ['pdf'].includes(record.suffix)
                              ? 'fileicon-large-pdf'
                              : ['doc', 'docx'].includes(record.suffix)
                                ? 'fileicon-large-doc'
                                : 'fileicon-large-unknow',
                  ]"></span>
                </div>
                <span>{{ record.title }}</span>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <div class="menus_list" id="file_menus_list">
      <div class="menu-item" @click="openFile" v-if="!IMAGE_SUFFIX.includes(currentFileData.suffix)">打开</div>
      <div class="menu-item" @click="onDownload"
        v-if="currentFileData.fileType != 'dir' && (docQueryType != 3 || currentFileData.permisKeys.includes('download'))">
        下载
      </div>
      <!-- <div class="menu-item" @click="onRename">重命名</div> -->
      <div class="menu-item" @click="onDeleteBtn" v-if="!PublicType">删除</div>
      <div class="menu-item" @click="onPublic" v-if="!PublicType">
        {{
          currentFileData.isPublic != 1
            ? '公开'
            : currentFileData.auditStatus == 1
              ? '取消公开 (待审核)'
              : currentFileData.auditStatus == 3
                ? '取消公开 (审核不通过)'
                : '取消公开'
        }}
      </div>
      <div class="menu-item" @click="onAttribute">属性</div>
    </div>
    <template v-for="(item, index) in attriFileList" :key="item.id">
      <attr-box :isActive="activeWindow == item.id" :fileData="item" :elIndex="index" @close="onClose"
        @active="onActive" @apiSuccess="apiSuccess" />
    </template>
  </a-spin>
</template>

<script>
import AttrBox from './attrBox.vue'
import { apiFileUpdate, apiDirSave } from '../../docApi'
import { IMAGE_SUFFIX } from '../../config'
import { useSession } from 'unione-base-vue';
import { useConfigStore } from '@/config';

export default {
  name: 'docFileBox',
  components: { AttrBox },
  props: {
    PublicType: {
      type: Boolean,
      default: () => false,
    },
    // 数据
    listdata: {
      type: Array,
      default: () => [],
    },
    // 查看模式  视图/列表
    showType: {
      type: Number,
      default: 0,
    },
    // 加载特效
    spinning: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      IMAGE_SUFFIX,
      sort_data: [],
      MenuLeft: 0,
      MenuTop: 0,
      emitItem: {},
      columns: [
        {
          title: '文件名称',
          dataIndex: 'name',
        },
        {
          title: '文件大小',
          dataIndex: 'size',
          align: 'center',
          width: 100,
          customRender: ({ text }) => {
            return (text / 1024 / 1024).toFixed(2) + 'MB'
          },
        },
        {
          title: '后缀',
          dataIndex: 'suffix',
          align: 'center',
          width: 100,
        },
        {
          title: '是否已公开',
          dataIndex: 'isPublic',
          width: 100,
          customRender: ({ text }) => {
            return text == 1 ? '是' : '否'
          },
          align: 'center',
        },
        {
          title: '上传时间',
          dataIndex: 'created',
          align: 'center',
          width: 180,
        }
      ],
      in_array: [], // 选中的数据
      /** 当前选择附件信息 */
      currentFileData: {
        permisKeys: [],
      },
      /** 打开属性的文件 */
      attriFileList: [],
      /** 当前属性激活窗口 */
      activeWindow: null,
      /** 开启重命名 */
      isRename: false,
      env: false, // 环境
    }
  },
  setup() {
    const session = useSession()
    const config = useConfigStore().config
    return {
      session,
      config,
    }
  },
  created() { },
  mounted() {
    this.env = process.env.NODE_ENV === 'production' ? true : false
    this.$nextTick(() => {
      document.documentElement.onclick = () => {
        if (document.getElementById('file_menus_list')) {
          if (document.getElementById('file_menus_list').style.display == 'block') {
            document.getElementById('file_menus_list').style.display = 'none'
            if (!this.isRename) {
              this.currentFileData = {
                permisKeys: [],
              }
            }
          }
        }
      }

      this.$refs.fileBox.addEventListener('scroll', (e) => {
        if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight) {
          this.$emit('scroll', e)
        }
      })

    })
  },
  watch: {
    listdata: {
      deep: true,
      immediate: true,
      handler(value) {
        this.in_array = []
        this.sort_data = value
      },
    },
  },
  // 监听属性
  computed: {
    docQueryType() {
      return this.session.getStorage('doc:queryType')
    },
    rowSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.sort_data.map((v) => {
            Object.assign(v, {
              ischecked: false,
            })
          })
          selectedRows.map((v) => {
            Object.assign(v, {
              ischecked: true,
            })
          })
          this.$emit('returnCheckedArray', selectedRows)
        },
        getCheckboxProps: (record) => {
          return {
            props: {
              name: record.name,
              defaultChecked: record.ischecked,
            },
          }
        },
      }
    },
  },
  // 方法集合
  methods: {
    /**
     * @description: onSend 对文件或文件夹进行操作
     * @param {Object} record 本条数据的信息
     */
    onSend(record) {
      if (IMAGE_SUFFIX.includes(record.suffix)) {
        return
      }
      this.$emit('onSend', record)
      return false
    },

    /**
     * @description: onChecked 选中某条
     * @param {Object} e event
     * @param {Object} item 属性
     * @param {number} index 下标
     */
    onChecked(e, item, index) {
      window.event ? (window.event.cancelBubble = true) : e.stopPropagation()
      let List = this.sort_data
      List.find((v) => v.id === item.id).ischecked = !List.find((v) => v.id === item.id).ischecked
      this.sort_data = JSON.parse(JSON.stringify(List))
      let indexs = this.in_array.findIndex((e) => e.id === item.id)
      if (indexs >= 0) {
        this.in_array.splice(indexs, 1)
      } else {
        this.in_array.push(item)
      }
      this.$emit('returnCheckedArray', this.in_array)
      return false
    },

    /** 打开事件 */
    openFile() {
      if (IMAGE_SUFFIX.includes(this.currentFileData.suffix)) {
        return
      }
      this.$emit('onMenuCMD', 'open', this.currentFileData)
    },

    /** 下载 */
    onDownload() {
      this.$emit('onMenuCMD', 'download', this.currentFileData)
    },

    /** 重命名 */
    onRename() {
      this.isRename = true
      // this.$emit('onMenuCMD', 'rename', this.currentFileData)
    },
    /** 失去焦点 */
    async onBlur() {
      this.isRename = false
      let data = {}
      if (this.currentFileData.fileType == 'DIR') {
        data = await apiDirSave(this.currentFileData)
      } else {
        this.currentFileData.title = this.currentFileData.name
        this.currentFileData.name = this.currentFileData.fileName
        data = await apiFileUpdate(this.currentFileData)
      }
      this.currentFileData = {
        permisKeys: [],
      }
      if (data.success) {
        //
      } else {
        this.$message.error(data.message)
      }
    },

    /** 公开操作 */
    onPublic() {
      this.$emit('onMenuCMD', 'onPublic', this.currentFileData)
    },

    /** 属性 */
    onAttribute() {
      let index = this.attriFileList.findIndex((e) => e.id == this.currentFileData.id)
      if (index > -1) {
        this.activeWindow = this.currentFileData.id
        return
      }
      this.activeWindow = this.currentFileData.id
      this.attriFileList.push(this.currentFileData)
      // this.$emit('onMenuCMD', 'attribute', this.currentFileData)
    },

    /** 删除 */
    onDeleteBtn() {
      this.$emit('onDeleteBtn', this.currentFileData)
    },

    /** 激活回调 */
    onActive(fileData) {
      this.activeWindow = fileData.id
    },

    /** 修改接口成功返回 */
    apiSuccess(record) {
      this.listdata.forEach((v) => {
        if (v.id == record.id) {
          v.isPublic = record.isPublic
          v.title = record.title
        }
      })
    },

    /** 右击事件 */
    onMenu(event, record) {
      this.currentFileData = record
      this.$nextTick(() => {
        document.getElementById('file_menus_list').style.display = 'block'
        let file_menus_list = document.getElementById('file_menus_list')
        let fileListBox = document.getElementById('Box')
        let top = event.y + 15 - fileListBox.getBoundingClientRect().top
        let left = event.x + 15 - fileListBox.getBoundingClientRect().left
        let styleTop =
          top + file_menus_list.clientHeight >= fileListBox.clientHeight ? top - file_menus_list.clientHeight - 15 : top
        let styleLeft =
          left + file_menus_list.clientWidth >= fileListBox.clientWidth ? left - file_menus_list.clientWidth - 15 : left

        file_menus_list.style.left = styleLeft + 'px'
        file_menus_list.style.top = styleTop + 'px'
      })
    },

    /** 属性窗口关闭 */
    onClose(file) {
      let index = this.attriFileList.findIndex((e) => e.id == file.id)
      if (index > -1) {
        this.attriFileList.splice(index, 1)
      }
    },

  },
}
</script>
<style lang="less">
.Box {
  position: relative;

  .ant-table-fixed-header {
    .ant-table-scroll {
      .ant-table-header {
        overflow: hidden;
        padding: 0 !important;
        margin: 0 !important;
      }
    }
  }

  .table {
    .ant-table-fixed-header {
      .ant-table-scroll {
        .ant-table-body {
          &::-webkit-scrollbar {
            /*滚动条整体样式*/
            width: 10px;
            /*高宽分别对应横竖滚动条的尺寸*/
            height: 1px;
          }

          &::-webkit-scrollbar-thumb {
            /*滚动条里面小方块*/
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
            background: #ededed;
          }

          &::-webkit-scrollbar-track {
            /*滚动条里面轨道*/
            // -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            background: white;
          }
        }
      }
    }
  }
}
</style>
<style lang='less' scoped>
.Box {
  .FileBox {
    width: 100%;
    height: calc(100vh - 300px);
    overflow-y: scroll;
    background: white;

    &.FileBoxPro {
      height: calc(100vh - 220px);
    }

    .fileItem {
      position: relative;
      float: left;
      display: block;
      margin: 4px 0 0 6px;
      width: 90pt;
      height: 127px;
      border: 1px solid #fff;
      text-align: center;
      border-radius: 5px;

      &:hover {
        background-color: #f1f5fa;
        border: 1px solid #90c3fd;

        .select-icon {
          .layui-icon {
            border-color: #3b8cff;
            opacity: 1;

            .layui-icon-radio {
              opacity: 1;
              background: transparent;
            }
          }
        }
      }

      &.activity {
        background-color: #f1f5fa;
        border: 1px solid #90c3fd;
        border-radius: 5px;

        .select-icon {
          .layui-icon {
            border-color: #3b8cff;
            opacity: 1;

            .layui-icon-radio {
              opacity: 1;
              background: #3b8cff;
            }
          }
        }
      }

      .layui-annex-file-icon {
        position: relative;
        overflow: hidden;
        margin: 9px auto 0;
        width: 84px;
        height: 84px;
        background-repeat: no-repeat;
        cursor: pointer;

        .file-sts {
          position: absolute;
          z-index: 1;
          top: 0px;
          right: -8px;
          display: flex;
          flex-direction: row;
          justify-content: end;
          padding-right: 10px;

          :deep(.ant-tag) {
            transform: scale(0.8);
            padding: 0 3px;
            margin: -2px;
            user-select: none;
          }
        }

        &.fileicon-empty {
          background-image: none;
        }
      }

      // 未审核
      .fileicon-large-review {
        background: url(@/assets/doc/fileicon-large-review.png) center no-repeat;
      }

      // 公开
      .fileicon-large-public {
        background: url(@/assets/doc/fileicon-large-public.png) center no-repeat;
      }

      // png
      .fileicon-large-png {
        background: url(@/assets/doc/png.png) center no-repeat;
      }

      // jpg
      .fileicon-large-jpg {
        background: url(@/assets/doc/jpg.png) center no-repeat;
      }

      // gif
      .fileicon-large-gif {
        background: url(@/assets/doc/gif.png) center no-repeat;
      }

      // mp4视频
      .fileicon-large-mp4 {
        background: url(@/assets/doc/MP4.png) center no-repeat;
      }

      // txt
      .fileicon-large-txt {
        background: url(@/assets/doc/txt.png) center no-repeat;
      }

      // 文件夹
      .dir-large {
        background: url(@/assets/doc/dir-large.png) center no-repeat;
      }

      // xls表格
      .fileicon-large-xls {
        background: url(@/assets/doc/xls.png) center no-repeat;
      }

      // xlsx表格
      .fileicon-large-xlsx {
        background: url(@/assets/doc/xlsx.png) center no-repeat;
      }

      // pdf
      .fileicon-large-pdf {
        background: url(@/assets/doc/pdf.png) center no-repeat;
      }

      // doc
      .fileicon-large-doc {
        background: url(@/assets/doc/doc.png) center no-repeat;
      }

      // unknow
      .fileicon-large-unknow {
        background: url(@/assets/doc/unknow.png) center no-repeat;
      }

      .layui-annex-file-name {
        display: block;
        overflow: hidden;
        margin: 6px 5px 5px;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;

        span {
          color: #424e67;
          text-decoration: none;
          cursor: pointer;
        }
      }

      // 选择按钮
      .select-icon {
        position: absolute;
        top: 2px;
        left: -1px;
        width: 21px;
        height: 21px;
        cursor: pointer;

        .layui-icon {
          position: relative;
          top: 0;
          left: 0;
          display: block;
          width: 16px;
          height: 16px;
          background-color: #fff;
          border: 1px solid #d9d9d9;
          border-radius: 2px;
          transition: all 0.3s;
          margin: 0 auto;
          opacity: 0;

          .layui-icon-radio {
            position: absolute;
            width: 10px;
            height: 10px;
            top: 2px;
            left: 2px;
            border-radius: 2px;
            background: #3b8cff;
            opacity: 0;
          }
        }
      }
    }
  }

  .tablename {
    overflow: hidden;
    line-height: 30px;
    cursor: pointer;

    .tableimg {
      width: 26px;
      height: 26px;
      float: left;
      margin-right: 5px;

      span {
        width: 100%;
        height: 100%;
        display: block;
      }

      // 未审核
      .fileicon-large-review {
        background: url(@/assets/doc/fileicon-large-review.png) center no-repeat;
        background-size: 26px 26px;
      }

      // 公开
      .fileicon-large-public {
        background: url(@/assets/doc/fileicon-large-public.png) center no-repeat;
        background-size: 26px 26px;
      }

      // png
      .fileicon-large-png {
        background: url(@/assets/doc/png.png) center no-repeat;
        background-size: 26px 26px;
      }

      // jpg
      .fileicon-large-jpg {
        background: url(@/assets/doc/jpg.png) center no-repeat;
        background-size: 26px 26px;
      }

      // gif
      .fileicon-large-gif {
        background: url(@/assets/doc/gif.png) center no-repeat;
        background-size: 26px 26px;
      }

      // mp4视频
      .fileicon-large-mp4 {
        background: url(@/assets/doc/MP4.png) center no-repeat;
        background-size: 26px 26px;
      }

      // txt
      .fileicon-large-txt {
        background: url(@/assets/doc/txt.png) center no-repeat;
        background-size: 26px 26px;
      }

      // 文件夹
      .dir-large {
        background: url(@/assets/doc/dir-large.png) center no-repeat;
        background-size: 26px 26px;
      }

      // xls表格
      .fileicon-large-xls {
        background: url(@/assets/doc/xls.png) center no-repeat;
        background-size: 26px 26px;
      }

      // xlsx表格
      .fileicon-large-xlsx {
        background: url(@/assets/doc/xlsx.png) center no-repeat;
        background-size: 26px 26px;
      }

      // pdf
      .fileicon-large-pdf {
        background: url(@/assets/doc/pdf.png) center no-repeat;
        background-size: 26px 26px;
      }

      // doc
      .fileicon-large-doc {
        background: url(@/assets/doc/doc.png) center no-repeat;
        background-size: 26px 26px;
      }

      // unknow
      .fileicon-large-unknow {
        background: url(@/assets/doc/unknow.png) center no-repeat;
        background-size: 26px 26px;
      }
    }
  }

  #menu {
    position: absolute;
    left: 0;
    top: 0;
    background: white;
    overflow: hidden;
    /*隐藏溢出的元素*/
    box-shadow: 0 1px 1px #888, 1px 0 1px #ccc;
    z-index: 999;
    position: absolute;

    /*自定义菜单相对与body元素进行定位*/
    .menu {
      width: 130px;
      height: 25px;
      line-height: 25px;
      padding: 0 10px;
      cursor: pointer;
    }

    &:hover {
      font-weight: 800;
    }
  }
}

#moveSelected {
  position: absolute;
  top: 0;
  left: 0;
  width: 88px;
  height: 57px;
  background: transparent;
  border: 1px #e8e8e8 dashed;
}

.menus_list {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  // width: 100px;
  min-width: 100px;
  background: white;
  box-shadow: 0 0 10px #909090;
  display: none;
  z-index: 9999;

  .menu-item {
    cursor: pointer;
    padding: 5px 15px;
    border-bottom: 1px #e8e8e8 solid;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #e6f7ff;
    }
  }
}
</style>
