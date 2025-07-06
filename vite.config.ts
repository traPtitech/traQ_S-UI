/// <reference types="vitest" />

import { defineConfig } from 'vite'
import * as path from 'path'
import packageJson from './package.json'
import { VitePWA } from 'vite-plugin-pwa'
import VuePlugin from '@vitejs/plugin-vue'
import brotli from 'rollup-plugin-brotli'
import svgLoader from 'vite-svg-loader'
import { Agent as HttpsAgent } from 'https'
import webManifest from './webmanifest'
import { DEV_SERVER_PROXY_HOST } from './dev.config'
import browserslist from 'browserslist'
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist'
import GithubActionsReporter from 'vitest-github-actions-reporter'
import autoprefixer from 'autoprefixer'

const keepAliveAgent = new HttpsAgent({ keepAlive: true })

export default defineConfig(({ command, mode }) => ({
  resolve: {
    alias: {
      '/@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8080,
    proxy: {
      '/api/v3': {
        target: DEV_SERVER_PROXY_HOST,
        changeOrigin: true,
        ws: true,
        agent: keepAliveAgent
      },
      '/api/auth': {
        target: DEV_SERVER_PROXY_HOST,
        changeOrigin: true,
        ws: true,
        agent: keepAliveAgent
      }
    }
  },
  build: {
    target: resolveToEsbuildTarget(browserslist(), {
      printUnknownTargets: false
    }),
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/katex')) return 'katex'
          if (['@traptitech/traq/', 'axios'].some(t => id.includes(t))) {
            return 'apis'
          }
          const hljsLangs = 'node_modules/highlight.js/lib/languages/'
          const hljsLangIndex = id.indexOf(hljsLangs)
          if (id.includes(hljsLangs)) {
            // hljsは適当に二つに分割する
            const firstLetter = id[hljsLangIndex + hljsLangs.length]
            if (firstLetter < 'i') {
              return 'hljs'
            }
            if (firstLetter < 'r') {
              return 'hljs2'
            }
            return 'hljs3'
          }
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `
          @use "sass:math";
          @use "/@/styles/common.scss" as *;
        `,
        charset: false
      }
    },
    postcss: {
      plugins: mode === 'production' ? [autoprefixer()] : []
    },
    devSourcemap: true
  },
  // /@/lib/define.tsを参照
  define: {
    __VERSION__: JSON.stringify(mode === 'test' ? 'test' : packageJson.version),
    __DEV_SERVER__: JSON.stringify(
      mode === 'development' ? DEV_SERVER_PROXY_HOST : ''
    )
  },
  json: {
    stringify: true
  },
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      manifest: webManifest,
      injectRegister: null,
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['fonts/*.woff2'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html}' /* default */, '**/assets/**/*.svg']
      }
    }),
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
    }),
    brotli()
  ],
  test: {
    env: {
      TZ: 'UTC'
    },
    include: ['tests/unit/**/*.spec.ts'],
    globals: true,
    setupFiles: [
      'tests/unit/setup.ts',
      'tests/unit/expectExtends.ts',
      'fake-indexeddb/auto'
    ],
    environment: 'jsdom',
    reporters: process.env.CI ? new GithubActionsReporter() : 'default',
    coverage: {
      reporter: ['text', 'lcov']
    }
  }
}))
