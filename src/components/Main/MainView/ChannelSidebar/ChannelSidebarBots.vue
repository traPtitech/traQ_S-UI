<template>
  <sidebar-content-container title="参加BOT">
    <channel-sidebar-member-icons
      v-if="botUserIds.length > 0"
      :viewer-states="viewStates"
    />
    <empty-state v-else>参加しているBOTはいません</empty-state>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import EmptyState from '@/components/UI/EmptyState.vue'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'

export default defineComponent({
  name: 'ChannelSidebarBots',
  components: {
    EmptyState,
    ChannelSidebarMemberIcons,
    SidebarContentContainer
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true }
  },
  setup(props) {
    const botUserIds = computed(() => store.state.domain.messagesView.bots)
    const viewStates = computed(() =>
      botUserIds.value.map(id => ({
        user: store.state.entities.users[id],
        active: true
      }))
    )
    return { botUserIds, viewStates }
  }
})
</script>

<style lang="scss" module></style>
