import store from '@/store'
import { Theme } from '@/types/theme'
import { computed } from '@vue/composition-api'
import * as CSS from 'csstype'

type ThemeClaim = (theme: Theme, common: typeof commonColors) => CSS.Properties

export const makeStyles = (claim: ThemeClaim) => {
  return computed(() =>
    claim(store.getters.app.themeSettings.currentTheme, commonColors)
  )
}

/** テーマに依存しない色 */
export const commonColors = {
  text: {
    whitePrimary: '#ffffff' as const,
    whiteSecondary: 'rgba(255, 255, 255, 0.5)' as const
  },
  background: {
    overlay: 'rgba(25, 26, 29, 0.5)' as const
  }
}
