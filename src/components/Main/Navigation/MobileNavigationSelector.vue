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
import { defineComponent, SetupContext, PropType, computed, watch } from 'vue'
import {
  NavigationItemType,
  useNavigationSelectorItem,
  useEphemeralNavigationSelectorItem,
  EphemeralNavigationItemType
} from '/@/components/Main/Navigation/use/navigationConstructor'
import useNavigationSelectorEntry from './use/navigationSelectorEntry'
import NavigationSelectorItem from '/@/components/Main/Navigation/NavigationSelectorItem.vue'

export default defineComponent({
  name: 'MobileNavigationSelector',
  components: { NavigationSelectorItem },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'home' as const
    },
    currentEphemeralNavigation: String as PropType<EphemeralNavigationItemType>
  },
  setup(props, context: SetupContext) {
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
