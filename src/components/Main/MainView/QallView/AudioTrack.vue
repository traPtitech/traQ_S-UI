<script setup lang="ts">
import type { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client'
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'

const props = defineProps<{
  track: LocalAudioTrack | RemoteAudioTrack
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
    props.track.attach(audioElement.value)
  }
})

onUnmounted(() => {
  props.track.detach()
})
</script>

<template>
  <audio :id="track.sid" ref="audioElement"></audio>
  <input v-model="volume" type="slider" min="0" max="1" step="0.01" />
</template>
