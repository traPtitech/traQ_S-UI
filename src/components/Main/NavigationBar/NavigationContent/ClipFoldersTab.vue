<template>
  <div :class="$style.container">
    <navigation-content-container subtitle="クリップフォルダ">
      <template #control>
        <button :class="$style.button" @click="onClickButton">
          <a-icon :size="20" mdi name="plus-circle-outline" />
        </button>
      </template>
      <template #default>
        <template v-if="clipFolders.length > 0">
          <clip-folders-element
            v-for="clipFolder in clipFolders"
            :key="clipFolder.id"
            :clip-folder="clipFolder"
            :class="$style.element"
          />
        </template>
        <empty-state v-else>クリップフォルダがありません</empty-state>
      </template>
    </navigation-content-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '/@/vuex'
import AIcon from '/@/components/UI/AIcon.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import ClipFoldersElement from '/@/components/Main/NavigationBar/NavigationContent/ClipFoldersElement.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import { useModalStore } from '/@/store/ui/modal'

export default defineComponent({
  name: 'ClipFoldersTab',
  components: {
    AIcon,
    NavigationContentContainer,
    ClipFoldersElement,
    EmptyState
  },
  setup() {
    const { pushModal } = useModalStore()
    const clipFolders = computed(() => [
      ...store.state.entities.clipFoldersMap.values()
    ])
    const onClickButton = () => {
      pushModal({
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
  @include color-ui-secondary-inactive;
  cursor: pointer;
  &:hover {
    @include color-ui-secondary;
  }
}
</style>
