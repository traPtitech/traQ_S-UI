<template>
  <div :class="$style.container">
    <navigation-selector-item
      v-for="item in entries"
      :key="item.type"
      :class="$style.item"
      :is-selected="currentNavigation === item.type"
      :has-notification="item.hasNotification"
      :icon-mdi="item.iconMdi"
      :icon-name="item.iconName"
      :title="item.entryName"
      @click="onNavigationItemClick(item.type)"
    />
    <div v-if="showSeparator" :class="$style.separator" />
    <navigation-selector-item
      v-for="item in ephemeralEntries"
      :key="item.type"
      :class="$style.item"
      :is-selected="currentEphemeralNavigation === item.type"
      :icon-mdi="item.iconMdi"
      :icon-name="item.iconName"
      :color-claim="item.colorClaim"
      :title="item.itemName"
      @click="onEphemeralNavigationItemClick(item.type)"
    />
  </div>
</template>

<script lang="ts" setup>
import NavigationSelectorItem from '/@/components/Main/NavigationBar/NavigationSelectorItem.vue'
import { computed, watch } from 'vue'
import type {
  NavigationItemType,
  EphemeralNavigationItemType
} from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'
import {
  useNavigationSelectorItem,
  useEphemeralNavigationSelectorItem
} from '/@/components/Main/NavigationBar/composables/useNavigationConstructor'
import type { EphemeralNavigationSelectorEntry } from './composables/useNavigationSelectorEntry'
import useNavigationSelectorEntry from './composables/useNavigationSelectorEntry'

withDefaults(
  defineProps<{
    currentNavigation?: NavigationItemType
    currentEphemeralNavigation?: EphemeralNavigationItemType
  }>(),
  {
    currentNavigation: 'home' as const
  }
)

const emit = defineEmits<{
  (e: 'navigationChange', _type: NavigationItemType): void
  (e: 'ephemeralNavigationChange', _type: EphemeralNavigationItemType): void
  (e: 'ephemeralEntryRemove', _entry: EphemeralNavigationSelectorEntry): void
  (e: 'ephemeralEntryAdd', _entry: EphemeralNavigationSelectorEntry): void
}>()

const { onNavigationItemClick } = useNavigationSelectorItem(emit)
const { onNavigationItemClick: onEphemeralNavigationItemClick } =
  useEphemeralNavigationSelectorItem(emit)
const { entries, ephemeralEntries } = useNavigationSelectorEntry()
const showSeparator = computed(() => ephemeralEntries.value.length > 0)

watch(ephemeralEntries, (entries, prevEntries) => {
  prevEntries
    ?.filter(e => !entries.includes(e))
    .forEach(e => {
      emit('ephemeralEntryRemove', e)
    })
  entries
    ?.filter(e => !prevEntries?.includes(e))
    .forEach(e => {
      emit('ephemeralEntryAdd', e)
    })
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-secondary;
  display: flex;
  justify-content: space-around;
  width: 100%;
}
.item {
  margin: 16px 0;
}
.separator {
  @include background-tertiary;
}
</style>
