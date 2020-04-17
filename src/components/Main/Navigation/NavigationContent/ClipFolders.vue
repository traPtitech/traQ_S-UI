<template>
  <div :class="$style.container" :style="styles.container">
    <navigation-content-container subtitle="すべてのクリップ">
      <empty-state>Not Implemented</empty-state>
    </navigation-content-container>
    <navigation-content-container subtitle="クリップフォルダ">
      <div
        v-for="clipFolder in clipFolders"
        :key="clipFolder.id"
        :class="$style.list"
      >
        <clip-folders-element
          :clip-folder="clipFolder"
          :class="$style.element"
        />
      </div>
    </navigation-content-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import EmptyState from '@/components/UI/EmptyState.vue'
import NavigationContentContainer from '@/components/Main/Navigation/NavigationContentContainer.vue'
import ClipFoldersElement from '@/components/Main/Navigation/NavigationContent/ClipFoldersElement.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'ClipFolders',
  components: {
    NavigationContentContainer,
    EmptyState,
    ClipFoldersElement
  },
  setup() {
    const clipFolders = computed(() => store.state.entities.clipFolders)
    const styles = useStyles()
    return { clipFolders, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
.element {
  margin: 8px 0;
}
.list {
  margin: 16px 0px;
}
</style>
