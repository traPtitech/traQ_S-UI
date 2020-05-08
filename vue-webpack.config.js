/* eslint-disable @typescript-eslint/no-var-requires */
const CompressionPlugin = require('compression-webpack-plugin')
const webpack = require('webpack')
const crypto = require('crypto')
const path = require('path')

module.exports = {
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      pica: 'pica/dist/pica.js',
      // vuex-persist
      'lodash.merge': path.resolve('./node_modules/lodash-es/merge.js')
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
          }),
          new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(require('./package.json').version)
          })
        ]
      : [
          new webpack.DefinePlugin({
            __VERSION__: JSON.stringify('dev')
          })
        ],
  optimization: {
    // https://web.dev/granular-chunking-nextjs/
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        default: false,
        vendors: false,
        framework: {
          chunks: 'all',
          name: 'framework',
          test: /[\\/]node_modules[\\/](@vue\/composition-api|direct-vuex|vue|vue-router|vuex|vuex-persist|@traptitech\/traq|@traptitech\/traq-markdown-it|core-js|highlight.js|markdown-it)[\\/]/,
          priority: 40,
          enforce: true
        },
        lib: {
          test(module) {
            return (
              module.size() > 150000 && // 150KB cut off for any npm library (change this value to meet your requirements)
              /node_modules[/\\]/.test(module.identifier())
            )
          },
          name(module) {
            const hash = crypto.createHash('sha1')
            hash.update(module.libIdent({ context: 'dir' }))

            return 'lib-' + hash.digest('hex').substring(0, 8)
          },
          priority: 30,
          minChunks: 1,
          reuseExistingChunk: true
        },
        commons: {
          name: 'commons',
          minChunks: 3, // define (or pass in) the total number of pages here
          priority: 20
        },
        shared: {
          name(module, chunks) {
            const hash = crypto
              .createHash('sha1')
              .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
              .digest('hex')

            return hash
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true
        }
      }
    }
  }
}
