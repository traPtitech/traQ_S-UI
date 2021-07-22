// eslint-disable-next-line unused-imports/no-unused-imports
import { ComponentCustomProperties } from 'vue'
import type { $boolAttr } from '/@/bool-attr'

declare module '@vue/runtime-core' {
  // see https://github.com/vuejs/vue-next/pull/982
  interface ComponentCustomProperties {
    $boolAttr: typeof $boolAttr
  }
}
