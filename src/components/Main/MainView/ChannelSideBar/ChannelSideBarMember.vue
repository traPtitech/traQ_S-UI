<template>
  <div v-if="userIds" :class="$style.container" :style="styles.container">
    <div :class="$style.memberTitle">メンバー</div>
    <channel-side-bar-member-icons
      v-if="userIds"
      :class="$style.icons"
      :userIds="userIds"
    />
  </div>
  <span
    v-else-if="
      state.channelName === 'general' || state.channelName === 'random'
    "
    :style="styles.text"
    :class="$style.text"
    >強制通知チャンネル</span
  >
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

type Props = {
  channelId: ChannelId
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
  components: { ChannelSideBarMemberIcons },
  props: { channelId: { type: String, reqired: true } },
  setup(props: Props) {
    const styles = useStyles()
    const state = reactive({
      channelName: computed(() => {
        const { channelIdToPath } = useChannelPath()
        const channelArray: string[] = channelIdToPath(props.channelId)
        if (channelArray.length === 0) {
          return ''
        }
        return channelArray[channelArray.length - 1]
      })
    })
    const userIds = computed(() => store.state.domain.messagesView.subscribers)
    return { styles, userIds, state }
  }
})
</script>

<style lang="scss" module>
$memberTitleSize: 1.15rem;

.container {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  width: 256px;
  border-radius: 4px;
  padding: 8px;
  flex-shrink: 0;
}

.memberTitle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-weight: bold;
  font-size: $memberTitleSize;
  min-height: 48px;
}

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

.icons {
  padding-bottom: 80px;
}
</style>
