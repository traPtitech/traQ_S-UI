<template>
  <div :class="$style.container">
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

<script lang="ts">
import { defineComponent, PropType, computed, watch } from 'vue'
import {
  NavigationItemType,
  useNavigationSelectorItem,
  useEphemeralNavigationSelectorItem,
  EphemeralNavigationItemType
} from '/@/components/Main/Navigation/use/navigationConstructor'
import useNavigationSelectorEntry, {
  EphemeralNavigationSelectorEntry
} from './use/navigationSelectorEntry'
import NavigationSelectorItem from '/@/components/Main/Navigation/NavigationSelectorItem.vue'
import { VERSION } from '/@/lib/define'
import PopupNavigator from '/@/components/Main/PopupNavigatior/PopupNavigator.vue'

export default defineComponent({
  name: 'DesktopNavigationSelector',
  components: {
    PopupNavigator,
    NavigationSelectorItem
  },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'home' as const
    },
    currentEphemeralNavigation: {
      type: String as PropType<EphemeralNavigationItemType>,
      default: undefined
    }
  },
  emits: {
    navigationChange: (_type: NavigationItemType) => true,
    ephemeralNavigationChange: (_type: EphemeralNavigationItemType) => true,
    ephemeralEntryRemove: (_entry: EphemeralNavigationSelectorEntry) => true,
    ephemeralEntryAdd: (_entry: EphemeralNavigationSelectorEntry) => true
  },
  setup(props, { emit }) {
    const { onNavigationItemClick } = useNavigationSelectorItem(emit)
    const { onNavigationItemClick: onEphemeralNavigationItemClick } =
      useEphemeralNavigationSelectorItem(emit)
    const { entries, ephemeralEntries } = useNavigationSelectorEntry()
    const showSeparator = computed(() => ephemeralEntries.value.length > 0)

    watch(ephemeralEntries, (entries, prevEntries) => {
      ;(prevEntries ?? [])
        .filter(e => !entries.includes(e))
        .forEach(e => {
          emit('ephemeralEntryRemove', e)
        })
      ;(entries ?? [])
        .filter(e => !prevEntries?.includes(e))
        .forEach(e => {
          emit('ephemeralEntryAdd', e)
        })
    })

    return {
      VERSION,
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
