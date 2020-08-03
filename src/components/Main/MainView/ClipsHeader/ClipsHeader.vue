<template>
  <main-view-header>
    <template #header>
      <main-view-header-title
        :title="clipFolderName"
        icon-mdi
        icon-name="bookmark"
      />
    </template>
    <template #tools>
      <main-view-header-tools-item
        @click="openSidebar"
        icon-mdi
        icon-name="info-outline"
      />
    </template>
  </main-view-header>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import store from '@/store'
import { ClipFolderId } from '@/types/entity-ids'
import useSidebar from '@/use/sidebar'
import MainViewHeader from '@/components/Main/MainView/MainViewHeader/MainViewHeader.vue'
import MainViewHeaderTitle from '@/components/Main/MainView/MainViewHeader/MainViewHeaderTitle.vue'
import MainViewHeaderToolsItem from '@/components/Main/MainView/MainViewHeader/MainViewHeaderToolsItem.vue'

export default defineComponent({
  name: 'ChannelViewHeader',
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
      () => store.state.entities.clipFolders[props.clipFolderId]?.name ?? ''
    )
    const { openSidebar } = useSidebar()
    return {
      clipFolderName,
      openSidebar
    }
  }
})
</script>
