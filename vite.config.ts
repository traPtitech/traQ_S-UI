/// <reference types="vitest" />
import * as path from 'path'
import fs from 'fs'
import { Agent as HttpsAgent } from 'https'

import VuePlugin from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import browserslist from 'browserslist'
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist'
import brotli from 'rollup-plugin-brotli'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import svgLoader from 'vite-svg-loader'
import GithubActionsReporter from 'vitest-github-actions-reporter'

import { DEV_SERVER_PROXY_HOST } from './dev.config'
import packageJson from './package.json'
import webManifest from './webmanifest'

const keepAliveAgent = new HttpsAgent({ keepAlive: true })

const localhostCerts =
  fs.existsSync('.certs/localhost.crt') && fs.existsSync('.certs/localhost.key')
    ? {
        https: {
          key: fs.readFileSync('.certs/localhost.key'),
          cert: fs.readFileSync('.certs/localhost.crt')
        }
      }
    : {}

export default defineConfig(({ mode }) => ({
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
    },
    ...localhostCerts
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
