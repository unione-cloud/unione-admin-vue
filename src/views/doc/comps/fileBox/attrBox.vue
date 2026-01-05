<!-- 附件属性 -->
<template>
  <div>
    <div class="attr_box" :id="`attr_box_${fileData.id}`" :style="{
      borderColor: isActive ? '#1889f1' : '#e8e8e8',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: isActive ? '1000' : '999',
    }" @mousedown="$emit('active', fileData)">
      <div class="head" @mousedown="mousedown">
        <div class="title" :style="{ color: isActive && '#000' }" :title="formData.name">{{ formData.title }} 属性</div>
        <div class="close" @click="onClose">
          <a-icon type="close" />
        </div>
      </div>
      <div class="content">
        <div class="tabs" v-if="
          docConfig.filePermisEnable && docQueryType == 1
        ">
          <div class="tab" v-for="item in tabs" :key="item.key" @click="onTabs(item)"
            :class="[currentTab.key == item.key && 'active']">
            {{ item.label }}
          </div>
        </div>
        <div class="info scrollBar">
          <div class="base" v-show="currentTab.key == 'base'">
            <div class="control">
              <div class="label">标题：</div>
              <div class="value">
                <a-input v-model:value="formData.updateName" v-if="docQueryType == 1" />
                <span v-else>
                  {{ formData.updateName }}
                </span>
              </div>
            </div>
            <a-divider />
            <div class="control">
              <div class="label">文件类型：</div>
              <div class="value">{{ formData.fileType == 'dir' ? '文件夹' : formData.fileType }}</div>
            </div>
            <div class="control">
              <div class="label">大小：</div>
              <div class="value">{{ formData.size ? toSize(formData.size) : '-' }}</div>
            </div>
            <a-divider />
            <div class="control">
              <div class="label">创建时间：</div>
              <div class="value">{{ formData.created }}</div>
            </div>
            <div class="control">
              <div class="label">修改时间：</div>
              <div class="value">{{ formData.lastUpdated }}</div>
            </div>

            <a-divider />
            <div class="control" v-if="docQueryType == 1">
              <div class="label">属性：</div>
              <div class="value">
                <a-checkbox :checked="isPublic" :indeterminate="indeterminate" @change="publicChange">公开
                  {{ auditResultMap[auditResult] }}</a-checkbox>
              </div>
            </div>
          </div>

          <div class="auth" v-show="currentTab.key == 'auth'">
            <auth-box v-model:value="formData" :isPublic="isPublic || indeterminate" />
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="btn" v-if="docQueryType == 1" :class="[isActive && 'active']" @click="toConfirm">
          确定
        </div>
        <div class="btn" @click="onClose">取消</div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSession } from 'unione-base-vue';
import {
  apiFileUpdate,
  apiDirSave,
  apiFileDetail,
  apiDirDetail,
  apiPermisUpdate,
  apiPermisLoadWith,
} from '../../api'
import AuthBox from './auth.vue'
import { message } from 'ant-design-vue';

export default {
  components: { AuthBox },
  props: {
    fileData: {
      type: Object,
    },
    /** 元素下标 */
    elIndex: {
      type: Number,
    },
    /** 是否激活 */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      formData: {},
      tabs: [
        { label: '常规', key: 'base' },
        { label: '权限', key: 'auth' },
      ],
      currentTab: {
        label: '常规',
        key: 'base',
      },
      x: 0,
      y: 0,
      isPublic: false,
      auditResultMap: {
        1: '(待审核)',
        2: '',
        3: '(审核不通过)',
        4: '(变更待审)',
      },
      indeterminate: false,
      /** 当前文件公开审核状态 */
      auditResult: null,
      /** 原始权限列表 */
      oldPermisList: [],
    }
  },
  watch: {
    fileData: {
      deep: true,
      immediate: true,
      handler(val, old) {
        this.formData = { ...val }
        if (this.formData) {
          // 此处处理死循环
          if ((!old || val.id != old.id)) {
            this.doPermis(val.id)
          }
          if (val.fileType != 'dir') {
            let updateName = this.formData.title
            let uName = ''
            updateName.split('.').map((v, i) => {
              if (i < updateName.split('.').length - 1) {
                uName += i > 0 ? `.${v}` : v
              }
            })
            this.formData.updateName = uName
          } else {
            this.formData.updateName = val.title
          }
        }
      },
    },
  },
  setup() {
    const session = useSession()

    return {
      session
    }
  },
  //创建完成 访问当前this实例
  created() {
    this.x = document.documentElement.clientWidth / 2 - 420 / 2 + this.elIndex * 5
    this.y = document.documentElement.clientHeight / 2 - 680 / 2 + this.elIndex * 5
  },
  //挂载完成 访问DOM元素
  computed: {
    docQueryType() {
      return this.session.getStorage('doc:queryType')
    },
    docConfig() {
      const config = this.session.getStorage('doc:config')
      if (!config) {
        return {
          filePermisEnable: true
        }
      }
      return JSON.parse(config)
    },
  },
  //方法集合
  methods: {
    async doPermis(sid) {
      let data = await apiPermisLoadWith(sid)
      this.oldPermisList = []
      if (data.success) {
        if (data.body && data.body.length > 0) {
          let isPublic = data.body.find((e) => e.ownerType == 'public')
          if (isPublic) {
            this.auditResult = isPublic.auditResult
            if (isPublic.auditResult == '2') {
              this.auditResult = null
              this.isPublic = true
            } else if (isPublic.auditResult == '3') {
              this.isPublic = false
              this.indeterminate = false
            } else {
              this.isPublic = false
              this.indeterminate = true
            }
          } else {
            this.isPublic = false
          }
        }
        this.formData.permis = data.body
        this.oldPermisList = JSON.parse(JSON.stringify(data.body))
      } else {
        message.error(data.message)
      }
    },
    onTabs(tab) {
      this.currentTab = tab
    },
    onClose() {
      this.$emit('close', this.fileData)
    },

    /** 处理大小 */
    toSize(size) {
      size = parseInt(size)
      if (size / 1024 / 1024 > 1) {
        return `${parseInt(size / 1024 / 1024)} MB (${size} 字节)`
      } else if (size / 1024 > 1) {
        return `${parseInt(size / 1024)} KB (${size} 字节)`
      } else {
        return `${size} 字节`
      }
    },

    /** 公开事件 */
    publicChange(e) {
      this.auditResult = null
      if (this.indeterminate) {
        this.isPublic = false
        this.indeterminate = false
      }
      this.isPublic = e.target.checked
      this.formData.isPublic = e.target.checked
    },

    /** 确认 */
    async toConfirm() {
      let isOk = await this.doSave().then((res) => res)
      if (isOk) {
        this.onClose()
      }
    },

    /** 接口保存 */
    async doSave() {
      let data = {}

      let permis = this.formData.permis || []
      if (this.isPublic) {
        const pubPermis = this.formData.permis?.filter((e) => e.ownerType == 'public')
        if (pubPermis.length == 0) {
          permis.push({
            ownerType: 'public',
            ownerTitle: '文件公开',
            list: 'download',
            auditResult: 1,
            fileId: this.fileData.id,
            fileTitle:
              this.formData.updateName +
              `.${this.formData.title.split('.')[this.formData.title.split('.').length - 1]}`,
            fileName: this.formData.fileName,
          })
        }
      }

      const param = {
        id: this.formData.id,
        title:
          this.formData.updateName + `${this.formData.fileType == 'dir' ? '' : ('.' + this.formData.fileType)}`,
        isPublic: this.isPublic ? '1' : '0',
        permis,
      }
      data = await apiPermisUpdate(param)

      // return false
      if (data.success) {
        this.$emit('apiSuccess', param)
        return true
      } else {
        this.$message.error(data.message)
        return false
      }
    },

    /** 鼠标按下事件 */
    mousedown(event) {
      let flag = true
      let videoModal = document.getElementById(`attr_box_${this.fileData.id}`)

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

    /**
     * @description: cmp 判断两个对象是否相等
     * @param {Object} x 第一个对象
     * @param {Object} y 第二个对象
     * @return: true/false
     */
    cmp(x, y) {
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
  },
}
</script>
<style lang='less' scoped>
.attr_box {
  width: 500px;
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
    padding-right: 32px;

    .title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

    .tabs {
      .tab {
        display: inline-block;
        padding: 2px 8px;
        background: #f0f0f0;
        cursor: pointer;

        border-left: 1px #d9d9d9 solid;
        border-top: 1px #d9d9d9 solid;
        border-bottom: 1px #d9d9d9 solid;

        &:last-child {
          border-right: 1px #d9d9d9 solid;
        }

        &.active {
          background: white;
          border-bottom: 1px white solid;
        }
      }
    }

    .info {
      width: 100%;
      height: calc(100% - 27px);
      background: white;
      border: 1px #d9d9d9 solid;
      overflow-y: scroll;

      .base {
        padding-top: 20px;
      }

      .auth {
        // padding: 10px;
      }
    }
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

  .control {
    width: 90%;
    margin: 2px auto;

    .label {
      width: 20%;
      display: inline-block;
      line-height: 32px;
    }

    .value {
      width: 80%;
      display: inline-block;
    }
  }
}
</style>