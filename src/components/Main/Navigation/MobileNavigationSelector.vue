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
  reactive,
  PropType,
  computed,
  watch
} from '@vue/composition-api'
import {
  NavigationItemType,
  useNavigationSelectorItem,
  useEphemeralNavigationSelectorItem,
  EphemeralNavigationItemType
} from '@/components/Main/Navigation/use/navigationConstructor'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'
import useNavigationSelectorEntry from './use/navigationSelectorEntry'
import NavigationSelectorItem from '@/components/Main/Navigation/NavigationSelectorItem.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.secondary,
      color: theme.ui.primary
    })),
    separator: makeStyles(theme => ({
      background: theme.ui.tertiary
    }))
  })

export default defineComponent({
  name: 'MobileNavigationSelector',
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

    watch(ephemeralEntries, (entries, prevEntries) => {
      ;(prevEntries ?? [])
        .filter(e => !entries.includes(e))
        .forEach(e => {
          context.emit('ephemeral-entry-remove', e)
        })
      ;(entries ?? [])
        .filter(e => !prevEntries?.includes(e))
        .forEach(e => {
          context.emit('ephemeral-entry-add', e)
        })
    })

    const styles = useStyles()

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
  justify-content: space-around;
  width: 100%;
}
.item {
  margin: 16px 0;
}
</style>
