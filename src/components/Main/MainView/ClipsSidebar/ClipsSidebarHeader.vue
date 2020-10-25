<template>
  <sidebar-header>
    <icon mdi name="bookmark" :class="$style.icon" />
    <span :class="$style.text">{{ name }}</span>
  </sidebar-header>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '@/store'
import { ClipFolderId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'
import SidebarHeader from '@/components/Main/MainView/MainViewSidebar/SidebarHeader.vue'

export default defineComponent({
  name: 'ClipsSidebarHeader',
  components: { SidebarHeader, Icon },
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  setup(props) {
    const name = computed(
      () => store.state.entities.clipFolders[props.clipFolderId]?.name ?? ''
    )
    return { name }
  }
})
</script>

<style lang="scss" module>
.icon {
  margin-right: 16px;
  flex-shrink: 0;
}
.text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
