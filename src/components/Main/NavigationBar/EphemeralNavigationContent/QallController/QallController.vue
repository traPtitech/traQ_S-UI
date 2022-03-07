<template>
  <div v-if="currentChannel">
    <qall-details-panel />
    <qall-control-panel
      :status="status"
      :channel-id="currentChannel"
      :is-mic-muted="isMicMuted"
      @end-qall-click="endQall"
      @mic-click="onMicClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import QallControlPanel from './QallControlPanel.vue'
import QallDetailsPanel from './QallDetailsPanel.vue'
import store from '/@/vuex'
import { useAppRtcStore } from '/@/store/app/rtc'

export default defineComponent({
  name: 'QallController',
  components: {
    QallControlPanel,
    QallDetailsPanel
  },
  setup() {
    const { isMicMuted, endQall, mute, unmute } = useAppRtcStore()
    const currentChannel = computed(() =>
      store.getters.domain.rtc.qallSession
        ? store.getters.domain.rtc.currentRTCState?.channelId
        : undefined
    )
    const onMicClick = () => {
      if (isMicMuted.value) {
        unmute()
      } else {
        mute()
      }
    }
    const status = computed(() => '通話中')
    return {
      currentChannel,
      status,
      isMicMuted,
      endQall,
      onMicClick
    }
  }
})
</script>
