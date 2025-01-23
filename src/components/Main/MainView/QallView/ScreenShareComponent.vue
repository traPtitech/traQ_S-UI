<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'
import AudioTrack from './AudioTrack.vue'
import VideoTrack from './VideoTrack.vue'

const { trackInfo, audioTrackInfo, participantIdentity } = defineProps<{
  trackInfo: TrackInfo
  audioTrackInfo: TrackInfo | undefined
  participantIdentity: string
}>()

const { removeVideoTrack } = useQall()

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
  <div :id="'camera-' + participantIdentity">
    <div>
      <p>{{ participantIdentity }}</p>
    </div>
    <VideoTrack v-if="trackInfo.trackPublication" :track-info="trackInfo" />
    <AudioTrack
      v-if="audioTrackInfo?.trackPublication"
      :track-info="audioTrackInfo"
    />
  </div>
</template>

<style lang="scss" module>
.video {
  width: 100%;
  height: 100%;
}
</style>
