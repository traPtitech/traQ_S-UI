// eslint-disable-next-line unused-imports/no-unused-imports-ts
import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $style: { [className: string]: string }
  }
}
