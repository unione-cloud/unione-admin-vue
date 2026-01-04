import { axios } from 'unione-base-vue'

/** 新增文件夹 */
export function apiDirSave(data: any) {
  data.type = 'dir'
  return axios.admin({
    url: '/api/common/file/save',
    method: 'post',
    data
  })
}

/** 删除文件夹 */
export function apiDirDelete(data: any) {
  const url = '/api/common/file/delete'
  return axios.admin({
    url,
    method: 'POST',
    data
  })
}

/** 文件查询 */
export function getApiFileFind(data: any, type: number) {
  if (type == 1) {
    return axios.admin({
      url: `/api/common/file/find/mine`,
      method: 'post',
      data
    })
  } else if (type == 2) {
    return axios.admin({
      url: `/api/common/file/find/mineShare`,
      method: 'post',
      data
    })
  } else if (type == 3) {
    return axios.admin({
      url: `/api/common/file/find/shareMine`,
      method: 'post',
      data
    })
  } else if (type == 4) {
    return axios.admin({
      url: `/api/common/file/find/other`,
      method: 'post',
      data
    })
  }
  return axios.admin({
    url: `/api/common/file/find`,
    method: 'post',
    data
  })
}

/** 文件查询 我的 */
export function getApiFileFindMine(data: any) {
  return axios.admin({
    url: `/api/common/file/find/mine`,
    method: 'post',
    data
  })
}

/** 文件查询 我的共享 */
export function getApiFileFindMineShare(data: any) {
  return axios.admin({
    url: `/api/common/file/find/mineShare`,
    method: 'post',
    data
  })
}

/** 文件查询 共享给我的文件 */
export function getApiFileFindShareMine(data: any) {
  return axios.admin({
    url: `/api/common/file/find/shareMine`,
    method: 'post',
    data
  })
}

/** 文件上传 */
export function uploadBatch(data: any, ownerId: any) {
  return axios.admin({
    url: `/api/common/store/upload/batch/doc${ownerId ? '/' + ownerId : ''}`,
    method: 'post',
    data
  })
}

/** 删除文件 */
export function apiFileDelete(data: any) {
  const url = '/api/common/file/delete'
  return axios.admin({
    url,
    method: 'POST',
    data
  })
}

/** 文件下载 */
export function apiFileDownload(fileId: any) {
  const url = `/api/common/store/download/${fileId}`
  return axios.admin({
    url,
    method: 'get',
    responseType: 'blob'
  })
}

/** 文件下载批量下载 */
export function apiStoreDownload(data: any) {
  const url = `/api/common/store/download`
  return axios.admin({
    url,
    method: 'POST',
    responseType: 'blob',
    data
  })
}

/** 文件修改 */
export function apiFileUpdate(data: any) {
  const url = `/api/common/file/update`
  return axios.admin({
    url,
    method: 'POST',
    data
  })
}

/** 文件权限修改 */
export function apiPermisUpdate(data: any) {
  const url = `/api/system/doc/permis/update`
  return axios.admin({
    url,
    method: 'POST',
    data
  })
}

/** 文件权限新增 */
export function apiPermisSave(data: any) {
  const url = `/api/system/doc/permis/save`
  return axios.admin({
    url,
    method: 'POST',
    data
  })
}

/** 文件详情 */
export function apiFileDetail(id: any) {
  const url = `/api/common/file/detail/${id}`
  return axios.admin({
    url,
    method: 'GET'
  })
}

/** 文件夹详情 */
export function apiDirDetail(id: any) {
  const url = `/api/common/file/detail/${id}`
  return axios.admin({
    url,
    method: 'GET'
  })
}

/** 审批记录查询 */
export function apiPermisToAudit(data: any) {
  return axios.admin({
    url: `/api/system/doc/permis/toAudit`,
    method: 'post',
    data
  })
}

/** 提交审核结果 */
export function apiPermisDoAudit(data: any) {
  return axios.admin({
    url: `/api/system/doc/permis/doAudit`,
    method: 'post',
    data
  })
}

/** doc配置 */
export function apiConfig() {
  return Promise.resolve({
    success: true,
    body: {
      filePermisEnable: true
    }
  })
}

/** 加载指定文档权限集合 */
export function apiPermisLoadWith(fileId: any) {
  return axios.admin({
    url: `/api/system/doc/permis/load`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    data: fileId
  })
}

// 审批记录查询
export function getDocumentsApprovalFind(data: any) {
  return axios.admin({
    url: `/DocumentsApproval/find`,
    method: 'post',
    data
  })
}

// 审批管理 档案日志 查询
export function getdocumentsLogFind(data: any) {
  console.log(data)
  return axios.admin({
    url: `/documentsLog/find`,
    method: 'post',
    data
  })
}

// 全部文件 文件上传
export function getdocumentsFileUpload(data: any) {
  console.log(data)
  let url = `/documentsFile/upload?name=${data.name}`
  for (const key in data) {
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty(key)) {
      if (key == 'name' || key == 'formData') {
        //
      } else if (data[key]) {
        url += `&${key}=${data[key]}`
      }
    }
  }
  return axios.admin({
    url,
    method: 'post',
    data: data.formData,
    dataType: 'formData',
    processData: false
  })
}

// 全部文件 文件删除
export function getdocumentsFileDeletes(data: any) {
  let url = `/documentsFile/deletes?ids=${data[0].fileType === 'DIR' ? 'DIR_' + data[0].id : 'FILE_' + data[0].id}`
  data.map((v: any, i: any) => {
    if (i > 0) {
      switch (v.fileType) {
        case 'DIR':
          url += `&ids=DIR_${v.id}`
          break
        default:
          url += `&ids=FILE_${v.id}`
          break
      }
    }
  })
  return axios.admin({
    url,
    method: 'post',
    data
  })
}

// 新建文件夹
export function getdocumentsDirNewFile(data: any) {
  let url = `/documentsDir/newFile?sname=${data.sname}`
  for (const key in data) {
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty(key)) {
      if (key !== 'sname') {
        if (data[key]) {
          url += `&${key}=${data[key]}`
        }
      }
    }
  }
  return axios.admin({
    url,
    method: 'post'
  })
}

// 在线查看
export function getdocumentsFileViewWith(data: any) {
  return axios.admin({
    url: `/documentsFile/view/${data.id}`,
    method: 'get'
  })
}

// 设置公开
export function getdocumentsFileOpenPassWith(data: any) {
  let url = `/documentsFile/openPass?id=${data.id}`
  for (const key in data) {
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty(key)) {
      if (key !== 'id') {
        url += `&${key}=${data[key]}`
      }
    }
  }
  return axios.admin({
    url,
    method: 'PATCH'
  })
}

// 审批
export function getdocumentsFileApprovalWith(data: any) {
  let url = `/documentsFile/approval?opinion=${data.opinion}&status=${data.status}`
  for (const key in data) {
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty(key)) {
      if (key === 'ids') {
        data.ids.map((v: any) => {
          url += `&ids=${v}`
        })
      }
    }
  }
  return axios.admin({
    url,
    method: 'PATCH',
    data
  })
}

// 回收站
export function getdocumentsFileRecycle(data: any) {
  data = { body: data }
  return axios.admin({
    url: `/documentsFile/recycle`,
    method: 'post',
    data
  })
}

// 回收站删除
export function getdocumentsFilerecycleDelete(data: any) {
  const arr: any[] = []
  data.map((item: any) => {
    Object.assign(item, {
      deleteid: `${item.fileType}_${item.sid}`
    })
    arr.push(item.deleteid)
  })
  return axios.admin({
    url: `/documentsFile/recycleDelete`,
    method: 'POST',
    data: arr
  })
}

// 回收站还原
export function getdocumentsFileRecycleCancel(data: any) {
  const arr: any[] = []
  data.map((item: any) => {
    Object.assign(item, {
      deleteid: `${item.fileType}_${item.id}`
    })
    arr.push(item.deleteid)
  })
  return axios.admin({
    url: `/documentsFile/recycleCancel`,
    method: 'post',
    data: arr
  })
}

// 文件下载
export function getdocumentsFileDownload(data: any) {
  // console.log(data)
  let url = `/documentsFile/download?pass=FILE_${data[0].id}`
  // let arr = []
  data.map((v: any, i: any) => {
    // arr.push(v.sid)
    if (i !== 0) {
      url += `&id=${v.id}`
    }
  })
  // console.log(url)
  const arr: any[] = []
  data.map((item: any) => {
    Object.assign(item, {
      deleteid: `${item.fileType}_${item.id}`
    })
    arr.push(item.deleteid)
  })

  const urls = arr.join(',')
  // return axios.admin({
  //   url: `/documentsFile/download`,
  //   method: 'get',
  //   data: { pass: urls }
  // })
  axios({
    method: 'get',
    // url: '/documentsFile/download',
    url,
    responseType: 'blob'
    // data: { pass: urls }
  }).then((res: any) => {
    console.log(res, 'res')
  })
}

/** 查看文件 */
export function getFile(record: any) {
  let url = `/api/store/preview`
  if (record.isPublic == 1) {
    url = `/api/store/preview/public`
  }
  return axios.admin({
    url: `${url}/${record.id}`,
    method: 'get',
    responseType: record.suffix == 'txt' ? '' : 'blob'
  })
}
