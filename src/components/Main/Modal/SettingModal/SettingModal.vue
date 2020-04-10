<template>
  <div :class="$style.container">
    <navigation-selector
      @navigation-change="onNavigationChange"
      :current-navigation="currentNavigation"
    />
    <navigation-content :current-navigation="currentNavigation" />
    <close-button />
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

    return {
      styles,
      ...toRefs(navigationSelectorState),
      onNavigationChange
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
}
</style>
