<template>
  <section :class="$style.container">
    <div>
      <div :class="$style.header">
        <h2 :class="$style.title">設定</h2>
        <close-button :class="$style.close" @close="close" :size="36" />
      </div>
      <mobile-tab-selector-item
        v-for="navigation in navigations"
        :key="navigation.type"
        :type="navigation.type"
        :icon-name="navigation.iconName"
        :icon-mdi="navigation.iconMdi"
        @click.native="onNavigationItemClick(navigation.type)"
      />
      <safari-warning :class="$style.safariWarning" />
    </div>
    <version :class="$style.version" />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import store from '@/store'
import {
  NavigationItemType,
  useNavigationSelectorItem,
  navigations
} from './use/navigation'
import MobileTabSelectorItem from './MobileTabSelectorItem.vue'
import SafariWarning from './SafariWarning.vue'
import CloseButton from '@/components/UI/CloseButton.vue'
import Version from '@/components/UI/Version.vue'

export default defineComponent({
  name: 'MobileTabSelector',
  components: { MobileTabSelectorItem, SafariWarning, CloseButton, Version },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    }
  },
  setup(props, context) {
    const { onNavigationItemClick } = useNavigationSelectorItem(context)
    const close = () => store.dispatch.ui.modal.clearModal()
    return {
      navigations,
      onNavigationItemClick,
      close
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-secondary;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header {
  display: flex;
  padding: 20px;
  align-items: center;
}
.title {
  @include size-h2;
  padding-left: 40px;
  flex: 1 0;
}

.safariWarning {
  margin: 40px 20px;
}
.version {
  margin-bottom: 16px;
}
</style>
