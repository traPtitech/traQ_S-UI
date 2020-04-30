<template>
  <div :class="$style.app" :style="scrollbarStyle" :data-is-mobile="isMobile">
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

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    useWindowResizeObserver()
    const isMobile = computed(() => store.getters.ui.isMobile)

    useThemeObserver()
    useEcoModeObserver()

    const scrollbarStyle = useScrollbarStyle()

    onBeforeMount(async () => {
      await store.dispatch.app.fetchVersionInfo()
    })

    return {
      isMobile,
      scrollbarStyle
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
