<template>
  <audio-player-abstract-button
    :disabled="disabled"
    :icon-name="isPlaying ? 'pause' : 'play'"
    icon-mdi
    :size="size"
    :title="isPlaying ? '一時停止する' : '再生する'"
    @click.prevent="toggle"
  />
</template>

<script lang="ts" setup>
import AudioPlayerAbstractButton from './AudioPlayerAbstractButton.vue'

withDefaults(
  defineProps<{
    size: number
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const isPlaying = defineModel<boolean>('isPlaying', { required: true })

const toggle = () => {
  isPlaying.value = !isPlaying.value
}
</script>
