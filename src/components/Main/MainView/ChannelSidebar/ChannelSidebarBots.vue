<template>
  <sidebar-content-container v-if="viewStates.length > 0" title="参加BOT">
    <channel-sidebar-member-icons :viewer-states="viewStates" />
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '/@/vuex'
import { ChannelId } from '/@/types/entity-ids'
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'
import useChannelBots from './use/channelBots'

export default defineComponent({
  name: 'ChannelSidebarBots',
  components: {
    ChannelSidebarMemberIcons,
    SidebarContentContainer
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true }
  },
  setup(props) {
    const botUserIds = useChannelBots(props)
    const viewStates = computed(
      () =>
        botUserIds.value
          ?.filter(id => store.state.entities.usersMap.has(id))
          .map(id => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            user: store.state.entities.usersMap.get(id)!,
            active: true
          })) ?? []
    )
    return { viewStates }
  }
})
</script>

<style lang="scss" module></style>
