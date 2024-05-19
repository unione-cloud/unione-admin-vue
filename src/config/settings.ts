/**
 * 默认配置项
 */
export default {
  // view setting
  view: {
    primaryColor: '#1890FF', // primary color of ant design
    navTheme: 'light', // theme for nav menu
    hideFooter: false, //  auto hide footer
    layout: 'topmenu', // sidemenu | topmenu | topmixtrue | sidemixtrue
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
    // eslint-disable-next-line no-undef
    loginUrl: process.env.VUE_APP_LOGIN_URL || '/login'
  }
}
