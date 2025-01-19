<script setup lang="ts">
import type { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client'
import { onMounted, onUnmounted, useTemplateRef } from 'vue'

const props = defineProps<{
  track: LocalAudioTrack | RemoteAudioTrack
}>()
const audioElement = useTemplateRef<HTMLMediaElement>('audioElement')

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
</template>
