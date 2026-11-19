import { fileURLToPath } from 'node:url'

import VuePlugin from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

import packageJson from '../package.json' with { type: 'json' }

export default defineConfig({
  resolve: {
    alias: {
      '/@': fileURLToPath(new URL('../src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:math";
          @use "/@/styles/common.scss" as *;
        `,
        charset: false
      }
    }
  },
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
    __DEV_SERVER__: JSON.stringify('')
  },
  plugins: [
    VuePlugin(),
    svgLoader({
      defaultImport: 'component',
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                convertColors: {
                  currentColor: true
                }
              }
            }
          },
          'removeDimensions'
        ]
      }
    })
  ]
})
