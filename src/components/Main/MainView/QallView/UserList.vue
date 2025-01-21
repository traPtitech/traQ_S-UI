<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoTrack.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioTrack.vue'
import { onMounted, ref } from 'vue'

const { tracksMap, addScreenShareTrack, addCameraTrack } = useQall()

const videoInputs = ref<MediaDeviceInfo[]>([])
onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoInputs.value = devices.filter(d => d.kind === 'videoinput')
})
const selectedVideoInput = ref<MediaDeviceInfo>()
</script>

<template>
  <div :class="$style.TrackContainer">
    <template
      v-for="track of tracksMap.values()"
      :key="track.trackPublication?.trackSid"
    >
      <div :class="$style.UserBlock">
        <VideoComponent
          v-if="track.trackPublication?.kind === 'video'"
          :track-info="track"
          :participant-identity="track.participantIdentity"
          :class="[$style.video, $style.UserCard]"
        />
        <AudioComponent
          v-else-if="track.trackPublication?.kind === 'audio' && track.isRemote"
          :track-info="track"
          :class="[$style.UserCard]"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" module>
.TrackContainer {
  height: fit-content;
}
.UserBlock {
  border: 1px solid black;
  float: left;
}
.video {
  width: 50%;
  height: 50%;
}
.UserCard {
  height: 108px;
  width: 192px;
  border: 1px solid black;
}
</style>
