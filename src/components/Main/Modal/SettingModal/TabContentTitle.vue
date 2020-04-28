<template>
  <h2 :class="$style.container" :style="styles.container">
    {{ title }}
  </h2>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  PropType,
  reactive
} from '@vue/composition-api'
import { NavigationItemType, navigationTypeNameMap } from './use/navigation'
import { makeStyles } from '@/lib/styles'

const useStyles = (props: { isMobile: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      fontSize: props.isMobile ? '1.25rem' : '1.5rem'
    }))
  })

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
    const styles = useStyles(props)

    return { title, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  font-weight: bold;
}
</style>
