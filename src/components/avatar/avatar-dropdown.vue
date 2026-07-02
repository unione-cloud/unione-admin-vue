<template>
  <a-dropdown v-if="principal && principal.id" class="unione-avatar-dropdown" placement="bottomRight"
    overlayClassName="avatar-dropdown-container">
    <span>
      <a-avatar size="small" :src="avatarUrl" class="unione-avatar">
      </a-avatar>
      <span class="unione-avatar-name anticon">{{
        principal.aliasName || principal.realName
      }}</span>
    </span>
    <template v-slot:overlay>
      <a-menu class="unione-dropdown-menu" :selected-keys="[]">
        <!-- <a-menu-item v-if="menu" key="center" @click="handleToCenter">
          <template #icon><user-outlined /></template>
个人中心
</a-menu-item> -->
        <a-menu-item v-if="menu" key="settings" @click="handleToSettings">
          <template #icon><setting-outlined /></template>
          个人设置
        </a-menu-item>
        <a-menu-divider v-if="menu" />
        <a-menu-item key="logout" @click="handleLogout">
          <template #icon><logout-outlined /></template>
          退出登录
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <span v-else>
    <a-spin size="small" :style="{ marginLeft: 8, marginRight: 8 }" />
  </span>
</template>

<script lang="ts" setup>
import { useConfigStore } from '@/config'
import { LogoutOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const config = useConfigStore().config

const props = defineProps({
  principal: {
    type: Object,
    default: () => null
  },
  menu: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const admin = useAdminStore()
const handleToSettings = () => {
  router.push({ path: '/ucenter' })
}
const handleLogout = () => {
  admin.logout()
}

const avatarUrl = computed(() => {
  return props.principal?.avatar && (config.axios.admin + '/api/common/store/preview/public/' + props.principal.avatar) ||
    '/avatar.png'
})

</script>

<style scoped lang="less">
.unione-avatar-dropdown {
  cursor: pointer;
}
</style>
