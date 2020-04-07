<template>
  <div :class="$style.container" :style="styles.container">
    <div v-if="userIds" :class="$style.memberTitle">メンバー</div>
    <span v-else :class="$style.text">強制通知チャンネル</span>
    <channel-side-bar-member-icons
      v-if="userIds"
      :class="$style.icons"
      :userIds="userIds"
    />
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

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarMember',
  components: { ChannelSideBarMemberIcons },
  setup() {
    const styles = useStyles()
    //const userIds = new Array(10).fill('0853a54a-7102-4d6b-b45e-720c87a26c41')
    const userIds = computed(() => store.state.domain.messagesView.subscribers)
    return { styles, userIds }
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
}

.icons {
  padding-bottom: 80px;
}
</style>
