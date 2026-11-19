import { fileURLToPath } from 'node:url'

import { defineConfig, mergeConfig } from 'vite'

import componentConfig from '../../../.storybook/vite.config.ts'

export default mergeConfig(
  componentConfig,
  defineConfig({
    root: fileURLToPath(new URL('../../../', import.meta.url)),

    resolve: {
      alias: [
        {
          find: '/@/composables/qall/useLiveKitSDK',
          replacement: fileURLToPath(new URL('./audio.ts', import.meta.url))
        },

        {
          find: '/@/store/app/tts',
          replacement: fileURLToPath(new URL('./audio.ts', import.meta.url))
        }
      ]
    },

    cacheDir: 'node_modules/.vite-virtual-scroll',
    optimizeDeps: { entries: ['tests/e2e/virtual-scroll/index.html'] },
    publicDir: fileURLToPath(new URL('../../../public', import.meta.url)),
    server: { host: '127.0.0.1', port: 4175, strictPort: true }
  })
)
