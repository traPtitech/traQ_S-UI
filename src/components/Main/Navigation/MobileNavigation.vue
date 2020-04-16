<template>
  <nav :class="$style.container" :style="styles.container">
    <div :class="$style.header" :style="styles.componentWrap">
      へっだ
    </div>
    <div :class="$style.content" :style="styles.componentWrap">
      <navigation-content :current-navigation="currentNavigation" />
    </div>
    <div :class="$style.selector" :style="styles.componentWrap">
      <navigation-selector
        @navigation-change="onNavigationChange"
        :current-navigation="currentNavigation"
      />
    </div>
  </nav>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  toRefs
} from '@vue/composition-api'
import NavigationContent from '@/components/Main/Navigation/NavigationContent.vue'
// FIXME: モバイル用のレイアウト
import NavigationSelector from '@/components/Main/Navigation/MobileNavigationSelector.vue'
import { useNavigation } from '@/components/Main/Navigation/use/navigation'
import { makeStyles } from '@/lib/styles'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.tertiary
    })),
    componentWrap: makeStyles(theme => ({
      background: theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'MobileNavigation',
  components: { NavigationContent, NavigationSelector },
  setup() {
    const styles = useStyles()
    const { navigationSelectorState, onNavigationChange } = useNavigation()
    return {
      ...toRefs(navigationSelectorState),
      onNavigationChange,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template:
    'header' 36px
    'content' 1fr
    'selector' 60px;
  row-gap: 16px;
  width: 100%;
  height: 100%;
  padding: 16px;
}
.header,
.content,
.selector {
  border-radius: 4px;
  overflow: hidden;
}
.header {
  grid-area: header;
}
.content {
  grid-area: content;
}
.selector {
  grid-area: selector;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 32px;
  flex-shrink: 0;
}
</style>
