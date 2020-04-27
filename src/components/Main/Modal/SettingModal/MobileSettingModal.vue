<template>
  <div :class="$style.container">
    <mobile-tab-selector
      v-show="isSelectorShown"
      @navigation-change="onNavigationChange"
      :current-navigation="currentNavigation"
    />
    <mobile-tab-frame
      v-show="!isSelectorShown"
      :current-navigation="currentNavigation"
      @back="onBack"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  toRefs,
  ref
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { useNavigation, NavigationItemType } from './use/navigation'
import MobileTabSelector from './MobileTabSelector.vue'
import MobileTabFrame from './MobileTabFrame.vue'
import CloseButton from '@/components/UI/CloseButton.vue'

const useStyles = () =>
  reactive({
    content: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: theme.background.secondary,
      borderColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'MobileSettingModal',
  setup() {
    const styles = computed(() => useStyles())

    const isSelectorShown = ref(true)
    const {
      navigationSelectorState,
      onNavigationChange: onNavigationChangeInner
    } = useNavigation()
    const onNavigationChange = (type: NavigationItemType) => {
      onNavigationChangeInner(type)
      isSelectorShown.value = false
    }
    const onBack = () => {
      isSelectorShown.value = true
    }

    return {
      styles,
      ...toRefs(navigationSelectorState),
      isSelectorShown,
      onNavigationChange,
      onBack
    }
  },
  components: {
    MobileTabSelector,
    MobileTabFrame,
    CloseButton
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
