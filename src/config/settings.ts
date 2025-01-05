/**
 * 默认配置项
 */
export default {
  isDebug: false,
  // view setting
  view: {
    logo: {
      title: {
        text: 'Unione Cloud Admin',
        css: 'font-size:20px;padding-left:3px;'
      }
    },
    login: {
      appTitle: 'Unione Cloud Admin',
      subTitle: '欢迎使用Cloud Admin'
    },
    primaryColor: '#1890FF', // primary color of ant design
    navTheme: 'light', // theme for nav menu
    hideFooter: false, //  auto hide footer
    layout: 'topside', // sidemenu | topmenu | topside
    contentWidth: 'fixed', // layout of content: Fluid or Fixed, only works when layout is topmenu
    fixedHeader: false, // sticky header
    fixSiderbar: false, // sticky siderbar
    autoHideHeader: false, //  auto hide header
    showsetting: true,
    colorWeak: false,
    multiTab: false
  },
  // security 配置
  security: {
    // 项目中自行修改并且和后端配置的公钥保持一致
    sm2PubKey:
      '04a684d7140aebfc83515a2312dac7ab836f3adc484627971b6936ad7d5575048caecf9c7eb07ed4dcee9d04cb3a7b1c514477b646b1ebe8245de215733baa5133',
    sm2PriKey: '4389c4329a001df855d14ec204d25bf12d4d631bf61bb02d0586a653e199e0da'
  },
  // axios setting
  axios: {
    admin: '/portal'
  },
  // web setting
  web: {
    loginUrl: import.meta.env.VUE_APP_LOGIN_URL || '/login'
  }
}
