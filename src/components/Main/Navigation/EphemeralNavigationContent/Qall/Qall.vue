<template>
  <div v-if="currentChannel">
    <qall-details-panel />
    <qall-control-panel
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
import store from '/@/store'

export default defineComponent({
  name: 'Qall',
  components: {
    QallControlPanel,
    QallDetailsPanel
  },
  setup() {
    const currentChannel = computed(() =>
      store.getters.domain.rtc.qallSession
        ? store.getters.domain.rtc.currentRTCState?.channelId
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
