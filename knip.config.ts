import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/{main,sw}.ts'],
  project: ['src/**'],
  ignore: [
    'src/types/entity-ids.d.ts',
    'tsconfig.json',
    'src/components/UI/VirtualScroller.vue'
  ],
  ignoreUnresolved: [/.*\.svg/],
  ignoreDependencies: ['highlight.js'],
  ignoreExportsUsedInFile: true,
  includeEntryExports: true,
  treatConfigHintsAsErrors: true
}

export default config
