<template>
  <h2 :class="$style.container" :style="containerStyle">
    {{ title }}
  </h2>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import {
  NavigationItemType,
  navigationTypeNameMap
} from '@/components/Main/Navigation/use/navigationConstructor'
import { makeStyles } from '@/lib/styles'

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
    const containerStyle = makeStyles(theme => ({
      color: theme.ui.primary
    }))
    return {
      title,
      containerStyle
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include font-size-extra-large;
  font-weight: bold;
}
</style>
