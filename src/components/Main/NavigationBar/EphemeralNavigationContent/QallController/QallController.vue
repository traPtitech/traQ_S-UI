<template>
  <div v-if="currentChannel">
    <qall-details-panel />
    <qall-control-panel
      :status="status"
      :channel-id="currentChannel"
      :is-mic-muted="isMicMuted"
      @end-qall-click="leaveQall"
      @mic-click="onMicClick"
    />
  </div>
</template>

<script lang="ts" setup>
import QallControlPanel from './QallControlPanel.vue'
import QallDetailsPanel from './QallDetailsPanel.vue'
import { computed, ref } from 'vue'
import { useQall } from '/@/composables/qall/useQall'

const { leaveQall } = useQall()

// TODO: Qall
const currentChannel = ref(undefined)
const isMicMuted = ref(false)
const unmute = () => {
  isMicMuted.value = false
}
const mute = () => {
  isMicMuted.value = true
}
const onMicClick = () => {
  if (isMicMuted.value) {
    unmute()
  } else {
    mute()
  }
}
const status = computed(() => '通話中')
</script>
