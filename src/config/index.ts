import { ref } from 'vue'
import setting from './settings'
import { utils, axios, useDialog } from 'unione-base-vue'

const configObj = ref<any>(setting)

export default configObj.value

/**
 * 加载配置
 * @param options
 * @returns
 */
export async function loadConfig(name: String) {
  const config: any = {}
  const res = await axios
    .admin({
      method: 'POST',
      url: `/api/system/configDefine/tree/${name}/-1`
    })
    .then()
  if (res.body) {
    res.body.forEach((row: any) => {
      utils.obj.setValue(configObj.value, row.sn, row.valueUsed || row.valueDefault)
      config[row.sn] = row
    })
  }
  return config
}

export function setConfig(name: string, value: string) {
  const dialog = useDialog()
  const data = new FormData()
  data.append('sn', name)
  data.append('value', value)
  axios
    .admin({
      method: 'POST',
      url: '/api/system/configDefine/setValue',
      data
    })
    .then((res: any) => {
      if (res.success) {
        dialog.success('操作成功')
        utils.obj.setValue(configObj.value, name, value)
      } else {
        dialog.error(res.message)
      }
    })
}
