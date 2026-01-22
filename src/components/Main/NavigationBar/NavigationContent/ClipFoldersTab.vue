<template>
  <div :class="$style.container">
    <NavigationContentContainer
      subtitle="クリップフォルダ"
      :class="$style.item"
    >
      <template #control>
        <button :class="$style.button" @click="onClickButton">
          <AIcon :size="20" mdi name="plus-circle-outline" />
        </button>
      </template>
      <template #default>
        <template v-if="sortedClipFolders.length > 0">
          <ChannelList :channels-or-clip-folders="sortedClipFolders" is-clip />
        </template>
        <EmptyState v-else> クリップフォルダがありません </EmptyState>
      </template>
    </NavigationContentContainer>
  </div>
</template>

<script lang="ts" setup>
import ChannelList from '/@/components/Main/NavigationBar/ChannelList/ChannelList.vue'
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'
import useSortedClipFolders from '/@/composables/clips/useSortedClipFolders'
import { useModalStore } from '/@/store/ui/modal'

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
  padding: 0 8px 0 0;
}
.button {
  @include color-ui-secondary-inactive;
  cursor: pointer;
  padding-left: 16px;
  &:hover,
  &:focus {
    @include color-ui-secondary;
  }
}
.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
