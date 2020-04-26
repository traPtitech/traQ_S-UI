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
import { defineComponent, SetupContext, PropType } from '@vue/composition-api'
import {
  NavigationItemType,
  useNavigationSelectorItem
} from '@/components/Main/Navigation/use/navigation'
import NavigationSelectorItem from '@/components/Main/Navigation/NavigationSelectorItem.vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'NavigationSelector',
  components: { NavigationSelectorItem, Icon },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'home' as const
    }
  },
  setup(props, context: SetupContext) {
    const items: Array<{
      type: NavigationItemType
      iconName: string
      iconMdi?: true
    }> = [
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
        type: 'clips',
        iconName: 'bookmark',
        iconMdi: true
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
  display: flex;
  flex-direction: column;
  flex: 1 0;
  align-items: center;
  padding: 8px 0;
}
.item {
  margin: 8px 0;
}
</style>
