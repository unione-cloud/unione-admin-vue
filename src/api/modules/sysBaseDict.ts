import { axios } from 'unione-base-vue'

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
    return axios.admin({
      url: '/api/system/dict/save',
      method: 'post',
      data
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
