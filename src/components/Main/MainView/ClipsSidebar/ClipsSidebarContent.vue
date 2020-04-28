<template>
  <div>
    <sidebar-content-container title="名前" :class="$style.item">
      <div>{{ name }}</div>
    </sidebar-content-container>
    <sidebar-content-container-foldable title="説明" :class="$style.item">
      <div>{{ description }}</div>
    </sidebar-content-container-foldable>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import SidebarContentContainerFoldable from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainerFoldable.vue'
import { ClipFolderId } from '@/types/entity-ids'

import store from '@/store'

export default defineComponent({
  name: 'ClipsSidebarContent',
  components: {
    SidebarContentContainer,
    SidebarContentContainerFoldable
  },
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  setup(props) {
    const name = computed(
      () => store.state.entities.clipFolders[props.clipFolderId]?.name ?? ''
    )
    const description = computed(
      () =>
        store.state.entities.clipFolders[props.clipFolderId]?.description ?? ''
    )
    return { name, description }
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
}
</style>
