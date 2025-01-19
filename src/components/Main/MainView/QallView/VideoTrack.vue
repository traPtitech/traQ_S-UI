<script setup lang="ts">
import type { VideoTrack } from 'livekit-client'
import { onMounted, onUnmounted, useTemplateRef } from 'vue'

const { track, participantIdentity } = defineProps<{
  track: VideoTrack
  participantIdentity: string
}>()

const videoElement = useTemplateRef<HTMLVideoElement>('videoElement')

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
    <video :id="track.sid" ref="videoElement"></video>
  </div>
</template>
