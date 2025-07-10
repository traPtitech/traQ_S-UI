<template>
  <div>
    <channel-header-tools-list
      :class="$style.tools"
      :channel-id="channelId"
      :is-forced-channel="channelState.forced"
      :is-starred="channelState.stared"
      :is-archived="channelState.archived"
      @click-more="togglePopupMenu"
    >
      <click-outside v-if="isPopupMenuShown" @click-outside="closePopupMenu">
        <channel-header-tools-menu
          :class="$style.toolsMenu"
          :channel-id="channelId"
          :show-notification-setting-btn="!channelState.forced"
          :is-archived="channelState.archived"
          @click-item="closePopupMenu"
        />
      </click-outside>
    </channel-header-tools-list>
  </div>
</template>

<script lang="ts" setup>
import ChannelHeaderToolsList from './ChannelHeaderToolsList.vue'
import ChannelHeaderToolsMenu from './ChannelHeaderToolsMenu.vue'
import useChannelState from './composables/useChannelState'
import ClickOutside from '/@/components/UI/ClickOutside'
import useToggle from '/@/composables/utils/useToggle'
import type { ChannelId } from '/@/types/entity-ids'

const props = defineProps<{
  channelId: ChannelId
}>()

const {
  value: isPopupMenuShown,
  toggle: togglePopupMenu,
  close: closePopupMenu
} = useToggle(false)
const { channelState } = useChannelState(props)
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
