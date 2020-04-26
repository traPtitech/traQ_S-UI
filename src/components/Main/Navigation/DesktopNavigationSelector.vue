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
    <div :class="$style.item" @click="onQrCodeClick">
      <Icon name="qrcode" mdi />
    </div>
    <div :class="$style.item" @click="onSettingClick">
      <Icon name="cog" mdi />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  PropType,
  computed,
  reactive
} from '@vue/composition-api'
import store from '@/store'
import {
  NavigationItemType,
  useNavigationSelectorItem,
  useEphemeralNavigationSelectorItem,
  EphemeralNavigationItemType
} from '@/components/Main/Navigation/use/navigation'
import useNavigationSelectorEntry from './use/navigationSelectorEntry'
import NavigationSelectorItem from '@/components/Main/Navigation/NavigationSelectorItem.vue'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '../../../lib/styles'

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

    // TODO: 下部アイテムに移動
    const onSettingClick = () =>
      store.dispatch.ui.modal.pushModal({ type: 'setting' })

    const onQrCodeClick = () =>
      store.dispatch.ui.modal.pushModal({ type: 'qrcode' })

    return {
      styles,
      entries,
      ephemeralEntries,
      showSeparator,
      onNavigationItemClick,
      onEphemeralNavigationItemClick,
      onSettingClick,
      onQrCodeClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.item {
  margin: 16px 0;
}
.separator {
  opacity: 0.3;
  height: 2px;
  width: 16px;
}
</style>
