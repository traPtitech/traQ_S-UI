<template>
  <div :class="$style.container">
    <popup-navigator :class="$style.logo" :title="`traQ ${version}`" />
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

<script lang="ts">
import { defineComponent, PropType, computed, watch } from 'vue'
import {
  NavigationItemType,
  useNavigationSelectorItem,
  useEphemeralNavigationSelectorItem,
  EphemeralNavigationItemType
} from '@/components/Main/Navigation/use/navigationConstructor'
import useNavigationSelectorEntry from './use/navigationSelectorEntry'
import NavigationSelectorItem from '@/components/Main/Navigation/NavigationSelectorItem.vue'
import version from '@/lib/env/version'
import PopupNavigator from '@/components/Main/PopupNavigatior/PopupNavigator.vue'

export default defineComponent({
  name: 'NavigationSelector',
  components: {
    PopupNavigator,
    NavigationSelectorItem
  },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'home' as const
    },
    currentEphemeralNavigation: String as PropType<EphemeralNavigationItemType>
  },
  setup(props, context) {
    const { onNavigationItemClick } = useNavigationSelectorItem(context)
    const { onNavigationItemClick: onEphemeralNavigationItemClick } =
      useEphemeralNavigationSelectorItem(context)
    const { entries, ephemeralEntries } = useNavigationSelectorEntry()
    const showSeparator = computed(() => ephemeralEntries.value.length > 0)

    watch(ephemeralEntries, (entries, prevEntries) => {
      ;(prevEntries ?? [])
        .filter(e => !entries.includes(e))
        .forEach(e => {
          context.emit('ephemeralEntryRemove', e)
        })
      ;(entries ?? [])
        .filter(e => !prevEntries?.includes(e))
        .forEach(e => {
          context.emit('ephemeralEntryAdd', e)
        })
    })

    return {
      version,
      entries,
      ephemeralEntries,
      showSeparator,
      onNavigationItemClick,
      onEphemeralNavigationItemClick
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
