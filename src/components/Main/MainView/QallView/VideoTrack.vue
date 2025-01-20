<script setup lang="ts">
import type { VideoTrack } from 'livekit-client'
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'

const { track, participantIdentity } = defineProps<{
  track: VideoTrack
  participantIdentity: string
}>()

const videoElement = useTemplateRef<HTMLVideoElement>('videoElement')
const volume = ref(1)
watchEffect(() => {
  if (videoElement.value) {
    videoElement.value.volume = volume.value
  }
})

onMounted(() => {
  if (videoElement.value) {
    track.attach(videoElement.value)
  }
})

onUnmounted(() => {
  track.detach()
})
</script>

<template>
  <div :id="'camera-' + participantIdentity">
    <div>
      <p>{{ participantIdentity }}</p>
    </div>
    <video :id="track.sid" ref="videoElement" :class="$style.video"></video>
    <input v-model="volume" type="slider" min="0" max="1" step="0.01" />
  </div>
</template>

<style lang="scss" module>
.video {
  width: 100%;
  height: 100%;
}
</style>
