<template>
  <section :class="$style.container">
    <button
      v-for="item in items"
      :key="item.type"
      :class="$style.item"
      @click="onNavigationItemClick(item.type)"
    >
      <icon
        :name="item.iconName"
        :mdi="item.iconMdi"
        :width="24"
        :height="24"
      />
    </button>
  </section>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
import { NavigationItemType, useNavigationSelectorItem } from './use/navigation'
import Icon from '@/components/UI/Icon.vue'

type Props = {
  currentNavigation: NavigationItemType
}

export default defineComponent({
  name: 'NavigationSelector',
  components: { Icon },
  props: {
    currentNavigation: {
      type: String,
      default: 'profile' as NavigationItemType
    }
  },
  setup(props: Props, context: SetupContext) {
    const items: {
      type: NavigationItemType
      iconName: string
      iconMdi?: boolean
    }[] = [
      {
        type: 'profile',
        iconName: 'user'
      },
      {
        type: 'groups',
        iconName: 'user'
      },
      {
        type: 'tags',
        iconName: 'tags',
        iconMdi: true
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
}
</style>
