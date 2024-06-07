import type { V } from 'vitest/dist/reporters-yx5ZTtEV'
import type { VNodeChild } from 'vue'

export interface MenuBtn {
  sid: string
  title: string
  name?: string
  icon?: string | VNodeChild | JSX.Element
  type?: string
}

export interface MenuMeta {
  hideChildrenInMenu?: boolean
  hideInMenu?: boolean
  icon?: string | VNodeChild | JSX.Element
  target?: '_blank' | '_self' | '_parent' | '_top'
  keepAlive?: boolean
  lock?: boolean
  mergeTab?: boolean
  btns?: Array<MenuBtn>
}

export interface MenuItem {
  sid: string | number
  title: string
  path: string
  url?: string
  name?: string
  children?: MenuItem[]
  meta?: MenuMeta
  component?: any
}

export interface UserPrincipal {
  id: string
  tenantId?: string
  orgId?: string
  orgName?: string
  orgLvsn?: string
  areaCode?: string
  username: string
  tel?: string
  realName?: string
  aliasName?: string
  avatar?: string
  userType?: string
  lastLoginIp?: string
  lastLoginTime?: string
  userRoles?: Array<string>
  attr?: Map<string, Object>
}

export interface LoginData {
  username: string
  tel?: string
  password: string
  captcha?: string
}

export interface ViewSetting {
  primaryColor?: string
  navTheme?: string
  hideFooter?: boolean
  layout?: string
  contentWidth?: string
  fixedHeader?: boolean
  fixSiderbar?: boolean
  autoHideHeader?: boolean
  showsetting?: boolean
  colorWeak?: boolean
  multiTab?: boolean
}
