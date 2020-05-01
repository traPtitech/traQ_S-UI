<template>
  <section :class="$style.container" :style="styles.container">
    <div>
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
    </div>
    <version :class="$style.version" />
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
import Version from '@/components/UI/Version.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'DesktopTabSelector',
  components: { DesktopTabSelectorItem, Version },
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
      navigations,
      onNavigationItemClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.header {
  margin: 40px 80px;
}
.version {
  margin-bottom: 16px;
  user-select: none;
}
</style>
