import { axios, useDialog } from 'unione-base-vue'

export default {
  find(data: any) {
    return axios.admin.toFind({
      url: '/api/system/user/find',
      method: 'post',
      data
    })
  },
  // 新增、修改
  save(data: any) {
    const url = data.id ? '/api/system/user/update' : '/api/system/user/save'
    if (data.id) {
      return axios.admin.toUpdate(
        {
          method: 'post',
          url,
          data
        },
        { useMessage: true }
      )
    }
    return axios.admin.toSave(
      {
        method: 'post',
        url,
        data
      },
      { useMessage: true }
    )
  },
  // 删除
  delete(ids: Array<any>) {
    return axios.admin.request({
      url: '/api/system/user/delete',
      method: 'post',
      data: ids
    })
  },
  // 详情
  detail(id: any) {
    return axios.admin.request({
      url: '/api/system/user/detail',
      method: 'post',
      data: id
    })
  },
  /**
   * 启用/停用
   * @param id
   * @param status
   * @returns
   */
  setStatus(id: string, status: number) {
    const dialog = useDialog()
    return new Promise((resolve, reject) => {
      dialog.confirm({
        content: '确定要' + (status == 1 ? '启用' : '停用') + '该字典么?',
        onOk: () => {
          axios.admin
            .request({
              url: '/api/system/user/status',
              method: 'post',
              data: { id, status }
            })
            .then((res: any) => {
              resolve(res)
            })
            .catch((err: any) => {
              reject(err)
            })
        }
      })
    })
  }
}
