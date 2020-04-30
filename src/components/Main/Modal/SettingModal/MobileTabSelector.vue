<template>
  <section :class="$style.container" :style="styles.container">
    <div :class="$style.header">
      <h2 :class="$style.title">設定</h2>
      <close-button :class="$style.close" @click="close" :size="36" />
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
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import {
  NavigationItemType,
  useNavigationSelectorItem,
  navigations
} from './use/navigation'
import MobileTabSelectorItem from './MobileTabSelectorItem.vue'
import SafariWarning from './SafariWarning.vue'
import CloseButton from '@/components/UI/CloseButton.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'MobileTabSelector',
  components: { MobileTabSelectorItem, SafariWarning, CloseButton },
  props: {
    currentNavigation: {
      type: String as PropType<NavigationItemType>,
      default: 'profile' as const
    }
  },
  setup(props, context) {
    const styles = useStyles()
    const { onNavigationItemClick } = useNavigationSelectorItem(context)
    const close = () => store.dispatch.ui.modal.clearModal()
    return {
      styles,
      navigations,
      onNavigationItemClick,
      close
    }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}

.header {
  display: flex;
  padding: 20px;
  align-items: center;
}
.title {
  padding-left: 40px;
  flex: 1 0;
  font-size: 1.25rem;
}

.safariWarning {
  margin: 40px 20px;
}
</style>
