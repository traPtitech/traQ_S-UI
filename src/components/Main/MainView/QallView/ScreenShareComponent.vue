<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import AudioTrack from './AudioTrack.vue'
import VideoComponent from './VideoComponent.vue'

const { trackInfo, audioTrackInfo } = defineProps<{
  trackInfo: TrackInfo
  audioTrackInfo: TrackInfo | undefined
}>()

const volume = ref(1)

const videoElement = useTemplateRef<HTMLVideoElement>('videoElement')

onMounted(() => {
  if (videoElement.value) {
    trackInfo.trackPublication?.track?.attach(videoElement.value)
  }
})

onUnmounted(() => {
  if (videoElement.value) {
    trackInfo.trackPublication?.track?.detach(videoElement.value)
  }
})
</script>

<template>
  <div :id="'camera-' + trackInfo.participantIdentity">
    <VideoComponent v-if="trackInfo.trackPublication" :track-info="trackInfo" />
    <AudioTrack
      v-if="audioTrackInfo?.trackPublication"
      :track-info="audioTrackInfo"
      :volume="volume"
    />
    <input v-model="volume" type="range" min="0" max="3" step="0.01" />
  </div>
</template>

<style lang="scss" module>
.video {
  width: 100%;
  height: 100%;
}
</style>
