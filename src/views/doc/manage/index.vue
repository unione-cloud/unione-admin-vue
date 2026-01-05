<template>
  <div class="doc-manage">
    <a-tabs v-model:activeKey="activeKey" tab-position="left">
      <a-tab-pane :tab="item.tab" v-for="item in tabList" :key="item.key">
        <unione-query @query="handleQuery" @reset="handleReset"></unione-query>
        <div class="doc-list">
          <div class="manage-box doc-tab-bar">
            <!-- 操作栏 -->
            <TabBar :PublicType="queryType != 1" @onNewFolder="onNewFolder" :ProadMap="roadMap" @onTitleNav="onTitleNav"
              :PMapIndex="MapIndex" @onShowtype="onShowtype" @onTabBarEvent="onTabBarEvent" @onDeleteBtn="onDeleteBtn"
              :PInArray="in_array" @onUpload="onUpload" />
          </div>

          <FileBox class="doc-file-box" :PublicType="queryType != 1" :spinning="spinning" :listdata="listData"
            @onSend="onSend" :showType="showType" @returnCheckedArray="onChecked" @onMenuCMD="onMenuCMD"
            @onDeleteBtn="onDeleteBtn" />


        </div>
      </a-tab-pane>
    </a-tabs>

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
      <div class="doc-upload-box" style="margin-bottom: 10px">
        <div>
          是否公开：
          <a-switch checked-children="是" un-checked-children="否" v-model:checked="isUpdatePublic" />
        </div>

        <a-button class="pirmaryBtn" style="margin-top: 10px" @click="selectFileBtn">
          <a-icon type="upload" />选择文件
        </a-button>
        <a-button style="margin: 10px 0 0 10px" type="primary" :loading="uploading"
          v-show="isUpdatePublic || !docConfig.filePermisEnable" :disabled="fileList.length === 0"
          @click="handleUpload">开始上传</a-button>
        <div id="doc-myfile">
          <a-upload :accept="accept" v-model:file-list="fileList" :multiple="true" :before-upload="beforeUpload"
            :remove="handleRemove"></a-upload>
        </div>
      </div>

      <div class="upload-auth">
        <auth-box v-model:value="authData" v-if="docConfig.filePermisEnable" v-show="!isUpdatePublic" />
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
<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

//@ts-ignore
//@ts-ignore
import TabBar from '../comps/tabBar/index.vue';
//@ts-ignore
import FileBox from '../comps/fileBox/index.vue'; // 视图
//@ts-ignore
import LinePreview from '../comps/linePreview/index.vue'; // 在线预览
//@ts-ignore
import AuthBox from '../comps/fileBox/auth.vue';

import {
  apiConfig,
  apiDirSave,
  apiFileDelete,
  apiFileDownload,
  apiPermisSave,
  apiPermisUpdate,
  apiStoreDownload,
  getApiFileFind,
  uploadBatch,
} from '../api';

import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useDialog, useSession } from 'unione-base-vue';
import { FILE_SUFFIX, DOCUMENT_SUFFIX, TXT_SUFFIX, IMAGE_SUFFIX, PREVIEW_TYPE, VIDEO_SUFFIX, AUDIO_SUFFIX } from '../config';

defineOptions({
  name: 'FlowSquare'
})

const session = useSession()
const dialog = useDialog()
const route = useRoute()

const keywords = ref('')
const activeKey = ref('all')
const tabList = ref([
  {
    key: 'all',
    tab: '全部'
  },
  {
    key: 'txt',
    tab: '文本',
    suffix: TXT_SUFFIX,
  },
  {
    key: 'img',
    tab: '图片',
    suffix: IMAGE_SUFFIX,
  },
  {
    key: 'doc',
    tab: '文档',
    suffix: DOCUMENT_SUFFIX,
  },
  {
    key: 'video',
    tab: '视频',
    suffix: VIDEO_SUFFIX,
  },
  {
    key: 'audio',
    tab: '音频',
    suffix: AUDIO_SUFFIX,
  },
])

const queryData = ref({
  type: 0,
  name: ''
})

/** 附件类型 null.全部 jpg.图片 等...*/
const fileType = ref<any>(null)
/** 路线图 */
const roadMap = ref([])
/** 新建文件夹视图控制器 */
const newDirVisible = ref(false),
  /** 上传文件视图控制器 */
  uploadVisible = ref(false),
  dirName = ref(null)
/** 文件、文件夹数据存储 */
const listData = ref([]),
  /** 当前路线图下标指针 */
  MapIndex = ref(-1),
  // 查看模式  视图/列表
  showType = ref(0),
  /** 选择的数据 */
  in_array = ref([]),
  /** 当前登陆人信息 */
  principal = ref({}),
  /** 上传附件文件数据 */
  fileList = ref<any>([]),
  uploading = ref(false),
  /** 上传成功后返回数据列表 表头 */
  columns = ref([
    { title: '文件名称', dataIndex: 'title' },
    { title: '文件后缀', dataIndex: 'type' },
    { title: '操作', dataIndex: 'operation', scopedSlots: { customRender: 'operation' } },
  ]),
  /** 上传成功后返回数据列表 数据 */
  tableData = ref([])
/** 是否默认上传公开文件 */
const isUpdatePublic = ref(false),
  /** 当前附件信息 */
  currentFile = ref({
    suffix: '',
  }),
  spinning = ref(false),
  /** 允许上传的文件类型 */
  accept = ref(''),
  authData = ref({
    permis: [],
  }),
  /** doc配置 */
  docConfig = ref({
    filePermisEnable: false,
  }),
  /** 查询类型  1.我的文档 2.我的公开 3.公开文件 */
  queryType = ref<any>(null),
  // 所属ID 场景管理使用
  ownerId = ref<any>(undefined)

watch(() => MapIndex.value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    doQuery()
  }
})
watch(() => route, (val) => {
  fileType.value = null
  in_array.value = []

  if (val && val.meta.fileType) {
    fileType.value = val.meta.fileType
  }
  if (val && val.matched && val.matched[val.matched.length - 1]) {
    queryType.value = val.matched[val.matched.length - 1].meta.queryType || 1
    session.setStorage('doc:queryType', queryType.value + '')
  }
  if (val && val.query.ownerId) {
    ownerId.value = val.query.ownerId
  }
  roadMap.value = []
  MapIndex.value = -1
  doQuery()
}, {
  immediate: true,
  deep: true
})
watch(() => activeKey.value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    doQuery()
  }
  /** 设置上传格式 */
  accept.value = '*'
  const tab = tabList.value.find((v: any) => v.key === activeKey.value)
  if (tab && tab.suffix) {
    if (tab.suffix) {
      //@ts-ignore
      tab.suffix.map((v: any) => {
        accept.value += `.${v},`
      })
    }
  }
})

function handleQuery(e: any) {
  queryData.value.name = e.keywords
  doQuery()
}
function handleReset(e: any) {
  queryData.value.name = ''
  doQuery()
}


onMounted(() => {
  principal.value = session.getPrincipal()

  /** 获取本地缓存中的查看模式 */
  showType.value = session.getStorage('doc:showType') || 0

  getConfig()
})

function getConfig() {
  apiConfig().then((res: any) => {
    if (res.success) {
      docConfig.value = res.body
      session.setStorage('doc:config', JSON.stringify(docConfig.value))
    }
  })
}

async function doQuery() {
  listData.value = []
  spinning.value = true
  listData.value = await getApiFiles().then((res: any) => res)
  spinning.value = false
}
/** 获取文件数据 */
function getApiFiles() {

  let params = {
    body: {
      //@ts-ignore
      dirId: MapIndex.value == -1 ? '-1' : roadMap.value[MapIndex.value].id,
      title: queryData.value.name,
      ownerId: ownerId.value,
      fileType: activeKey.value,
    },
    sorts: [{ name: 'lastUpdated', asc: false }],
    pageSize: 50,
  }
  return getApiFileFind(params, queryType.value || 1)
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
}

/** 保存附件上传是的权限 */
async function handleOk() {
  let list = tableData.value
  let ids: any = []
  let permis = JSON.parse(JSON.stringify(authData.value.permis))

  list.map((v: any) => {
    ids.push(v.id)
  })
  let body = {
    ids,
    permis,
  }
  let data = await apiPermisSave(body)
  if (data.success) {
    fileList.value = []
    tableData.value = []
  } else {
    message.error(data.message)
  }
}

/** 新建文件夹回调 */
function onNewFolder() {
  newDirVisible.value = true
  dirName.value = null
}
/** 确认新建文件夹 事件 */
function onNewDir() {
  let body = {
    title: dirName.value,
    //@ts-ignore
    dirId: MapIndex.value > -1 ? roadMap.value[MapIndex.value].id : '-1',
    isPublic: 0,
    delFlag: 0,
    ownerId: ownerId.value
  }
  apiDirSave(body).then((res: any) => {
    if (res.success) {
      message.success('成功新增文件夹')
      newDirVisible.value = false
      dirName.value = null
      //@ts-ignore
      listData.value.push({
        ...body,
        id: res.body,
        fileType: 'dir',
        created: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      })
    } else {
      message.error(res.message)
    }
  })
}

/** 点击文件、文件夹 */
function onSend(record: any) {
  if (record.fileType == 'dir') {
    /**
     *  判断路线图 roadMap 是否存在数据
     *  如果存在数据则判断用户操作的文件夹和路线图的最后一个数据是否相等
     *  相等：指针指向路线图 roadMap 的最后一个
     *  不相等：对路线图 roadMap 的最后一个改为用户所操作的文件夹，指针改变
     */
    if (roadMap.value.length > 0) {
      if (cmp(record, roadMap.value[roadMap.value.length - 1])) {
        MapIndex.value = roadMap.value.length - 1
      } else {
        //@ts-ignore
        const index = roadMap.value.findIndex((e) => e.id === record.id)
        if (index === -1) {
          //@ts-ignore
          roadMap.value.splice(MapIndex.value + 1, roadMap.value.length - MapIndex.value, record)
          MapIndex.value = roadMap.value.length - 1
        } else {
          MapIndex.value = index
        }
      }
    } else {
      /**
       *  如果路线图 roadMap 不存在数据 则用户未对任何文件夹进行操作，
       *  则将用户所操作的文件夹数据存储在路线图 roadMap 中
       *  指针改变
       */
      //@ts-ignore
      roadMap.value.push(record)
      MapIndex.value++
    }
    return false
  }

  if (PREVIEW_TYPE.includes(record.suffix)) {
    if (!IMAGE_SUFFIX.includes(record.suffix)) {
      currentFile.value = record
    }
  } else {
    //@ts-ignore
    currentFile.value = {}
    message.warning('该格式类型暂无法在线查看，请自行下载后再查看')
    return false
  }
}

/** 隐藏当前显示的图片 */
function Hide() {
  //@ts-ignore
  currentFile.value = {}
}

/**
 * @description: onTitleNav 接收 TabBar 的导航标题事件
 * @param {Object} record title数据本身
 * @param {Number} index 指针下标
 */
function onTitleNav(record: any, index: number) {
  MapIndex.value = index
}

/**
 * @description: onTabBarEvent TabBar事件
 * @param {String} event onBack.后退  onForward.前进  onRefresh.刷新文件视图 download.下载
 * @return:
 */
function onTabBarEvent(event: any) {
  switch (event) {
    case 'onBack':
      MapIndex.value === -1 ? (MapIndex.value = -1) : MapIndex.value--
      break
    case 'onForward':
      MapIndex.value++
      break
    case 'onRefresh':
      doQuery()
      break
    case 'download':
      downloadBtn()
      break
  }
}

/** 附件右键指令 */
function onMenuCMD(event: any, fileData: any) {
  // console.log(event, fileData)
  switch (event) {
    case 'open':
      {
        onSend(fileData)
      }
      break
    case 'download':
      {
        //@ts-ignore
        downloadBtn(fileData)
      }
      break
    case 'onPublic':
      {
        //@ts-ignore
        doPublic(fileData)
      }
      break
  }
}

/**
 * @description: cmp 判断两个对象是否相等
 * @param {Object} x 第一个对象
 * @param {Object} y 第二个对象
 * @return: true/false
 */
function cmp(x: any, y: any) {
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
}

// 切换查看模式
function onShowtype() {
  showType.value = showType.value == 0 ? 1 : 0
  /** 把查看模式保存本地 */
  session.setStorage('showType', showType.value + '')
}

/**
 * @description: onChecked 选中某条
 * @param {Array} value 选中后返回来的数据
 */
function onChecked(value: any) {
  in_array.value = value
}

/** 公开操作 */
function doPublic(fileData: any) {
  if (!fileData) {
    return false
  }
  dialog.confirm({
    title: '提示',
    content: `确定${fileData.isPublic == 1 ? '取消公开' : '公开'}此文件?`,
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
        listData.value.forEach((e: any) => {
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
}

/**
 * @description: downloadBtn 下载事件
 */
async function downloadBtn(fileData?: any) {
  let fileList: any = []
  if (fileData) {
    fileList.push(fileData)
  } else {
    fileList = listData.value.filter((r: any) => r.ischecked)
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
}

/** 删除事件 */
function onDeleteBtn(fileData: any) {
  dialog.confirm({
    title: '提示',
    content: `确定删除这些 ${fileData ? (fileData.fileType == 'dir' ? '文件夹' : '文件') : '文件 / 文件夹'} ? `,
    onOk: async () => {
      /** 文件id */
      let fileSids: any = []
      if (fileData) {
        //@ts-ignore
        fileSids.push(fileData.id)
      } else {
        fileSids = listData.value.filter((r: any) => r.ischecked).map((r: any) => r.id)
      }

      let isOk = true
      let key = 'deleteMessage'
      if (fileSids.length > 0) {
        isOk = false
        await apiFileDelete(fileSids).then((res: any) => {
          if (res.success) {
            isOk = true
            //@ts-ignore
            listData.value = listData.value.filter((e) => !fileSids.includes(e.id))
          } else {
            message.error({ content: res.message, key })
          }
        })
      }
      if (isOk) {
        message.success(`已删除${fileSids.length}个`)
        listData.value = listData.value.filter((e: any) => !fileSids.includes(e.id))
      }
    },
  })
}

/** 上传文件 */
function onUpload() {
  uploadVisible.value = true
  tableData.value = []
  fileList.value = []
  authData.value.permis = []
}

/**
 * @description: selectFileBtn 选择文件
 */
function selectFileBtn() {
  //@ts-ignore
  const btn = document.getElementById('doc-myfile').getElementsByTagName('input')[0]
  btn.click()
}


/**
 * @description: handleRemove 点击移除文件时的回调
 * @return: 上传功能事件
 */
function handleRemove(file: any) {
  //@ts-ignore
  const index = tableData.value.indexOf(file)
  const newFileList = tableData.value.slice()
  newFileList.splice(index, 1)
  tableData.value = newFileList
}

/**
 * @description: beforeUpload 上传文件之前的钩子，参数为上传的文件 上传功能事件
 * @return: 上传功能事件
 */
function beforeUpload(file: any) {
  if (file.size > 52428800) {
    message.warning('文件过大,文件大小不能超过50MB')
    return false
  }
  //@ts-ignore
  tableData.value = [...tableData.value, file]
  return false
}

/**
 * @description: handleUpload 上传提交按钮
 */
function handleUpload() {
  uploading.value = true
  const formData = new FormData()
  tableData.value.map((v, i) => {
    formData.append('file', v)
  })
  nextTick(() => {
    //@ts-ignore
    formData.append('isPublic', isUpdatePublic.value ? 1 : 0)
    //@ts-ignore
    formData.append('dirId', MapIndex.value > -1 ? roadMap.value[MapIndex.value].id : '-1')
    uploadBatch(formData, ownerId.value)
      .then(async (res: any) => {
        uploading.value = false
        if (res.success) {
          res.body.map((v: any) => {
            Object.assign(v, {
              fileType: v.type,
              name: v.title,
              suffix: v.type,
            })
          })
          tableData.value = res.body
          if (authData.value.permis && authData.value.permis.length > 0) {
            await handleOk()
          } else {
            tableData.value = []
          }
          listData.value = listData.value
            .concat(res.body)
            //@ts-ignore
            .sort((a, b) => dayjs(a.created).valueOf() - dayjs(b.created).valueOf())
          nextTick(() => {
            uploadVisible.value = false
            message.success('附件上传成功')
          })
        } else {
          message.error(res.message)
        }
      })
      .catch((err: any) => {
        console.log(err.message)
        uploading.value = false
        message.error('上传失败服务器错误')
      })
  })
}

</script>
<style scoped lang="less">
.doc-manage {
  height: 100%;
  background-color: #FFFFFF;
  padding: 20px 20px 20px 0;
  overflow: hidden;

  .manage-box {
    border: 1px #eee solid;
  }

  .upload-auth {
    :deep(.auth_manage) {
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

  :deep(.ant-tabs-nav) {
    width: 180px;

    .ant-tabs-tab {
      margin: 0;
      padding: 12px 24px;
    }

    .ant-tabs-tab-active {
      background-color: #E5F3FF;
    }
  }

}

.doc-upload-box {
  :deep(.ant-upload-list) {
    max-height: 300px;
    overflow-y: auto;
  }
}
</style>