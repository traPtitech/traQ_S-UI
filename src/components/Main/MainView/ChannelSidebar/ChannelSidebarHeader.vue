<template>
  <sidebar-header>
    <span :class="$style.channelHash">#</span>
    <span :class="$style.text">{{ channelName }}</span>
  </sidebar-header>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import SidebarHeader from '@/components/Main/MainView/MainViewSidebar/SidebarHeader.vue'

export default defineComponent({
  name: 'ChannelSidebarHeader',
  props: {
    channelId: { type: String as PropType<ChannelId>, required: false }
  },
  components: { SidebarHeader },
  setup(props) {
    const channelName = computed(
      () => store.state.entities.channels[props.channelId ?? '']?.name ?? ''
    )
    return { channelName }
  }
})
</script>

<style lang="scss" module>
.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}
.text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
