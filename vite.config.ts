/// <reference types="vitest" />
import fs from 'fs'
import { Agent as HttpsAgent } from 'https'

import brotli from 'rollup-plugin-brotli'
import { defineConfig, mergeConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import { createComponentConfig } from './build/component.vite.config.ts'
import { DEV_SERVER_PROXY_HOST } from './dev.config.ts'
import packageJson from './package.json' with { type: 'json' }
import { getBackendOrigin } from './tests/e2e/config.ts'
import webManifest from './webmanifest.ts'

const nodeTests = [
  'tests/unit/lib/basic/!(timer).spec.ts',
  'tests/unit/lib/markdown/{source,syntax}.spec.ts',
  'tests/unit/lib/referenceInput/suggestion.spec.ts'
]

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

export default defineConfig(({ mode }) =>
  mergeConfig(createComponentConfig(), {
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
      ...(mode === 'e2e' ? {} : localhostCerts)
    },
    preview: {
      ...(mode === 'e2e'
        ? {
            proxy: {
              '/api/v3': {
                target: getBackendOrigin(),
                changeOrigin: true,
                ws: true
              },
              '/api/auth': {
                target: getBackendOrigin(),
                changeOrigin: true,
                ws: true
              }
            }
          }
        : {})
    },
    build: {
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
              // hljsは適当に三つに分割する
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
      devSourcemap: true
    },
    // /@/lib/define.tsを参照
    define: {
      __VERSION__: JSON.stringify(
        mode === 'test' ? 'test' : packageJson.version
      ),
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
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          globPatterns: [
            '**/*.{js,css,html,wasm}' /* default */,
            '**/assets/**/*.svg'
          ]
        }
      }),
      brotli()
    ],
    test: {
      env: {
        TZ: 'UTC'
      },
      globals: true,
      projects: [
        {
          extends: true,
          test: {
            name: 'node',
            include: nodeTests,
            environment: 'node',
            setupFiles: [
              'tests/unit/markdownRuntime.ts',
              'tests/unit/expectExtends.ts'
            ]
          }
        },
        {
          extends: true,
          test: {
            name: 'dom',
            include: ['tests/unit/**/*.spec.ts'],
            exclude: nodeTests,
            environment: 'jsdom',
            setupFiles: [
              'tests/unit/markdownRuntime.ts',
              'tests/unit/setup.ts',
              'tests/unit/expectExtends.ts',
              'fake-indexeddb/auto'
            ]
          }
        }
      ],
      reporters:
        process.env.GITHUB_ACTIONS === 'true'
          ? ['default', 'github-actions']
          : 'default',
      coverage: {
        reporter: ['text', 'lcov']
      }
    }
  })
)
