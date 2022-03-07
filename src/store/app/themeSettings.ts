import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref, toRefs } from 'vue'
import { Theme } from '/@/lib/theme/schema'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/use/indexedDbValue'
import { resolveTheme } from '/@/lib/theme/resolve'

type State = {
  type: ThemeType
  custom: Theme
}

export type ThemeType = 'auto' | 'light' | 'dark' | 'custom'

const lightTheme = window.defaultLightTheme
const darkTheme = window.defaultDarkTheme

const useThemeSettingsPinia = defineStore('ui/themeSettings', () => {
  const initialValue: State = {
    type: 'auto',
    custom: lightTheme
  }

  const [state, loading, loadingPromise] = useIndexedDbValue(
    'app/themeSettings',
    1,
    {
      0: async (db, tx) => {
        // TODO: migrate from vuex
        //
        // const vuexStore = indexedDBStorage.getItem('vuex')
        // if (!vuexStore) return
        // if (!isObjectAndHasKey(vuexStore, 'app')) return
        // if (!isObjectAndHasKey(vuexStore.app, 'themeSettings')) return
        // tx.objectStore('store').add(vuexStore.app.themeSettings, 'key')
      }
    },
    initialValue
  )

  const queryList = window.matchMedia('(prefers-color-scheme: dark)')
  const isOsDarkTheme = ref(queryList.matches)
  // safariではaddEventListener('change', func)が未対応なため
  queryList.addListener((event: MediaQueryListEvent) => {
    isOsDarkTheme.value = event.matches
  })

  const selectTheme = (
    type: ThemeType,
    isOsDarkTheme: boolean,
    customTheme: Theme
  ) => {
    switch (type) {
      case 'auto':
        return isOsDarkTheme ? darkTheme : lightTheme
      case 'light':
        return lightTheme
      case 'dark':
        return darkTheme
      case 'custom':
        return customTheme
      default: {
        const invalid: never = type
        // eslint-disable-next-line no-console
        console.warn(`Invalid theme type: ${invalid}`)

        return lightTheme
      }
    }
  }

  const currentTheme = computed(() => {
    const theme = selectTheme(state.type, isOsDarkTheme.value, state.custom)
    return resolveTheme(theme)
  })

  return { ...toRefs(state), isOsDarkTheme, currentTheme }
})

export const useThemeSettings = convertToRefsStore(useThemeSettingsPinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useThemeSettingsPinia, import.meta.hot)
  )
}
