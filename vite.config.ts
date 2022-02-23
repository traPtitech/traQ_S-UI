import { defineConfig } from 'vite'
import * as path from 'path'
import packageJson from './package.json'
import { VitePWA } from 'vite-plugin-pwa'
import VuePlugin from '@vitejs/plugin-vue'
import brotli from 'rollup-plugin-brotli'
import svgLoader from 'vite-svg-loader'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { Agent as HttpsAgent } from 'https'
import webManifest from './webmanifest'
import { DEV_SERVER_PROXY_HOST } from './dev.config'
import browserslist from 'browserslist'
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist'

const keepAliveAgent = new HttpsAgent({ keepAlive: true })
const srcPath = path.resolve(__dirname, 'src').replace(/\\/g, '/')

export default defineConfig(({ command, mode }) => ({
  resolve: {
    alias: {
      '/@': srcPath,
      '/~': path.resolve(__dirname, 'node_modules').replace(/\\/g, '/')
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
    })
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:math";
          @import "${srcPath}/styles/common.scss";
        `,
        charset: false
      }
    }
  },
  // /@/lib/define.tsを参照
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
    __DEV_SERVER__: JSON.stringify(
      command === 'serve' ? DEV_SERVER_PROXY_HOST : ''
    )
  },
  json: {
    stringify: true
  },
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      manifest: webManifest,
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['fonts/*.woff2']
    }),
    VuePlugin(),
    svgLoader({
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
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@sapphi-red/dtln-web/dist/*',
          dest: 'dtln-web'
        }
      ]
    }),
    brotli()
  ]
}))
