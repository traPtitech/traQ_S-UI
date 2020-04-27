<template>
  <section :class="$style.container" :style="styles.container">
    <h2 :class="$style.header">設定</h2>
    <div :class="$style.close">
      <close-button @click="close" :size="56" />
    </div>
    <mobile-tab-selector-item
      v-for="navigation in navigations"
      :key="navigation.type"
      :type="navigation.type"
      :icon-name="navigation.iconName"
      :icon-mdi="navigation.iconMdi"
      @click.native="onNavigationItemClick(navigation.type)"
    />
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
  components: { MobileTabSelectorItem, CloseButton },
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
      props,
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
  margin: 40px 80px;
}
</style>
