<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import type { TrackInfo } from '/@/composables/qall/useLiveKitSDK'

const { trackInfo } = defineProps<{
  trackInfo: TrackInfo
}>()
const audioElement = useTemplateRef<HTMLMediaElement>('audioElement')
const volume = ref(1)
const audioContext = new AudioContext()
const gainNode = audioContext.createGain()
gainNode.gain.value = 1

watchEffect(() => {
  if (audioElement.value) {
    gainNode.gain.value = volume.value
  }
})

onMounted(() => {
  if (audioElement.value) {
    // chromeだと一回要素に入れないと上手く再生してくれない
    trackInfo.trackPublication?.track?.attach(audioElement.value)
    if (trackInfo.trackPublication?.track?.mediaStream) {
      audioContext
        .createMediaStreamSource(trackInfo.trackPublication?.track?.mediaStream)
        .connect(gainNode)
        .connect(audioContext.destination)
      audioElement.value.muted = true
    }
  }
})

onUnmounted(() => {
  if (audioElement.value) {
    trackInfo.trackPublication?.track?.detach(audioElement.value)
    audioContext.close()
  }
})
</script>

<template>
  <div>{{ trackInfo.participantIdentity }}</div>
  <audio :id="trackInfo.trackPublication?.trackSid" ref="audioElement"></audio>
  <input v-model="volume" type="range" min="0" max="3" step="0.01" />
</template>
