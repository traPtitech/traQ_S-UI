<template>
  <div :class="$style.app" :data-is-mobile="isMobile">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect } from '@vue/composition-api'
import store from './store'
import { throttle } from 'lodash-es'

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

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    useWindowResizeObserver()
    const isMobile = computed(() => store.getters.ui.isMobile)

    useThemeObserver()

    return {
      isMobile
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
