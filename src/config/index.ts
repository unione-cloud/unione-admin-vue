import { ref } from 'vue'
import setting from './settings'
import { utils, axios, useDialog, useSession } from 'unione-base-vue'
import { defineStore } from 'pinia'

/**
 * Admin Store
 */
export const useConfigStore = defineStore('unione-config', () => {
  const model = import.meta.env.VITE_MODEL || 'dev'
  const config = ref<any>(setting)
  const session = useSession()

  if (model != 'dev') {
    config.value.view.logo.title.css['background-image'] = 'url(/portal/logo.png)'
  }
  if (session.getStorage('unione-config')) {
    config.value = JSON.parse(session.getStorage('unione-config'))
  }

  /**
   * 加载配置
   * @param options
   * @returns
   */
  async function loadConfig(name: String) {
    const conf: any = {}
    const res = await axios
      .admin({
        method: 'POST',
        url: `/api/system/configDefine/tree/${name}/-1`
      })
      .then()
    if (res.body) {
      res.body.forEach((row: any) => {
        utils.obj.setValue(config.value, row.sn, row.valueUsed || row.valueDefault)
        conf[row.sn] = row
        session.setStorage('unione-config', JSON.stringify(config.value))
      })
    }
    return conf
  }

  function setConfig(name: string, value: string) {
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
          utils.obj.setValue(config.value, name, value)
          session.setStorage('unione-config', JSON.stringify(config.value))
        } else {
          dialog.error(res.message)
        }
      })
  }

  return {
    config,
    loadConfig,
    setConfig
  }
})
