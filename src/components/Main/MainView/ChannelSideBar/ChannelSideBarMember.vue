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
  SetupContext
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import ChannelSideBarMemberIcons from './ChannelSideBarMemberIcons.vue'
import { ChannelId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import ChannelSideBarContent from './ChannelSideBarContent.vue'
import { User } from '@traptitech/traq'
import { UserId } from '../../../../types/entity-ids'

type Props = {
  channelId: ChannelId
  viewerIds: UserId[]
}

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
    channelId: { type: String, reqired: true },
    viewerIds: { type: Array, default: [] }
  },
  setup(props: Props) {
    const styles = useStyles()
    const isForceNotification = computed(
      () => store.state.entities.channels[props.channelId]?.force
    )
    const userIds = computed(() => store.state.domain.messagesView.subscribers)
    const viewStates = computed(() => {
      let states: ViewState[] = []
      for (const id of store.state.domain.messagesView.subscribers) {
        let state: ViewState = {
          user: store.state.entities.users[id],
          viewing: false
        }
        if (props.viewerIds.findIndex(v => v === id) > -1) {
          state.viewing = true
        }
        states.push(state)
      }
      states.sort(function (a, b) {
        return a.viewing ? -1 : 1
      })
      return states
    })
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
