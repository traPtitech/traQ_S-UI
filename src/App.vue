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
import { throttle } from 'lodash-es'
import { makeStyles } from '@/lib/styles'
import { transparentize, isDarkColor } from '@/lib/util/color'
import { Properties } from 'csstype'
import useHtmlDatasetBoolean from './use/htmlDatasetBoolean'

const useWindowResizeObserver = () => {
  const resizeHandler = () => {
    store.commit.ui.setViewportWidth(window.innerWidth)
  }
  window.addEventListener('resize', throttle(resizeHandler, 100))
  resizeHandler()
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
      : themeType.value === 'dark'
  )
  useHtmlDatasetBoolean('isDarkTheme', isDark)
}

const useEcoModeObserver = () => {
  const ecoMode = computed(() => store.state.app.browserSettings.ecoMode)
  useHtmlDatasetBoolean('ecoMode', ecoMode)
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
    '--common-drop-shadow-default': common.dropShadow.default
  }))

const useStyle = () =>
  computed(() => ({
    ...useThemeVariables().value,
    ...useScrollbarStyle().value
  }))

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    useWindowResizeObserver()
    const isMobile = computed(() => store.getters.ui.isMobile)

    useThemeObserver()
    useEcoModeObserver()

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
