<template>
  <div>
    <ThreadHeaderToolsList
      :class="$style.tools"
      :channel-id="channelId"
      :is-forced-channel="channelState.forced"
      :is-starred="channelState.starred"
      :is-archived="channelState.archived"
      @click-more="togglePopupMenu"
    >
      <ClickOutside v-if="isPopupMenuShown" @click-outside="closePopupMenu">
        <ThreadHeaderToolsMenu
          :class="$style.toolsMenu"
          :channel-id="channelId"
          :show-notification-setting-btn="!channelState.forced"
          :is-starred="channelState.starred"
          :is-archived="channelState.archived"
          @click-item="closePopupMenu"
        />
      </ClickOutside>
    </ThreadHeaderToolsList>
  </div>
</template>

<script lang="ts" setup>
import ClickOutside from '/@/components/UI/ClickOutside'
import useToggle from '/@/composables/utils/useToggle'
import type { ChannelId } from '/@/types/entity-ids'

import ThreadHeaderToolsList from './ThreadHeaderToolsList.vue'
import ThreadHeaderToolsMenu from './ThreadHeaderToolsMenu.vue'
import useThreadState from './composables/useThreadState'

const props = defineProps<{
  channelId: ChannelId
}>()

const {
  value: isPopupMenuShown,
  toggle: togglePopupMenu,
  close: closePopupMenu
} = useToggle(false)
const { channelState } = useThreadState(props)
</script>

<style lang="scss" module>
.tools {
  flex-shrink: 0;
}
.toolsMenu {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: $z-index-header-tools;
  contain: content;
}
</style>
