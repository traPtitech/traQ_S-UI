<template>
  <div :class="$style.container">
    <navigation-selector
      @navigation-change="onNavigationChange"
      :current-navigation="currentNavigation"
    />
    <navigation-content :current-navigation="currentNavigation" />
    <div :class="$style.close">
      <close-button with-text @click="onClickClear" :size="56" />
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
import { UserId } from '@/types/entity-ids'
import { useNavigation } from './use/navigation'
import NavigationSelector from './NavigationSelector.vue'
import NavigationContent from './NavigationContent.vue'
import CloseButton from './CloseButton.vue'

const useStyles = () =>
  reactive({
    content: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: theme.background.secondary,
      borderColor: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'SettingModal',
  setup() {
    const styles = computed(() => useStyles())

    const { navigationSelectorState, onNavigationChange } = useNavigation()

    const onClickClear = () => store.dispatch.ui.modal.clearModal()

    return {
      styles,
      ...toRefs(navigationSelectorState),
      onNavigationChange,
      onClickClear
    }
  },
  components: {
    NavigationSelector,
    NavigationContent,
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
  top: 60px;
  right: 90px;
}
</style>
