import { createApp } from 'vue'

// eslint-disable-next-line @typescript-eslint/ban-types
type Options = {}

export const withSetup =
  <A extends readonly unknown[], R>(
    composable: (...args: A) => R,
    options: Options = {}
  ) =>
  (...args: A) => {
    let result!: R
    const app = createApp({
      setup() {
        result = composable(...args)
        // suppress missing template warning
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {}
      }
    })
    app.mount(document.createElement('div'))
    return [result] as const
  }
