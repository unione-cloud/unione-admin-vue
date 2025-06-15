<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-avatar">
    <img :src="avatarUrl" :class="['avatar-preview']" :style="avatarStyle" />
    <a-upload
      :class="['avatar-upload']"
      v-if="model == 'edit'"
      ref="upload"
      :maxCount="1"
      :beforeUpload="beforeUpload"
      accept=".bmp,.jpg,.jpeg,.png"
      :showUploadList="false"
      :customRequest="() => false"
    >
      <a-button><CloudUploadOutlined />选择图片</a-button>
    </a-upload>
    <a-modal
      :visible="modal.visible"
      :width="500"
      title="设置头像"
      @ok="modal.ok"
      @cancel="modal.cancel"
    >
      <Cropper
        ref="cropper"
        :src="avatarUrl"
        @change="avatarChanged"
        :stencil-size="{
          width,
          height
        }"
        :style="{
          width: width * 3 + 'px',
          height: height * 4 + 'px'
        }"
        image-restriction="stencil"
      ></Cropper>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import config from '@/config/settings'
import { axios, useDialog } from 'unione-base-vue'

const dialog = useDialog()
const emit = defineEmits(['ok', 'cancel'])

const props = defineProps({
  // avatar: {
  //   type: String,
  //   default: ''
  // },
  model: {
    type: String,
    default: 'edit' //edit,view
  },
  width: {
    type: Number,
    default: 150
  },
  height: {
    type: Number,
    default: 150
  },
  showType: {
    type: String,
    default: 'circle' //circle,rect
  }
})

const avatar = defineModel('avatar', {
  type: String,
  default: ''
})

const avatarStyle = computed(() => {
  const css: any = {}
  css.width = props.width + 'px'
  css.height = props.height + 'px'
  if (props.showType == 'circle') {
    css.borderRadius = '50%'
  } else {
    css.borderRadius = '5px'
  }
  return css
})

const avatarFileUrl = ref()
const avatarUrl = computed(() => {
  return (
    avatarFileUrl.value ||
    (avatar.value && config.axios.admin + '/api/common/store/preview/public/' + avatar.value) ||
    '/avatar.png'
  )
})

function avatarChanged(e: any) {
  console.log('avatarChanged', e)
}

function beforeUpload(file: File) {
  var reader = new FileReader()
  reader.onload = function (e: any) {
    avatarFileUrl.value = e.target.result
    modal.value.visible = true
  }
  reader.readAsDataURL(file)
}

const cropper = ref()
const modal = ref({
  visible: false,
  ok: () => {
    const { canvas } = cropper.value.getResult()
    canvas.toBlob((blob: any) => {
      const reader = new FileReader()
      reader.onload = function (e: any) {
        avatarFileUrl.value = e.target.result
      }
      reader.readAsDataURL(blob)
      doUpload(blob)
    })
    modal.value.visible = false
  },
  cancel: () => {
    modal.value.visible = false
    avatarFileUrl.value = ''
    emit('cancel')
  }
})
function doUpload(blob: Blob) {
  const data = new FormData()
  data.append('file', blob)
  axios
    .admin({
      method: 'POST',
      url: '/api/ucenter/profile/avatar',
      data
    })
    .then((res: any) => {
      if (res.success) {
        dialog.success('设置成功')
        avatar.value = res.body
        emit('ok', res.body)
      } else {
        dialog.error(res.message)
      }
    })
}
</script>

<style lang="less" scoped>
.unione-avatar {
  text-align: center;

  .avatar-preview {
    &.edit {
      cursor: pointer;
    }
  }
  .avatar-upload {
    display: block;
    margin-top: 10px;
  }
}
</style>
