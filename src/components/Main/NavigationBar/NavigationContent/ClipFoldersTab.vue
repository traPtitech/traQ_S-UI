<template>
  <div :class="$style.container">
    <NavigationContentContainer subtitle="クリップフォルダ">
      <template #control>
        <button :class="$style.button" @click="onClickButton">
          <AIcon :size="20" mdi name="plus-circle-outline" />
        </button>
      </template>
      <template #default>
        <template v-if="sortedClipFolders.length > 0">
          <ClipFoldersElement
            v-for="clipFolder in sortedClipFolders"
            :key="clipFolder.id"
            :clip-folder="clipFolder"
            :class="$style.element"
          />
        </template>
        <EmptyState v-else> クリップフォルダがありません </EmptyState>
      </template>
    </NavigationContentContainer>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import ClipFoldersElement from '/@/components/Main/NavigationBar/NavigationContent/ClipFoldersElement.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import { useModalStore } from '/@/store/ui/modal'
import useSortedClipFolders from '/@/composables/clips/useSortedClipFolders'

const { pushModal } = useModalStore()
const sortedClipFolders = useSortedClipFolders()

const onClickButton = () => {
  pushModal({
    type: 'clip-folder-create'
  })
}
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
.element {
  margin: 8px 0;
}
.button {
  @include color-ui-secondary-inactive;
  cursor: pointer;
  &:hover,
  &:focus {
    @include color-ui-secondary;
  }
}
</style>
