import { Plugin } from 'vue'

export const $boolAttr = (attr: boolean) => (attr ? '' : null)

/*
  vue2 => vue3でのboolean attributeの変更の対応用
  例として`<div :attr="val" />`のとき、

  without $bool: `true` => `<div attr="true" />`, `false` => `<div attr="false" />`
  with $bool: `true` => `<div attr />`, `false` => `<div />`

  see https://v3.vuejs.org/guide/migration/attribute-coercion.html#coercing-false-to-false-instead-of-removing-the-attribute
*/
const boolAttr: Plugin = {
  install: app => {
    app.config.globalProperties.$boolAttr = $boolAttr
  }
}

export default boolAttr
