import { axios } from 'unione-base-vue'
import { useDialog } from 'unione-base-vue'

export default {
  find(data: any) {
    return axios.admin({
      url: '/api/system/dict/find',
      method: 'post',
      data
    })
  },
  // 新增、修改
  save(data: any) {
    const dialog = useDialog()
    return new Promise((resolve, reject) => {
      const url = data.id ? '/api/system/dict/update' : '/api/system/dict/save'
      axios
        .admin({
          method: 'post',
          url,
          data
        })
        .then((result: any) => {
          if (result.success) {
            resolve(result)
          } else {
            dialog.error({
              content: result.message
            })
            reject(result)
          }
        })
    })
  },
  // 删除
  delete(ids: Array<any>) {
    return axios.admin({
      url: '/api/system/dict/delete',
      method: 'post',
      data: ids
    })
  },
  // 详情
  detail(id: any) {
    return axios.admin({
      url: '/api/system/dict/detail',
      method: 'post',
      data: id
    })
  }
}
