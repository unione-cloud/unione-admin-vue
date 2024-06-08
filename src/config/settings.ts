/**
 * 默认配置项
 */
export default {
  // view setting
  view: {
    logo: {
      title: {
        text: 'Unione Cloud Admin',
        css: 'font-size:20px;padding-left:3px;'
      }
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
  // axios setting
  axios: {
    admin: ''
  },
  // web setting
  web: {
    loginUrl: import.meta.env.VUE_APP_LOGIN_URL || '/login'
  }
}
