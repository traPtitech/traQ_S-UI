<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'

const { trackInfo, participantIdentity } = defineProps<{
  trackInfo: TrackInfo
  participantIdentity: string
}>()

const { removeScreenShareTrack } = useQall()

const videoElement = useTemplateRef<HTMLVideoElement>('videoElement')
const volume = ref(1)
watchEffect(() => {
  if (videoElement.value) {
    videoElement.value.volume = volume.value
  }
})

onMounted(() => {
  if (videoElement.value) {
    trackInfo.trackPublication?.track?.attach(videoElement.value)
  }
})

onUnmounted(() => {
  trackInfo.trackPublication?.track?.detach()
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
    <input v-model="volume" type="range" min="0" max="1" step="0.01" />
    <button
      v-if="!trackInfo.isRemote && trackInfo.trackPublication"
      @click="removeScreenShareTrack(trackInfo.trackPublication)"
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
