<template>
  <div :class="$style.container">
    <navigation-selector-item
      v-for="item in entries"
      :key="item.type"
      :class="$style.item"
      @click.native="onNavigationItemClick(item.type)"
      :is-selected="currentNavigation === item.type"
      :icon-mdi="item.iconMdi"
      :icon-name="item.iconName"
    />
    <div
      v-if="showSeparator"
      :class="$style.separator"
      :style="styles.separator"
    ></div>
    <navigation-selector-item
      v-for="item in ephemeralEntries"
      :key="item.type"
      :class="$style.item"
      @click.native="onEphemeralNavigationItemClick(item.type)"
      :is-selected="currentEphemeralNavigation === item.type"
      :icon-mdi="item.iconMdi"
      :icon-name="item.iconName"
      :color-claim="item.colorClaim"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  PropType,
  computed,
  reactive,
  watch
} from '@vue/composition-api'

import {
  NavigationItemType,
  useNavigationSelectorItem,
  useEphemeralNavigationSelectorItem,
  EphemeralNavigationItemType
} from '@/components/Main/Navigation/use/navigation'
import useNavigationSelectorEntry from './use/navigationSelectorEntry'
import NavigationSelectorItem from '@/components/Main/Navigation/NavigationSelectorItem.vue'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    separator: makeStyles(theme => ({
      background: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'NavigationSelector',
  components: { NavigationSelectorItem, Icon },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'home' as const
    },
    currentEphemeralNavigation: String as PropType<EphemeralNavigationItemType>
  },
  setup(props, context: SetupContext) {
    const { onNavigationItemClick } = useNavigationSelectorItem(context)
    const {
      onNavigationItemClick: onEphemeralNavigationItemClick
    } = useEphemeralNavigationSelectorItem(context)
    const { entries, ephemeralEntries } = useNavigationSelectorEntry()
    const showSeparator = computed(() => ephemeralEntries.value.length > 0)

    const styles = useStyles()

    watch(ephemeralEntries, (entries, prevEntries) => {
      ;(prevEntries ?? [])
        .filter(e => !entries.includes(e))
        .forEach(e => {
          context.emit('ephemeral-entry-remove', e)
        })
    })

    return {
      styles,
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
.item {
  margin: 8px 0;
}
.separator {
  opacity: 0.3;
  height: 2px;
  width: 16px;
}
</style>
