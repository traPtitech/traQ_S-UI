import path from 'path'

import browserslist from 'browserslist'
import esbuild from 'esbuild'
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist'

await esbuild.build({
  entryPoints: [path.resolve('./src/notification-sw.ts')],
  outfile: path.resolve('./dist/notification-sw.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  minify: true,
  target: resolveToEsbuildTarget(browserslist(), {
    printUnknownTargets: false
  })
})
