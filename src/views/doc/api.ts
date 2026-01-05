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

/** 查询系统用户 */
export function systemSysUserFind(data: any) {
  return axios.admin({
    url: `/api/system/user/find`,
    method: 'post',
    data
  })
}

/** 查询系统角色 */
export function systemSysRoleFind(data: any) {
  return axios.admin({
    url: `/api/system/role/find`,
    method: 'post',
    data
  })
}

/** 查询系统机构 */
export function systemSysOrgFind(data: any) {
  return axios.admin({
    url: `/api/system/organ/find`,
    method: 'post',
    data
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
