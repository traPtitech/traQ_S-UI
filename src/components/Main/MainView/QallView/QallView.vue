<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoTrack.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioTrack.vue'
import CallControlButton from './CallControlButton.vue'
const { tracksMap, toggleCalling } = useQall()

const endCall = () => {
  toggleCalling('')
}
</script>

<template>
  <div :class="$style.Block">
    <h1 :class="$style.Header">Qall View</h1>
    <div>
      <template
        v-for="track of tracksMap.values()"
        :key="track.trackPublication?.trackSid"
      >
        <VideoComponent
          v-if="track.trackPublication?.kind === 'video'"
          :track="track.trackPublication.videoTrack!"
          :participant-identity="track.participantIdentity"
        />
        <AudioComponent
          v-else-if="track.trackPublication?.kind === 'audio'"
          :track="track.trackPublication.audioTrack!"
        />
        <CallControlButton
          icon="/@/assets/icons/call_off.svg?url"
          :on-click="endCall"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" module>
.Block {
  color: green;
}

.Header {
  font: {
    size: 30px;
    weight: bold;
  }
  color: green;
}
</style>
