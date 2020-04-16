<template>
  <div :class="$style.container">
    <div
      v-for="item in items"
      :key="item.type"
      :class="$style.item"
      @click="onNavigationItemClick(item.type)"
    >
      <navigation-selector-item
        :is-selected="currentNavigation === item.type"
        :icon-mdi="item.iconMdi"
        :icon-name="item.iconName"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  toRefs,
  reactive,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import {
  NavigationItemType,
  useNavigationSelectorItem
} from '@/components/Main/Navigation/use/navigation'
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
    const items: {
      type: NavigationItemType
      iconName: string
      iconMdi?: true
    }[] = [
      {
        type: 'home',
        iconName: 'home',
        iconMdi: true
      },
      {
        type: 'channels',
        iconName: 'hash'
      },
      {
        type: 'activity',
        iconName: 'activity'
      },
      {
        type: 'users',
        iconName: 'user'
      },
      {
        type: 'services',
        iconName: 'services'
      }
    ]
    const { onNavigationItemClick } = useNavigationSelectorItem(context)

    return {
      items,
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
