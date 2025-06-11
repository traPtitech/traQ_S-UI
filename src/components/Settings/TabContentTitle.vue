<template>
  <h2 :class="$style.container" :data-is-mobile="$boolAttr(isMobile)">
    {{ title }}
  </h2>
</template>

<script lang="ts">
import type { SettingsRouteName } from '/@/router/settings'
import { isSettingsRouteName } from '/@/router/settings'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigationRouteNameTitleMap } from './composables/useNavigation'
import type { SettingsStampPaletteRouteName } from '/@/router/settingsStampPalette'

const useSettingsTitle = () => {
  const route = useRoute()
  const name = computed<
    SettingsRouteName | SettingsStampPaletteRouteName | undefined
  >(() => {
    const name = typeof route.name === 'string' ? route.name : ''
    return isSettingsRouteName(name) ? name : undefined
  })
  const title = computed(() =>
    name.value ? (navigationRouteNameTitleMap[name.value] ?? '') : ''
  )
  return { title }
}
</script>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    isMobile?: boolean
  }>(),
  {
    isMobile: false
  }
)

const { title } = useSettingsTitle()
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include size-h1;
  font-weight: bold;
  &[data-is-mobile] {
    @include size-h2;
  }
}
</style>
