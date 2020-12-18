<template>
  <div v-if="currentChannel" :class="$style.container">
    <qall-details-panel />
    <qall-control-panel
      :class="$style.control"
      :status="status"
      :channel-id="currentChannel"
      :is-mic-muted="isMicMuted"
      @end-qall-click="onEndQallClick"
      @mic-click="onMicClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import QallControlPanel from './QallControlPanel.vue'
import QallDetailsPanel from './QallDetailsPanel.vue'
import store from '@/_store'

export default defineComponent({
  name: 'NavigationContentQall',
  components: {
    QallControlPanel,
    QallDetailsPanel
  },
  setup() {
    const currentChannel = computed(() =>
      store.getters.app.rtc.qallSession
        ? store.state.app.rtc.currentRTCState?.channelId
        : undefined
    )
    const onEndQallClick = () => {
      store.dispatch.app.rtc.endQall()
    }
    const isMicMuted = computed(() => store.state.app.rtc.isMicMuted)
    const onMicClick = () => {
      if (isMicMuted.value) {
        store.dispatch.app.rtc.unmute()
      } else {
        store.dispatch.app.rtc.mute()
      }
    }
    const status = computed(() => '通話中')
    return {
      currentChannel,
      status,
      isMicMuted,
      onEndQallClick,
      onMicClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
}
.control {
  flex: 0 1 64px;
}
</style>
