import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $style: { [className: string]: string }
  }
}

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
