<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'

const { trackInfo } = defineProps<{
  trackInfo: TrackInfo
}>()
const audioElement = useTemplateRef<HTMLMediaElement>('audioElement')
const volume = ref(1)

watchEffect(() => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
})

onMounted(() => {
  if (audioElement.value) {
    trackInfo.trackPublication?.track?.attach(audioElement.value)
  }
})

onUnmounted(() => {
  trackInfo.trackPublication?.track?.detach()
})
</script>

<template>
  <audio :id="trackInfo.trackPublication?.trackSid" ref="audioElement"></audio>
  <input v-model="volume" type="slider" min="0" max="1" step="0.01" />
</template>
