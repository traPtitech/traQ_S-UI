/* eslint-disable @typescript-eslint/no-var-requires */
const https = require('https')
const keepAliveAgent = new https.Agent({ keepAlive: true })
const configureWebpack = require('./vue-webpack.config')
const { DEV_SERVER_PROXY_HOST } = require('./dev.config')

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @use "sass:math";
          @import "src/styles/common.scss";
        `
      }
    },
    extract:
      process.env.NODE_ENV === 'production'
        ? {
            ignoreOrder: true
          }
        : false
  },

  configureWebpack,

  chainWebpack: config => {
    const svgRule = config.module.rule('svg')

    svgRule
      .oneOf('component')
      .resourceQuery(/component/)
      .use('vue-loader-v16')
      .loader('vue-loader-v16')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .options({
        svgo: {
          plugins: [
            { removeDimensions: true },
            { removeViewBox: false },
            { convertColors: { currentColor: true } }
          ]
        }
      })
      .end()
      .end()
    svgRule.oneOf('normal').uses.merge(svgRule.uses.entries())
    svgRule.uses.clear()
  },

  pwa: {
    name: 'traQ',
    themeColor: '#0D67EA',
    msTileColor: '#0D67EA',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    assetsVersion: require('./package.json').version,

    manifestPath: 'site.webmanifest',
    manifestOptions: {
      start_url: '/',
      background_color: '#f6f7f9',
      icons: [
        {
          src: '/img/icons/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/img/icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/img/icons/android-chrome-192x192-maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/img/icons/android-chrome-512x512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      description:
        'traQ (pronounced "track") is a messenger application built for Digital Creators Club traP. traQ allows ease communication among team members by organizing contexts into tree-structured channels.',
      screenshots: [
        {
          src: '/img/screenshots/Pixel 2 XL1.png',
          sizes: '1439x2881',
          type: 'image/png'
        },
        {
          src: '/img/screenshots/Pixel 2 XL2.png',
          sizes: '1439x2881',
          type: 'image/png'
        },
        {
          src: '/img/screenshots/Pixel 2 XL3.png',
          sizes: '1439x2881',
          type: 'image/png'
        }
      ],
      share_target: {
        action: '/share-target',
        method: 'GET',
        params: {
          title: 'title',
          text: 'text',
          url: 'url'
        }
      },
      gcm_sender_id: '103953800507'
    },
    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/mstile-144x144.png'
    },

    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'public/sw.js',
      swDest: 'sw.js'
    }
  },

  devServer: {
    proxy: {
      '/api/v3/*': {
        target: DEV_SERVER_PROXY_HOST,
        ws: true,
        changeOrigin: true,
        agent: keepAliveAgent
      },
      '/api/auth/*': {
        target: DEV_SERVER_PROXY_HOST,
        changeOrigin: true,
        agent: keepAliveAgent
      }
    }
  }
}
