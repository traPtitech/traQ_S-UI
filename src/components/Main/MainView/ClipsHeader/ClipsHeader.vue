<template>
  <main-view-header>
    <template #header>
      <main-view-header-title
        :class="$style.header"
        :title="clipFolderName"
        icon-mdi
        icon-name="bookmark"
      />
    </template>
    <template #tools>
      <main-view-header-tools-item
        icon-mdi
        icon-name="info-outline"
        @click="openSidebar"
      />
    </template>
  </main-view-header>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import store from '/@/store'
import { ClipFolderId } from '/@/types/entity-ids'
import useSidebar from '/@/use/sidebar'
import MainViewHeader from '/@/components/Main/MainView/MainViewHeader/MainViewHeader.vue'
import MainViewHeaderTitle from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderTitle.vue'
import MainViewHeaderToolsItem from '/@/components/Main/MainView/MainViewHeader/MainViewHeaderToolsItem.vue'

export default defineComponent({
  name: 'ClipsHeader',
  components: {
    MainViewHeader,
    MainViewHeaderTitle,
    MainViewHeaderToolsItem
  },
  props: {
    clipFolderId: {
      type: String as PropType<ClipFolderId>,
      required: true
    }
  },
  setup(props) {
    const clipFolderName = computed(
      () =>
        store.state.entities.clipFoldersMap.get(props.clipFolderId)?.name ?? ''
    )
    const { openSidebar } = useSidebar()
    return {
      clipFolderName,
      openSidebar
    }
  }
})
</script>

<style lang="scss" module>
.header {
  overflow-x: auto;
  word-break: keep-all;
  white-space: nowrap;
}
</style>
