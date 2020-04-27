<template>
  <section :class="$style.container" :style="styles.container">
    <h2 :class="$style.header">設定</h2>
    <desktop-tab-selector-item
      v-for="navigation in navigations"
      :key="navigation.type"
      :type="navigation.type"
      :icon-name="navigation.iconName"
      :icon-mdi="navigation.iconMdi"
      :is-selected="currentNavigation === navigation.type"
      @click.native="onNavigationItemClick(navigation.type)"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import {
  NavigationItemType,
  useNavigationSelectorItem,
  navigations
} from './use/navigation'
import DesktopTabSelectorItem from './DesktopTabSelectorItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'DesktopTabSelector',
  components: { DesktopTabSelectorItem },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const { onNavigationItemClick } = useNavigationSelectorItem(context)
    return {
      styles,
      props,
      navigations,
      onNavigationItemClick
    }
  }
})
</script>

<style lang="scss" module>
.header {
  margin: 40px 80px;
}
</style>
