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

<script lang="ts" setup>
import QallControlPanel from './QallControlPanel.vue';
import QallDetailsPanel from './QallDetailsPanel.vue';
import { computed } from 'vue';
import { useAppRtcStore } from '/@/store/app/rtc'
import { useDomainRtcStore } from '/@/store/domain/rtc'

const { isMicMuted, endQall, mute, unmute } = useAppRtcStore()
const { qallSession, currentRTCState } = useDomainRtcStore()
const currentChannel = computed(() =>
  qallSession.value ? currentRTCState.value?.channelId : undefined
)
const onMicClick = () => {
  if (isMicMuted.value) {
    unmute()
  } else {
    mute()
  }
}
const status = computed(() => '通話中')
</script>
