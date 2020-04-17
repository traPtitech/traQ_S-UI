<template>
  <div :class="$style.container" :style="styles.container">
    <navigation-content-container subtitle="すべてのクリップ">
      <empty-state>Not Implemented</empty-state>
    </navigation-content-container>
    <navigation-content-container subtitle="クリップフォルダ">
      <empty-state>Not Implemented</empty-state>
    </navigation-content-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import EmptyState from '@/components/UI/EmptyState.vue'
import NavigationContentContainer from '@/components/Main/Navigation/NavigationContentContainer.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'ClipFolders',
  components: {
    NavigationContentContainer,
    EmptyState
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
