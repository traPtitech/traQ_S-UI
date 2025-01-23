<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoComponent.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioComponent.vue'
import { onMounted, ref } from 'vue'
import ScreenShareComponent from './ScreenShareComponent.vue'

const { tracksMap, screenShareTrackSidMap } = useQall()

const videoInputs = ref<MediaDeviceInfo[]>([])
onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoInputs.value = devices.filter(d => d.kind === 'videoinput')
})
const selectedVideoInput = ref<MediaDeviceInfo>()
</script>

<template>
  <div :class="$style.TrackContainer">
    <template v-for="[sid, track] in tracksMap.entries()" :key="sid">
      <VideoComponent
        v-if="
          track.trackPublication?.kind === 'video' &&
          !screenShareTrackSidMap.has(sid)
        "
        :track-info="track"
      />
      <ScreenShareComponent
        v-else-if="track.trackPublication?.kind === 'video'"
        :track-info="track"
        :audio-track-info="tracksMap.get(screenShareTrackSidMap.get(sid) ?? '')"
      />
      <AudioComponent
        v-else-if="
          track.trackPublication?.kind === 'audio' &&
          track.isRemote &&
          !screenShareTrackSidMap.values()?.some?.(valueSid => valueSid === sid)
        "
        :track-info="track"
      />
    </template>
  </div>
</template>

<style lang="scss" module>
.TrackContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  align-self: stretch;
}
.UserBlock {
  // border: 1px solid black;
  float: left;
}

.UserCard {
  height: 108px;
  width: 192px;
}
</style>
