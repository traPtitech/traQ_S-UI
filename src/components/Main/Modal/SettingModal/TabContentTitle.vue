<template>
  <h2 :class="$style.container" :data-is-mobile="isMobile">
    {{ title }}
  </h2>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import { NavigationItemType, navigationTypeNameMap } from './use/navigation'

export default defineComponent({
  name: 'TabContentTitle',
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const title = computed(() => navigationTypeNameMap[props.currentNavigation])
    return { title }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include h1-size;
  font-weight: bold;
  &[data-is-mobile] {
    @include h2-size;
  }
}
</style>
