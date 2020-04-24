<template>
  <sidebar-content-container title="メンバー">
    <empty-state v-if="isForceNotification">強制通知チャンネル</empty-state>
    <channel-sidebar-member-icons
      v-else-if="userIds.length > 0"
      :class="$style.icons"
      :viewer-states="viewStates"
    />
    <empty-state v-else>メンバーはいません</empty-state>
  </sidebar-content-container>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { ChannelId, UserId } from '@/types/entity-ids'
import EmptyState from '@/components/UI/EmptyState.vue'
import SidebarContentContainer from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainer.vue'
import ChannelSidebarMemberIcons from './ChannelSidebarMemberIcons.vue'

const useStyles = () =>
  reactive({
    text: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSidebarMember',
  components: {
    EmptyState,
    ChannelSidebarMemberIcons,
    SidebarContentContainer
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true },
    viewerIds: { type: Array as PropType<UserId[]>, default: [] }
  },
  setup(props) {
    const styles = useStyles()
    const isForceNotification = computed(
      () => store.state.entities.channels[props.channelId]?.force
    )
    const userIds = computed(() => store.state.domain.messagesView.subscribers)
    const viewStates = computed(() =>
      userIds.value
        .map(id => ({
          user: store.state.entities.users[id],
          viewing: props.viewerIds.includes(id)
        }))
        .sort((a, b) => {
          if (a.viewing === b.viewing) {
            return 0
          }
          return a.viewing ? -1 : 1
        })
    )
    return { styles, userIds, isForceNotification, viewStates }
  }
})
</script>

<style lang="scss" module>
$memberTitleSize: 1.15rem;

.text {
  font-weight: bold;
  font-size: $memberTitleSize;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  width: 256px;
  border-radius: 4px;
  padding: 8px;
  flex-shrink: 0;
}
</style>
