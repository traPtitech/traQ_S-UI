import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref, toRefs } from 'vue'
import { Theme } from '/@/lib/theme/schema'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'
import { resolveTheme } from '/@/lib/theme/resolve'
import { getVuexData } from '/@/store/utils/migrateFromVuex'
import { hasKey, isObjectAndHasKey } from '/@/lib/basic/object'
import { promisifyRequest } from 'idb-keyval'

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

  const [state] = useIndexedDbValue(
    'store/app/themeSettings',
    1,
    {
      // migrate from vuex and also migrate theme v1 to v2
      1: async getStore => {
        const vuexStore = await getVuexData()
        if (!vuexStore) return
        if (!isObjectAndHasKey(vuexStore, 'app')) return
        if (!isObjectAndHasKey(vuexStore.app, 'themeSettings')) return

        const newValue: State = { ...initialValue }

        if (
          isObjectAndHasKey(vuexStore.app.themeSettings, 'type') &&
          typeof vuexStore.app.themeSettings.type === 'string' &&
          ['auto', 'light', 'dark', 'custom'].includes(
            vuexStore.app.themeSettings.type
          )
        ) {
          newValue.type = vuexStore.app.themeSettings.type as ThemeType
        }

        if (isObjectAndHasKey(vuexStore.app.themeSettings, 'custom')) {
          const shouldbeV1Theme = vuexStore.app.themeSettings.custom
          if (typeof shouldbeV1Theme !== 'object' || shouldbeV1Theme === null) {
            // eslint-disable-next-line no-console
            console.info(
              '[migration(custom theme)] Skipped because it was invalid.'
            )
          } else if (
            hasKey(shouldbeV1Theme, 'version') &&
            shouldbeV1Theme.version === 2
          ) {
            // eslint-disable-next-line no-console
            console.info(
              '[migration(custom theme)] Skipped because it was already v2.'
            )
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const v2Theme: Theme = { version: 2, basic: shouldbeV1Theme as any }
            newValue.custom = v2Theme
          }
        }

        const addReq = getStore().add(newValue, 'key')
        await promisifyRequest(addReq)
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
