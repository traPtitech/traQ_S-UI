<template>
  <h2 :class="$style.container">
    {{ title }}
  </h2>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import {
  NavigationItemType,
  navigationTypeNameMap
} from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'

export default defineComponent({
  name: 'NavigationContentTitle',
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'home' as const
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
  @include size-h2;
  font-weight: bold;
}
</style>
