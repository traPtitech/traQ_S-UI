<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoTrack.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioTrack.vue'

const { tracksMap, addScreenShareTrack } = useQall()
</script>

<template>
  <div :class="$style.Block">
    <h1 :class="$style.Header">Qall View</h1>
    <button @click="addScreenShareTrack">Add Screen Share Track</button>
    <div>
      <template
        v-for="track of tracksMap.values()"
        :key="track.trackPublication?.trackSid"
      >
        <VideoComponent
          v-if="track.trackPublication?.kind === 'video'"
          :track="track.trackPublication.videoTrack!"
          :participant-identity="track.participantIdentity"
          :class="$style.video"
        />
        <AudioComponent
          v-else-if="track.trackPublication?.kind === 'audio'"
          :track="track.trackPublication.audioTrack!"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" module>
.video {
  width: 50%;
  height: 50%;
}
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
