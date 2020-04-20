<template>
  <div :class="$style.container">
    <navigation-content-container subtitle="すべてのクリップ">
      <empty-state>Not Implemented</empty-state>
    </navigation-content-container>
    <navigation-content-container subtitle="クリップフォルダ">
      <div v-for="clipFolder in clipFolders" :key="clipFolder.id">
        <clip-folders-element
          :clip-folder="clipFolder"
          :class="$style.element"
        />
      </div>
    </navigation-content-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import EmptyState from '@/components/UI/EmptyState.vue'
import NavigationContentContainer from '@/components/Main/Navigation/NavigationContentContainer.vue'
import ClipFoldersElement from '@/components/Main/Navigation/NavigationContent/ClipFoldersElement.vue'
import { ClipFolder } from '@traptitech/traq'
import { ClipFolderId } from '@/types/entity-ids'

export default defineComponent({
  name: 'ClipFolders',
  components: {
    NavigationContentContainer,
    EmptyState,
    ClipFoldersElement
  },
  setup() {
    const clipFolders = computed(
      () => store.state.entities.clipFolders as Record<ClipFolderId, ClipFolder>
    )
    return { clipFolders }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
.element {
  margin: 16px 0;
}
</style>
