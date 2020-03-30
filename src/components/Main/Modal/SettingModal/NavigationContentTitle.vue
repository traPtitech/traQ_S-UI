<template>
  <h2 :class="$style.container" :style="containerStyle">
    {{ title }}
  </h2>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { NavigationItemType, navigationTypeNameMap } from './use/navigation'
import { makeStyles } from '@/lib/styles'

type Props = {
  currentNavigation: NavigationItemType
}

export default defineComponent({
  name: 'NavigationContentTitle',
  props: {
    currentNavigation: {
      type: String,
      default: 'home' as NavigationItemType
    }
  },
  setup(props: Props) {
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
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
