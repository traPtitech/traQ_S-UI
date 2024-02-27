<template>
  <div :class="$style.container" role="tablist">
    <popup-navigator :class="$style.logo" :title="`traQ ${VERSION}`" />
    <navigation-selector-item
      v-for="item in entries"
      :key="item.type"
      :class="$style.item"
      :is-selected="currentNavigation === item.type"
      :has-notification="item.hasNotification"
      :icon-mdi="item.iconMdi"
      :icon-name="item.iconName"
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
      @click="onEphemeralNavigationItemClick(item.type)"
    />
  </div>
</template>

<script lang="ts" setup>
import NavigationSelectorItem from '/@/components/Main/NavigationBar/NavigationSelectorItem.vue'
import PopupNavigator from '/@/components/Main/PopupNavigatior/PopupNavigator.vue'
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
import { VERSION } from '/@/lib/define'

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
  display: flex;
  flex-direction: column;
  flex: 1 0;
  align-items: center;
  padding: 8px 0;
}
.logo {
  @include color-accent-primary;
  display: flex;
  padding: 8px;
  margin: 8px;
}
.item {
  margin: 8px;
}
.separator {
  @include background-tertiary;
  opacity: 0.5;
  height: 2px;
  width: 24px;
  margin: 12px 0;
}
</style>
