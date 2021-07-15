import { defineConfig } from 'vite'
import path from 'path'
import packageJson from './package.json'
import { VitePWA } from 'vite-plugin-pwa'
import VuePlugin from '@vitejs/plugin-vue'
import brotli from 'rollup-plugin-brotli'
import vueSvgPlugin from 'vite-plugin-vue-svg'
import https from 'https'
import webManifest from './webmanifest'
import { DEV_SERVER_PROXY_HOST } from './dev.config'

const keepAliveAgent = new https.Agent({ keepAlive: true })
const srcPath = path.resolve(__dirname, 'src').replace(/\\/g, '/')

export default defineConfig(({ command, mode }) => ({
  resolve: {
    alias: {
      '@': srcPath,
      '~': path.resolve(__dirname, 'node_modules').replace(/\\/g, '/')
    }
  },
  server: {
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
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:math";
          @import "${srcPath}/styles/common.scss";
        `
      }
    }
  },
  define: {
    __VERSION__: JSON.stringify(packageJson.version),
    __DEV_SERVER__: JSON.stringify(
      command === 'serve' ? DEV_SERVER_PROXY_HOST : ''
    ),
    __VUE_OPTIONS_API__: false
  },
  json: {
    stringify: true
  },
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      manifest: webManifest,
      srcDir: 'src',
      filename: 'sw.js'
    }),
    VuePlugin(),
    vueSvgPlugin({
      defaultExport: 'component',
      svgoConfig: {
        plugins: [
          { removeDimensions: true },
          { removeViewBox: false },
          { convertColors: { currentColor: true } }
        ]
      }
    }),
    brotli()
  ]
}))
