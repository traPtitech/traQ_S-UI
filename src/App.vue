<template>
  <div :class="$style.app" :style="scrollbarStyle" :data-is-mobile="isMobile">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect } from '@vue/composition-api'
import store from './store'
import { throttle } from 'lodash-es'
import { makeStyles } from '@/lib/styles'
import { Properties } from 'csstype'

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
}

const useEcoModeObserver = () => {
  const ecoMode = computed(() => store.state.app.browserSettings.ecoMode)

  const $html = document.documentElement
  if (ecoMode.value) {
    $html.dataset.ecoMode = ''
  }

  watchEffect(() => {
    const isEcoModeAttrOn = $html.dataset.ecoMode === ''
    if (isEcoModeAttrOn !== ecoMode.value) {
      if (ecoMode.value) {
        $html.dataset.ecoMode = ''
      } else {
        delete $html.dataset.ecoMode
      }
    }
  })
}

const useScrollbarStyle = () =>
  makeStyles(
    theme =>
      ({
        '--scrollbar-color': theme.ui.secondary,
        '--scrollbar-hover-color': theme.ui.primary
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
