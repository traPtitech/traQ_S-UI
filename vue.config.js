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
    plugins: []
  },

  devServer: {
    proxy: {
      '/api/1.0/*': {
        target: 'https://traq-dev.tokyotech.org/',
        ws: true,
        changeOrigin: true,
        agent: keepAliveAgent
      },
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
