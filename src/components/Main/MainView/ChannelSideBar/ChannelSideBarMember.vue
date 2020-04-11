<template>
  <span v-if="isForceNotification" :style="styles.text" :class="$style.text">
    強制通知チャンネル
  </span>
  <div v-else-if="userIds" :style="styles.container">
    <channel-side-bar-content title="メンバー">
      <template #content>
        <channel-side-bar-member-icons
          v-if="userIds"
          :class="$style.icons"
          :viewerStates="viewStates"
        />
      </template>
    </channel-side-bar-content>
  </div>
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
import ChannelSideBarMemberIcons from './ChannelSideBarMemberIcons.vue'
import { ChannelId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import ChannelSideBarContent from './ChannelSideBarContent.vue'
import { User } from '@traptitech/traq'
import { UserId } from '../../../../types/entity-ids'

type ViewState = {
  user: User
  viewing: boolean
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    })),
    text: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarMember',
  components: { ChannelSideBarMemberIcons, ChannelSideBarContent },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true },
    viewerIds: { type: Array as PropType<UserId[]>, default: [] }
  },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as { channelId: ChannelId; viewerIds: UserId[] }
    const styles = useStyles()
    const isForceNotification = computed(
      () => store.state.entities.channels[propst.channelId]?.force
    )
    const userIds = computed(() => store.state.domain.messagesView.subscribers)
    const viewStates = computed(() =>
      userIds.value
        .map(id => ({
          user: store.state.entities.users[id],
          viewing: propst.viewerIds.includes(id)
        }))
        .sort((a, b) => {
          if (a.viewing === b.viewing) {
            return 0
          }
          if (a.viewing && !b.viewing) {
            return -1
          }
          return 1
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
