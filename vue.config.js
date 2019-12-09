module.exports = {
  css: {
    loaderOptions: {
      // pass options to sass-loader
      sass: {
        // import `src/style/_main.sass` to all components
        // prependData: '@import "~@/style/_main.sass"'
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
    // proxy: {
    //   '/api/*': {
    //     target: '',
    //     changeOrigin: true
    //   }
    // }
  },

  productionSourceMap: false
}
