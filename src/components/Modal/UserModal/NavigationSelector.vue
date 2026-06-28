<template>
  <section :class="$style.container">
    <NavigationSelectorItem
      v-for="item in items"
      :key="item.type"
      :icon-name="item.iconName"
      :icon-mdi="item.iconMdi"
      :is-selected="currentNavigation === item.type"
      @click="emit('navigationChange', item.type)"
    />
  </section>
</template>

<script lang="ts" setup>
import NavigationSelectorItem from '/@/components/Modal/UserModal/NavigationSelectorItem.vue'
import type { UserModalNavigationItemType } from '/@/store/ui/modal/states'

withDefaults(
  defineProps<{
    currentNavigation?: UserModalNavigationItemType
  }>(),
  {
    currentNavigation: 'profile' as const
  }
)

const emit = defineEmits<{
  (e: 'navigationChange', _type: UserModalNavigationItemType): void
}>()

const items: {
  type: UserModalNavigationItemType
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
