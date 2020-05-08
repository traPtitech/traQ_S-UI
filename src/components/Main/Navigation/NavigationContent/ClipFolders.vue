<template>
  <div :class="$style.container">
    <navigation-content-container subtitle="クリップフォルダ">
      <template #control>
        <button @click="onClickButton" :class="$style.button">
          <icon :size="20" mdi name="plus-circle-outline" />
        </button>
      </template>
      <template #default>
        <clip-folders-element
          v-for="clipFolder in clipFolders"
          :key="clipFolder.id"
          :clip-folder="clipFolder"
          :class="$style.element"
        />
      </template>
    </navigation-content-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'
import NavigationContentContainer from '@/components/Main/Navigation/NavigationContentContainer.vue'
import ClipFoldersElement from '@/components/Main/Navigation/NavigationContent/ClipFoldersElement.vue'
import { ClipFolder } from '@traptitech/traq'
import { ClipFolderId } from '@/types/entity-ids'

export default defineComponent({
  name: 'ClipFolders',
  components: {
    Icon,
    NavigationContentContainer,
    ClipFoldersElement
  },
  setup() {
    const clipFolders = computed(
      () => store.state.entities.clipFolders as Record<ClipFolderId, ClipFolder>
    )
    const onClickButton = () => {
      store.dispatch.ui.modal.pushModal({
        type: 'clip-folder-create'
      })
    }
    return { clipFolders, onClickButton }
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
.button {
  @include color-ui-secondary;
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
</style>
