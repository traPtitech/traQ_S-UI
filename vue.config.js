const CompressionPlugin = require('compression-webpack-plugin')
const https = require('https')
const keepAliveAgent = new https.Agent({ keepAlive: true })

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import "src/styles/common.scss";'
      }
    }
  },

  configureWebpack: {
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js'
      }
    },
    context: __dirname,
    module: {
      rules: []
    },
    plugins:
      process.env.NODE_ENV === 'production'
        ? [
            new CompressionPlugin({
              filename: '[path].br[query]',
              algorithm: 'brotliCompress',
              test: /\.(js|css|html|svg|json)$/,
              compressionOptions: { level: 11 },
              minRatio: 1,
              deleteOriginalAssets: false
            })
          ]
        : []
  },

  chainWebpack: config => {
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .options({
        svgo: {
          plugins: [
            { removeViewBox: true },
            { removeAttrs: { attrs: 'path:fill' } }
          ]
        }
      })
  },

  devServer: {
    proxy: {
      '/api/v3/*': {
        target: 'https://traq-s-dev.tokyotech.org/',
        ws: true,
        changeOrigin: true,
        agent: keepAliveAgent
      }
    }
  },

  productionSourceMap: false
}
