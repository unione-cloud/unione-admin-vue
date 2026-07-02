import { axios } from 'unione-base-vue'

export default {
  // 发布
  release(data: any) {
    return axios.admin({
      url: '/api/data/define/release',
      method: 'post',
      data
    })
  },
  find(data: any) {
    return axios.admin({
      url: '/api/data/define/find',
      method: 'post',
      data
    })
  },
  // 新增、修改
  save(data: any) {
    return axios.admin({
      url: '/api/data/define/save',
      method: 'post',
      data
    })
  },
  // 删除
  delete(ids: Array<any>) {
    return axios.admin({
      url: '/api/data/define/delete',
      method: 'post',
      data: ids
    })
  },
  // 详情
  detail(id: any) {
    return axios.admin({
      url: '/api/data/define/detail',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: id
    })
  },
  // 从数据库中加载table
  loadFromDb(data: any) {
    return axios.admin({
      url: '/api/data/define/load/from/db',
      method: 'post',
      data
    })
  },
  // 从数据库中导入table
  impFromDb(data: any) {
    return axios.admin({
      url: '/api/data/define/imp/from/db',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data
    })
  },
  // 生成代码
  genCode(data: any) {
    return axios.admin({
      url: '/api/data/define/gen/code',
      method: 'post',
      responseType: 'blob',  // 关键：设置响应类型为blob
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data
    })
  }
}
