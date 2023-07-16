<template>
  <section :class="$style.container">
    <navigation-selector-item
      v-for="item in items"
      :key="item.type"
      :icon-name="item.iconName"
      :icon-mdi="item.iconMdi"
      :title="item.itemName"
      :is-selected="currentNavigation === item.type"
      @click="onNavigationItemClick(item.type)"
    />
  </section>
</template>

<script lang="ts" setup>
import NavigationSelectorItem from '/@/components/Modal/UserModal/NavigationSelectorItem.vue'
import type { NavigationItemType } from './composables/useNavigation'
import { useNavigationSelectorItem } from './composables/useNavigation'

withDefaults(
  defineProps<{
    currentNavigation?: NavigationItemType
  }>(),
  {
    currentNavigation: 'profile' as const
  }
)

const emit = defineEmits<{
  (e: 'navigationChange', _type: NavigationItemType): void
}>()

const items: {
  type: NavigationItemType
  itemName: string
  iconName: string
  iconMdi?: true
}[] = [
  {
    type: 'profile',
    itemName: 'プロフィール',
    iconName: 'user'
  },
  {
    type: 'groups',

    itemName: 'グループ',
    iconName: 'group'
  },
  {
    type: 'tags',
    itemName: 'タグ',
    iconName: 'tags',
    iconMdi: true
  }
]
const { onNavigationItemClick } = useNavigationSelectorItem(emit)
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
  scrollbar-gutter: stable;
}
</style>
