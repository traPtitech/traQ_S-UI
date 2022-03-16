<template>
  <audio-player-abstract-button
    icon-name="stop"
    icon-mdi
    :size="size"
    title="停止する"
  />
</template>

<script lang="ts" setup>
import AudioPlayerAbstractButton from './AudioPlayerAbstractButton.vue'

defineProps<{
  size: number
}>()
</script>
