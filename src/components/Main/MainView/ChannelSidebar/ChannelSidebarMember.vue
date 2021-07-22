<template>
  <sidebar-content-container title="メンバー">
    <empty-state v-if="isForceNotification">強制通知チャンネル</empty-state>
    <empty-state v-else-if="!subscribers">
      メンバーの取得に失敗しました
    </empty-state>
    <channel-sidebar-member-icons
      v-else-if="subscribers.size > 0"
      :viewer-states="viewStates"
    />
    <empty-state v-else>メンバーはいません</empty-state>
  </sidebar-content-container>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import store from '/@/store'
import { ChannelId, UserId } from '/@/types/entity-ids'
import EmptyState from '/@/components/UI/EmptyState.vue'
import SidebarContentContainer from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'
import useChannelSubscribers from '/@/use/channelSubscribers'

export default defineComponent({
  name: 'ChannelSidebarMember',
  components: {
    EmptyState,
    ChannelSidebarMemberIcons,
    SidebarContentContainer
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true },
    viewerIds: { type: Array as PropType<UserId[]>, default: () => [] }
  },
  setup(props) {
    const subscribers = useChannelSubscribers(props)

    const isForceNotification = computed(
      () => store.state.entities.channelsMap.get(props.channelId)?.force
    )
    const viewStates = computed(() =>
      [...(subscribers.value ?? new Set())]
        .filter(id => store.state.entities.usersMap.has(id))
        .map(id => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          user: store.getters.entities.activeUsersMap.get(id)!,
          active: props.viewerIds.includes(id)
        }))
        .filter(state => state.user !== undefined)
        .sort((a, b) => {
          if (a.active === b.active) {
            return 0
          }
          return a.active ? -1 : 1
        })
    )
    return { subscribers, isForceNotification, viewStates }
  }
})
</script>

<style lang="scss" module></style>
