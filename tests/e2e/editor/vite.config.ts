import { fileURLToPath } from 'node:url'

import { defineConfig, mergeConfig } from 'vite'

import componentConfig from '../../../build/component.vite.config.ts'

export default mergeConfig(
  componentConfig,
  defineConfig({
    root: fileURLToPath(new URL('../../../', import.meta.url)),
    cacheDir: 'node_modules/.vite-editor',
    optimizeDeps: { entries: ['tests/e2e/editor/index.html'] },
    publicDir: fileURLToPath(new URL('../../../public', import.meta.url)),
    server: { host: '127.0.0.1', port: 4174, strictPort: true }
  })
)
