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
import { defineComponent, SetupContext, PropType } from '@vue/composition-api'
import store from '@/store'
import {
  NavigationItemType,
  useNavigationSelectorItem
} from '@/components/Main/Navigation/use/navigation'
import useNavigationSelectorEntry from './use/navigationSelectorEntry'
import NavigationSelectorItem from '@/components/Main/Navigation/NavigationSelectorItem.vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'NavigationSelector',
  components: { NavigationSelectorItem, Icon },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'home' as const
    }
  },
  setup(props, context: SetupContext) {
    const { onNavigationItemClick } = useNavigationSelectorItem(context)
    const { entries } = useNavigationSelectorEntry()

    // TODO: 下部アイテムに移動
    const onSettingClick = () =>
      store.dispatch.ui.modal.pushModal({ type: 'setting' })

    const onQrCodeClick = () =>
      store.dispatch.ui.modal.pushModal({ type: 'qrcode' })

    return {
      entries,
      onNavigationItemClick,
      onSettingClick,
      onQrCodeClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: block;
}
.item {
  margin: 16px 0;
}
</style>
