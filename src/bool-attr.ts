import { Plugin } from 'vue'

export const $boolAttr = (attr: boolean) => (attr ? '' : null)

// vue2 => vue3でのboolean attributeの変更の対応用
const boolAttr: Plugin = {
  install: app => {
    app.config.globalProperties.$boolAttr = $boolAttr
  }
}

export default boolAttr
