<template>
  <h2 :class="$style.container" :data-is-mobile="$boolAttr(isMobile)">
    {{ title }}
  </h2>
</template>

<script lang="ts">
import { isSettingsRouteName, SettingsRouteName } from '/@/router/settings'
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigationRouteNameTitleMap } from './composables/useNavigation'

const useSettingsTitle = () => {
  const route = useRoute()
  const name = computed<SettingsRouteName | undefined>(() => {
    const name = typeof route.name === 'string' ? route.name : ''
    return isSettingsRouteName(name) ? name : undefined
  })
  const title = computed(() =>
    name.value ? navigationRouteNameTitleMap[name.value] ?? '' : ''
  )
  return { title }
}

export default defineComponent({
  name: 'TabContentTitle',
  props: {
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { title } = useSettingsTitle()
    return { title }
  }
})
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
