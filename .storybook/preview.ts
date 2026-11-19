import { computed } from 'vue'

import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { createPinia } from 'pinia'

import boolAttr from '/@/bool-attr'
import '/@/styles/global.scss'

import ThemeProvider from './ThemeProvider.vue'

setup(app => {
  app.use(createPinia())
  app.use(boolAttr)
})

const preview: Preview = {
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    theme: 'light'
  },
  decorators: [
    (story, context) => ({
      components: { Story: story(), ThemeProvider },
      setup: () => ({
        theme: computed(() => context.globals['theme']),
        fullHeight: context.viewMode === 'story'
      }),
      template:
        '<ThemeProvider :theme="theme" :full-height="fullHeight"><Story /></ThemeProvider>'
    })
  ]
}

export default preview
