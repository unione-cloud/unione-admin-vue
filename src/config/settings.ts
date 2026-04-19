/**
 * 默认配置项
 */
export default {
  isDebug: false,
  // view setting
  view: {
    logo: {
      title: {
        text: '',
        side: 'UCA',
        css: {
          'background-size': '100% 100%',
          height: '64px',
          width: '200px'
        }
      }
    },
    login: {
      appTitle: 'Unione Cloud Admin',
      subTitle: '欢迎使用Cloud Admin'
    },
    primaryColor: '#1890FF', // primary color of ant design
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
  personal: {
    layout: 'topside', // sidemenu | topmenu | topside
    theme: 'light' // light | dark
  },
  // security 配置
  security: {
    // 项目中自行修改并且和后端配置的公钥保持一致
    sm2PubKey:
      '04a684d7140aebfc83515a2312dac7ab836f3adc484627971b6936ad7d5575048caecf9c7eb07ed4dcee9d04cb3a7b1c514477b646b1ebe8245de215733baa5133',
    pwds: {
      resetPwdSmsEnable: false,
      secretStrategy: {
        reg: '^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{6,16}$',
        tip: '密码至少包含大小写字母、数字且不少于6个字符，最多16个字符'
      }
    }
  },
  // axios setting
  axios: {
    admin: '/portal',
    flow: '/flow'
  },
  // web setting
  web: {
    ctx: import.meta.env.VITE_APP_CTX || '',
    loginUrl: import.meta.env.VITE_LOGIN_URL || '/login'
  },
  flow: {
    systemFieldList: [
      { label: '当前时间', value: 'now', dataType: 'Timestamp' },
      { label: '用户ID', value: 'userId', dataType: 'Long' },
      { label: '用户名', value: 'userName', dataType: 'String' },
      { label: '机构ID', value: 'orgId', dataType: 'Long' },
      { label: '机构名称', value: 'orgName', dataType: 'String' },
      { label: '租户ID', value: 'tenantId', dataType: 'Long' },
      { label: '流程定义ID', value: 'flowDefId', dataType: 'Long' },
      { label: '流程实例ID', value: 'flowInsId', dataType: 'Long' },
      { label: '流程节点ID', value: 'flowNodeId', dataType: 'Long' },
      { label: '流程任务ID', value: 'flowTaskId', dataType: 'Long' }
    ]
  },
  listPageUrl: '/data/page/list',
  addPageUrl: '/data/page/add',
  editPageUrl: '/data/page/edit',
  viewPageUrl: '/data/page/view'
}
