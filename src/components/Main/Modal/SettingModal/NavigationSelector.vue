<template>
  <section :class="$style.container" :style="styles.container">
    <h2 :class="$style.header">設定</h2>
    <navigation-selector-item
      v-for="item in items"
      :key="item.type"
      :type="item.type"
      :icon-name="item.iconName"
      :icon-mdi="item.iconMdi"
      :is-selected="currentNavigation === item.type"
      @click="onNavigationItemClick(item.type)"
    />
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  reactive,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { NavigationItemType, useNavigationSelectorItem } from './use/navigation'
import NavigationSelectorItem from './NavigationSelectorItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'NavigationSelector',
  components: { NavigationSelectorItem },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const items: {
      type: NavigationItemType
      iconName: string
      iconMdi?: true
    }[] = [
      {
        type: 'profile',
        iconName: 'account', //'user'
        iconMdi: true
      },
      {
        type: 'browser',
        iconName: 'cogs',
        iconMdi: true
      },
      {
        type: 'qall',
        iconName: 'phone',
        iconMdi: true
      },
      {
        type: 'stamp',
        iconName: 'emoticon-outline',
        iconMdi: true
      },
      {
        type: 'theme',
        iconName: 'brightness-6',
        iconMdi: true
      }
    ]
    const { onNavigationItemClick } = useNavigationSelectorItem(context)
    return {
      styles,
      props,
      items,
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
