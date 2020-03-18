<template>
  <div :class="$style.container">
    <div
      v-for="item in items"
      :key="item.type"
      :class="$style.item"
      @click="onNavigationItemClick(item.type)"
    >
      <navigation-selector-item
        :is-selected="props.currentNavigation === item.type"
        :icon-mdi="item.iconMdi"
        :icon-name="item.iconName"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, toRefs } from '@vue/composition-api'
import { NavigationItemType } from '@/use/navigationSelector'
import useNavigationSelectorItem from '@/use/navigationSelectorItem'
import NavigationSelectorItem from '@/components/Main/Navigation/NavigationSelectorItem.vue'

type Props = {
  currentNavigation: NavigationItemType
}

export default defineComponent({
  name: 'NavigationSelector',
  components: { NavigationSelectorItem },
  props: {
    currentNavigation: {
      type: String,
      default: 'home' as NavigationItemType
    }
  },
  setup(props: Props, context: SetupContext) {
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
      props,
      items,
      onNavigationItemClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: block;
}
.item {
  margin: 16px 0;
}
</style>
