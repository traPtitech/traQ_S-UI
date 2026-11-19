import { readFile, writeFile } from 'node:fs/promises'
import { URL } from 'node:url'

// Remove the global any overrides and the reference to the unpublished .vue file.
const typings = new URL(
  '../node_modules/vue-slider-component/lib/typings/index.d.ts',
  import.meta.url
)
const originalHeader = `/// <reference path="./global.d.ts" />

import VueSlider from '../vue-slider.vue'
`
const patchedHeader = `import type { DefineComponent } from 'vue'

declare const VueSlider: DefineComponent
`

const source = (await readFile(typings, 'utf8')).replaceAll('\r\n', '\n')

if (!source.startsWith(patchedHeader)) {
  if (!source.startsWith(originalHeader)) {
    throw new Error(
      'vue-slider-component typings changed; update scripts/patch-dependencies.js'
    )
  }

  await writeFile(typings, patchedHeader + source.slice(originalHeader.length))
}
