export const defaultLang = 'zh-CN'
export type Locale = 'zh-CN' | 'en-US'
import UnioneFormVue from 'unione-form-vue'

export function loadLanguage(lang: Locale = defaultLang): Promise<string> {
  return UnioneFormVue.locales.loadLanguage(lang, () => {
    return new Promise<string>((resolve) => {
      import(
        /* webpackChunkName: "lang-[request]" */
        /* 根据所用文件后缀(ts、js、vue)，自行添加后缀 */
        // eslint-disable-next-line comma-dangle
        /* @vite-ignore */ `./lang/${lang}`
      ).then((result) => {
        console.log('loaded lang data:', result.default)
        return resolve(result.default)
      })
    })
  })
}
