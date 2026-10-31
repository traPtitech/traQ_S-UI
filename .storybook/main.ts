import { fileURLToPath } from 'node:url'

import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: {
        plugin: 'vue-component-meta',
        tsconfig: '.storybook/tsconfig.json'
      },
      builder: {
        viteConfigPath: fileURLToPath(
          new URL('./vite.config.ts', import.meta.url)
        )
      }
    }
  },
  staticDirs: [
    '../public',
    { from: '../public/img/icons', to: '/api/v3/files' }
  ]
}

export default config
