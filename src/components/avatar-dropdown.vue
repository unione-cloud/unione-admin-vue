<template>
  <a-dropdown
    v-if="principal && principal.id"
    class="unione-avatar-dropdown"
    placement="bottomRight"
    overlayClassName="avatar-dropdown-container"
  >
    <span>
      <a-avatar size="small" :src="principal.avatar || '/avatar.png'" class="unione-avatar" />
      <span class="unione-avatar-name anticon">{{
        principal.aliasName || principal.realName
      }}</span>
    </span>
    <template v-slot:overlay>
      <a-menu class="unione-dropdown-menu" :selected-keys="[]">
        <a-menu-item v-if="menu" key="center" @click="handleToCenter">
          <template #icon><user-outlined /></template>
          个人中心
        </a-menu-item>
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

<script lang="ts">
import { defineComponent } from 'vue'
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from 'unione-base-vue'

export default defineComponent({
  name: 'AvatarDropdown',
  props: {
    principal: {
      type: Object,
      default: () => null
    },
    menu: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const router = useRouter()
    const session = useSessionStore()
    // const store = useStore();
    const { t } = useI18n()
    const handleToCenter = () => {
      router.push({ path: '/account/center' })
    }
    const handleToSettings = () => {
      router.push({ path: '/account/settings' })
    }
    const handleLogout = () => {
      session.doLogout()
    }

    return {
      t,
      handleToCenter,
      handleToSettings,
      handleLogout
    }
  },
  components: {
    UserOutlined,
    SettingOutlined,
    LogoutOutlined
  }
})
</script>

<style scoped lang="less">
.unione-avatar-dropdown {
  cursor: pointer;
}
</style>
