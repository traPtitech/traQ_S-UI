<template>
  <section :class="$style.container">
    <navigation-selector-item
      v-for="item in items"
      :key="item.type"
      :icon-name="item.iconName"
      :icon-mdi="item.iconMdi"
      :is-selected="currentNavigation === item.type"
      @click="onNavigationItemClick(item.type)"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { NavigationItemType, useNavigationSelectorItem } from './use/navigation'
import NavigationSelectorItem from '/@/components/Modal/UserModal/NavigationSelectorItem.vue'

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
    const items: {
      type: NavigationItemType
      iconName: string
      iconMdi?: true
    }[] = [
      {
        type: 'profile',
        iconName: 'user'
      },
      {
        type: 'groups',
        iconName: 'group'
      },
      {
        type: 'tags',
        iconName: 'tags',
        iconMdi: true
      }
    ]
    const { onNavigationItemClick } = useNavigationSelectorItem(context)

    return { items, onNavigationItemClick }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  min-height: 0;
  margin-right: 4px;
  padding-top: 8px;
  overflow: {
    x: hidden;
    y: auto;
  }
}
</style>
