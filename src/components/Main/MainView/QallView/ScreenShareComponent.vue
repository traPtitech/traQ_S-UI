<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'

const { trackInfo, audioTrackInfo, participantIdentity } = defineProps<{
  trackInfo: TrackInfo
  audioTrackInfo: TrackInfo | undefined
  participantIdentity: string
}>()

const { removeVideoTrack } = useQall()

const videoElement = useTemplateRef<HTMLVideoElement>('videoElement')
const audioElement = useTemplateRef<HTMLAudioElement>('audioElement')
const volume = ref(1)
watchEffect(() => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
})

onMounted(() => {
  if (videoElement.value && audioElement.value) {
    trackInfo.trackPublication?.track?.attach(videoElement.value)
    audioTrackInfo?.trackPublication?.track?.attach(audioElement.value)
  }
})

onUnmounted(() => {
  trackInfo.trackPublication?.track?.detach()
  audioTrackInfo?.trackPublication?.track?.detach()
})
</script>

<template>
  <div :id="'camera-' + participantIdentity">
    <div>
      <p>{{ participantIdentity }}</p>
    </div>
    <video
      v-if="trackInfo.trackPublication"
      :id="trackInfo.trackPublication.trackSid"
      ref="videoElement"
      :class="$style.video"
    ></video>
    <audio
      v-if="audioTrackInfo?.trackPublication"
      :id="audioTrackInfo.trackPublication.trackSid"
      ref="audioElement"
    ></audio>
    <input v-model="volume" type="range" min="0" max="1" step="0.01" />
    <button
      v-if="!trackInfo.isRemote && trackInfo.trackPublication"
      @click="removeVideoTrack(trackInfo.trackPublication)"
    >
      Remove Screen Share
    </button>
  </div>
</template>

<style lang="scss" module>
.video {
  width: 100%;
  height: 100%;
}
</style>
