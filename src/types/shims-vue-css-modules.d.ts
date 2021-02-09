// eslint-disable-next-line unused-imports/no-unused-imports
import { ComponentCustomProperties } from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $style: { [className: string]: string }
  }
}
