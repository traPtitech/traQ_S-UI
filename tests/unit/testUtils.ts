import { createApp } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

    const funcs = {
      unmount: () => {
        app.unmount()
      }
    }

    return [result, funcs] as const
  }
