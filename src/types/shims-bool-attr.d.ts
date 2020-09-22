// eslint-disable-next-line unused-imports/no-unused-imports-ts
import { ComponentCustomProperties } from 'vue'
import type { $boolAttr } from '@/bool-attr'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $boolAttr: typeof $boolAttr
  }
}
