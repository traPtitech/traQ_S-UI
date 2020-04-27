<template>
  <div :class="$style.container">
    <desktop-tab-selector
      @navigation-change="onNavigationChange"
      :current-navigation="currentNavigation"
    />
    <desktop-tab-frame :current-navigation="currentNavigation" />
    <div :class="$style.close">
      <close-button with-text @click="close" :size="56" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  toRefs
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { useNavigation } from './use/navigation'
import DesktopTabSelector from './DesktopTabSelector.vue'
import DesktopTabFrame from './DesktopTabFrame.vue'
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
  name: 'DesktopSettingModal',
  setup() {
    const styles = computed(() => useStyles())

    const { navigationSelectorState, onNavigationChange } = useNavigation()

    const close = () => store.dispatch.ui.modal.clearModal()

    return {
      styles,
      ...toRefs(navigationSelectorState),
      onNavigationChange,
      close
    }
  },
  components: {
    DesktopTabSelector,
    DesktopTabFrame,
    CloseButton
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  display: flex;
  flex-flow: row;
  width: 100%;
  height: 100%;
}

.close {
  position: absolute;
  top: 30px;
  right: 120px;
}
</style>
