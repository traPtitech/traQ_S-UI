/// <reference types="vite/client" />

declare module '/@/assets/*.svg' {
  import { DefineComponent } from 'vue'
  const content: DefineComponent
  export default content
}

declare module '/@/assets/*.svg?url' {
  const src: string
  export default src
}
