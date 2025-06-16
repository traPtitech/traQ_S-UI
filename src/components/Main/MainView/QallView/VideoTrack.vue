<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'

const { trackInfo } = defineProps<{
  trackInfo: TrackInfo
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
  <video v-if="trackInfo.trackPublication" ref="videoElement" />
</template>
