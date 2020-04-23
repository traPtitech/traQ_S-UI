<template>
  <div :class="$style.container">
    <div
      v-for="item in items"
      :key="item.type"
      :class="$style.item"
      @click="onNavigationItemClick(item.type)"
    >
      <navigation-selector-item
        :is-selected="currentNavigation === item.type"
        :icon-mdi="item.iconMdi"
        :icon-name="item.iconName"
      />
    </div>
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
    const items: {
      type: NavigationItemType
      iconName: string
      iconMdi?: true
    }[] = [
      {
        type: 'home',
        iconName: 'home',
        iconMdi: true
      },
      {
        type: 'channels',
        iconName: 'hash'
      },
      {
        type: 'activity',
        iconName: 'activity'
      },
      {
        type: 'users',
        iconName: 'user'
      },
      {
        type: 'clips',
        iconName: 'bookmark',
        iconMdi: true
      },
      {
        type: 'services',
        iconName: 'services'
      }
    ]
    const { onNavigationItemClick } = useNavigationSelectorItem(context)

    // TODO: 下部アイテムに移動
    const onSettingClick = () =>
      store.dispatch.ui.modal.pushModal({ type: 'setting' })

    const onQrCodeClick = () =>
      store.dispatch.ui.modal.pushModal({ type: 'qrcode' })

    return {
      items,
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
