<template>
  <div :class="$style.app" :style="style" :data-is-mobile="isMobile">
    <router-view />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  watchEffect
} from '@vue/composition-api'
import store from './store'
import { throttle } from 'throttle-debounce'
import { makeStyles } from '@/lib/styles'
import { transparentize, isDarkColor } from '@/lib/util/color'
import { Properties } from 'csstype'
import useHtmlDatasetBoolean from './use/htmlDatasetBoolean'

const useWindowResizeObserver = () => {
  const resizeHandler = () => {
    store.commit.ui.setViewportWidth(window.innerWidth)
  }
  window.addEventListener('resize', throttle(100, resizeHandler))
  resizeHandler()
}

const useQallConfirmer = () => {
  window.addEventListener('beforeunload', event => {
    if (store.state.app.rtc.mixer) {
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
  makeStyles(
    theme =>
      ({
        '--scrollbar-color': transparentize(theme.ui.secondary, 0.5),
        '--scrollbar-hover-color': transparentize(theme.ui.secondary, 0.8)
      } as Properties)
  )

const useThemeVariables = () =>
  makeStyles((theme, common) => ({
    '--theme-accent-primary': theme.accent.primary,
    '--theme-accent-notification': theme.accent.notification,
    '--theme-accent-online': theme.accent.online,
    '--theme-accent-error': theme.accent.error,
    '--theme-accent-focus': theme.accent.focus,
    '--theme-background-primary': theme.background.primary,
    '--theme-background-secondary': theme.background.secondary,
    '--theme-background-tertiary': theme.background.tertiary,
    '--theme-background-secondarySub': theme.background.secondarySub,
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
  makeStyles((theme, common) => ({
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

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    useWindowResizeObserver()
    const isMobile = computed(() => store.getters.ui.isMobile)

    useQallConfirmer()

    useThemeObserver()
    useEcoModeObserver()
    useOsDarkTheme()

    const style = useStyle()

    onBeforeMount(async () => {
      await store.dispatch.app.fetchVersionInfo()
    })

    return {
      isMobile,
      style
    }
  }
})
</script>

<style lang="scss">
@import 'src/styles/global.scss';
</style>

<style lang="scss" module>
.app {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
</style>
