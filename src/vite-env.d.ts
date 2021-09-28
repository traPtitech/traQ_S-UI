/// <reference types="vite/client" />

declare module '/@/assets/*.svg' {
  import { Component } from 'vue'
  const content: Component
  export default content
}

declare module '/@/assets/*.svg?url' {
  const src: string
  export default src
}
