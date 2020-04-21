import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { themeSettings } from './index'

export const themeSettingsActionContext = (context: any) =>
  moduleActionContext(context, themeSettings)

export const actions = defineActions({
  toggleTheme: context => {
    const { commit, state } = themeSettingsActionContext(context)
    switch (state.type) {
      case 'light':
        commit.setCurrentTheme('dark')
        break
      case 'dark':
        commit.setCurrentTheme('light')
        break
      case 'custom': // ボタンをちゃんと無効化したら外す？
        break
      default:
        const invalid: never = state.type
        // eslint-disable-next-line no-console
        console.warn(`Invalid theme type: ${invalid}`)

        commit.setCurrentTheme('light')
    }
  }
})
