<template>
  <div :class="$style.container">
    <navigation-selector-item
      v-for="item in items"
      :key="item.type"
      :class="$style.item"
      @click.native="onNavigationItemClick(item.type)"
      :is-selected="currentNavigation === item.type"
      :icon-mdi="item.iconMdi"
      :icon-name="item.iconName"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  reactive,
  PropType
} from '@vue/composition-api'
import { NavigationItemType, useNavigationSelectorItem } from './use/navigation'
import { items, ephemeralItems } from './use/navigationSelectorEntry'
import NavigationSelectorItem from '@/components/Main/Navigation/NavigationSelectorItem.vue'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'MobileNavigationSelector',
  components: { NavigationSelectorItem, Icon },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'home' as const
    }
  },
  setup(props, context: SetupContext) {
    const { onNavigationItemClick } = useNavigationSelectorItem(context)

    return {
      items,
      ephemeralItems,
      onNavigationItemClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: block;
  display: flex;
}
.item {
  margin: 16px 0;
}
</style>
