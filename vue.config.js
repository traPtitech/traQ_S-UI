const https = require('https')
const keepAliveAgent = new https.Agent({ keepAlive: true })

module.exports = {
  css: {
    loaderOptions: {
      // pass options to sass-loader
      scss: {
        // import `src/styles/_main.scss` to all components
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
        changeOrigin: true,
        agent: keepAliveAgent
      },
      '/api/v3/*': {
        target: 'https://traq-s-dev.tokyotech.org/',
        changeOrigin: true,
        agent: keepAliveAgent
      }
    }
  },

  productionSourceMap: false
}
