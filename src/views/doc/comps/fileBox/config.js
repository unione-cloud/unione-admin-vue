export const USER_COLUMNS = [
  {
    title: '用户名称',
    dataIndex: 'ownerTitle',
    align: 'center',
    ellipsis: true
  },
  {
    title: '权限',
    dataIndex: 'auth',
    scopedSlots: { customRender: 'auth' },
    align: 'center',
    width: 160
  }
]

export const ROLE_COLUMNS = [
  {
    title: '角色名称',
    dataIndex: 'ownerTitle',
    align: 'center',
    ellipsis: true
  },
  {
    title: '权限',
    dataIndex: 'auth',
    scopedSlots: { customRender: 'auth' },
    align: 'center',
    width: 160
  }
]

export const ORG_COLUMNS = [
  {
    title: '机构名称',
    dataIndex: 'ownerTitle',
    align: 'center',
    ellipsis: true
  },
  {
    title: '权限',
    dataIndex: 'auth',
    scopedSlots: { customRender: 'auth' },
    align: 'center',
    width: 160
  }
]
