<script setup lang="ts">
import { useQall } from '/@/composables/qall/useQall'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoComponent.vue'
import AudioComponent from '/@/components/Main/MainView/QallView/AudioComponent.vue'
import { onMounted, ref } from 'vue'
import ScreenShareComponent from './ScreenShareComponent.vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'

const { tracksMap, screenShareTrackSidMap } = useQall()

const videoInputs = ref<MediaDeviceInfo[]>([])
onMounted(async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  videoInputs.value = devices.filter(d => d.kind === 'videoinput')
})
const selectedVideoInput = ref<MediaDeviceInfo>()
const selectedTrack = ref<TrackInfo>()
const selectedSid = ref<string>()
</script>

<template>
  <div v-if="selectedTrack !== undefined">
    <VideoComponent
      v-if="
        selectedTrack.trackPublication?.kind === 'video' &&
        !screenShareTrackSidMap.has(selectedSid ?? '')
      "
      :track-info="selectedTrack"
      is-large
    />
    <ScreenShareComponent
      v-else-if="selectedTrack.trackPublication?.kind === 'video'"
      :track-info="selectedTrack"
      :audio-track-info="
        tracksMap.get(screenShareTrackSidMap.get(selectedSid ?? '') ?? '')
      "
      is-large
    />
    <AudioComponent
      v-else-if="
        selectedTrack.trackPublication?.kind === 'audio' &&
        selectedTrack.isRemote &&
        !screenShareTrackSidMap
          .values()
          ?.some?.(valueSid => valueSid === selectedSid)
      "
      :track-info="selectedTrack"
      is-large
    />
  </div>
  <div :class="$style.TrackContainer">
    <template v-for="[sid, track] in tracksMap.entries()" :key="sid">
      <VideoComponent
        v-if="
          track.trackPublication?.kind === 'video' &&
          !screenShareTrackSidMap.has(sid)
        "
        :track-info="track"
        :is-large="false"
        @click="[selectedTrack, selectedSid] = [track, sid]"
      />
      <ScreenShareComponent
        v-else-if="track.trackPublication?.kind === 'video'"
        :track-info="track"
        :audio-track-info="tracksMap.get(screenShareTrackSidMap.get(sid) ?? '')"
        :is-large="false"
        @click="[selectedTrack, selectedSid] = [track, sid]"
      />
      <AudioComponent
        v-else-if="
          track.trackPublication?.kind === 'audio' &&
          track.isRemote &&
          !screenShareTrackSidMap.values()?.some?.(valueSid => valueSid === sid)
        "
        :track-info="track"
        :is-large="false"
        @click="[selectedTrack, selectedSid] = [track, sid]"
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
</style>
