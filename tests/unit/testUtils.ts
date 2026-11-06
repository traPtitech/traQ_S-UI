import type { App } from 'vue'
import { createApp } from 'vue'

import { VueQueryPlugin } from '@tanstack/vue-query'

import { createQueryClient } from '/@/lib/queryClient'

type Options = {
  setup?: (app: App) => void
}

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
    options.setup?.(app)
    app.mount(document.createElement('div'))

    const funcs = {
      unmount: () => {
        app.unmount()
      }
    }

    return [result, funcs] as const
  }

export const withQuerySetup = <A extends readonly unknown[], R>(
  composable: (...args: A) => R
) =>
  withSetup(composable, {
    setup: app => {
      app.use(VueQueryPlugin, { queryClient: createQueryClient() })
    }
  })
