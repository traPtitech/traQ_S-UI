// vite.config.tsのdefineで定義されているもの

declare const __VERSION__: string
declare const __DEV_SERVER__: string

export const VERSION = __VERSION__
export const DEV_SERVER = __DEV_SERVER__
