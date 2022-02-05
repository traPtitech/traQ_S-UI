<template>
  <div :class="$style.app" :data-is-mobile="$boolAttr(isMobile)">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <modal-container />
    <toast-container />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, watchEffect, Ref } from 'vue'
import store from '/@/store'
import { makeCSSVariables } from '/@/lib/styles'
import { transparentize, isDarkColor } from '/@/lib/basic/color'
import useHtmlDatasetBoolean from './use/htmlDatasetBoolean'
import { mobileMinBreakpoint } from '/@/lib/media'
import ToastContainer from '/@/components/Toast/ToastContainer.vue'
import { provideToastStore } from '/@/providers/toastStore'
import { provideStampPickerStore } from '/@/providers/stampPicker'
import { provideMessageInputState } from '/@/providers/messageInputState'
import { provideCommandPaletteStore } from '/@/providers/commandPalette'
import ModalContainer from '/@/components/Modal/ModalContainer.vue'

const useWindowResizeObserver = () => {
  const queryList = window.matchMedia(`(max-width: ${mobileMinBreakpoint}px)`)

  store.commit.ui.setIsMobile(queryList.matches)

  // safariではaddEventListener('change', func)が未対応なため
  queryList.addListener((event: MediaQueryListEvent) => {
    store.commit.ui.setIsMobile(event.matches)
  })
}

const useQallConfirmer = () => {
  window.addEventListener('beforeunload', event => {
    if (store.getters.app.rtc.isCurrentDevice) {
      const unloadMessage = 'Qall中ですが本当に終了しますか？'
      event.preventDefault()
      event.returnValue = unloadMessage
      return unloadMessage
    }
  })
}

const useThemeObserver = () => {
  const themeColor = computed(
    () => store.getters.app.themeSettings.currentTheme.accent.primary
  )

  const $themeColor = document.querySelector(
    'meta[name="theme-color"]'
  ) as HTMLMetaElement
  $themeColor.content = themeColor.value

  watchEffect(() => {
    if ($themeColor.content !== themeColor.value) {
      $themeColor.content = themeColor.value
    }
  })

  const themeType = computed(() => store.state.app.themeSettings.type)
  const isDark = computed(() =>
    themeType.value === 'custom'
      ? isDarkColor(store.state.app.themeSettings.custom.background.primary)
      : themeType.value === 'dark' ||
        (themeType.value === 'auto' &&
          store.state.app.themeSettings.isOsDarkTheme)
  )
  useHtmlDatasetBoolean('isDarkTheme', isDark)
}

const useEcoModeObserver = () => {
  const ecoMode = computed(() => store.state.app.browserSettings.ecoMode)
  useHtmlDatasetBoolean('ecoMode', ecoMode)
}

const useOsDarkTheme = () => {
  const queryList = window.matchMedia('(prefers-color-scheme: dark)')

  store.commit.app.themeSettings.setIsOsDarkTheme(queryList.matches)

  // safariではaddEventListener('change', func)が未対応なため
  queryList.addListener((event: MediaQueryListEvent) => {
    store.commit.app.themeSettings.setIsOsDarkTheme(event.matches)
  })
}

const useScrollbarStyle = () =>
  makeCSSVariables(theme => ({
    '--scrollbar-color': transparentize(theme.ui.secondary, 0.5),
    '--scrollbar-hover-color': transparentize(theme.ui.secondary, 0.8)
  }))

const useThemeVariables = () =>
  makeCSSVariables((theme, common) => ({
    '--theme-accent-primary-default': theme.accent.primary.default,
    '--theme-accent-primary-background': theme.accent.primary.background,
    '--theme-accent-notification-default': theme.accent.notification.default,
    '--theme-accent-notification-background':
      theme.accent.notification.background,
    '--theme-accent-online-default': theme.accent.online.default,
    '--theme-accent-error-default': theme.accent.error.default,
    '--theme-accent-focus-default': theme.accent.focus.default,

    '--theme-background-primary': theme.background.primary,
    '--theme-background-secondary': theme.background.secondary,
    '--theme-background-tertiary': theme.background.tertiary,
    '--theme-ui-primary': theme.ui.primary,
    '--theme-ui-secondary': theme.ui.secondary,
    '--theme-ui-tertiary': theme.ui.tertiary,
    '--theme-text-primary': theme.text.primary,
    '--theme-text-secondary': theme.text.secondary,
    '--common-text-white-primary': common.text.whitePrimary,
    '--common-text-white-secondary': common.text.whiteSecondary,
    '--common-text-black': common.text.black,
    '--common-ui-qall': common.ui.qall,
    '--common-ui-muted': common.ui.muted,
    '--common-ui-pin': common.ui.pin,
    '--common-background-overlay': common.background.overlay,
    '--common-background-black': common.background.black,
    '--common-background-pin': common.background.pin,
    '--common-drop-shadow-default': common.dropShadow.default
  }))
const useTransparrentThemeVariables = () =>
  makeCSSVariables((theme, common) => ({
    '--theme-accent-primary--03': transparentize(theme.accent.primary, 0.3),
    '--theme-ui-primary--06': transparentize(theme.ui.primary, 0.6),
    '--theme-ui-secondary--05': transparentize(theme.ui.secondary, 0.5),
    '--theme-background-secondary--05': transparentize(
      theme.background.secondary,
      0.5
    )
  }))

const useStyle = () =>
  computed(() => ({
    ...useThemeVariables().value,
    ...useTransparrentThemeVariables().value,
    ...useScrollbarStyle().value
  }))

const useStyleBody = (style: Ref<Record<string, string>>) => {
  const styleText = computed(() =>
    Object.entries(style.value)
      .map(([key, value]) => `${key}:${value}`)
      .join(';')
  )

  watchEffect(() => {
    document.body.style.cssText = styleText.value
  })
}

export default defineComponent({
  name: 'App',
  components: {
    ModalContainer,
    ToastContainer
  },
  setup() {
    provideToastStore()
    provideStampPickerStore()
    provideMessageInputState()
    provideCommandPaletteStore()

    useWindowResizeObserver()
    const isMobile = computed(() => store.state.ui.isMobile)

    useQallConfirmer()

    useThemeObserver()
    useEcoModeObserver()
    useOsDarkTheme()

    const style = useStyle()
    useStyleBody(style)

    return { isMobile }
  }
})
</script>

<style lang="scss">
@import 'src/styles/global.scss';
</style>

<style lang="scss" module>
.app {
  @include background-secondary;
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
</style>
