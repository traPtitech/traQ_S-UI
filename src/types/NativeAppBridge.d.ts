export type NativeAppWindow = Window &
  typeof globalThis & {
    iOSToken?: string
  }
