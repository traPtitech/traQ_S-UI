<template>
  <audio-player-abstract-button
    :disabled="disabled"
    :icon-name="loop ? 'loop' : 'no-loop'"
    :size="size"
    :title="loop ? 'ループ再生を無効にする' : 'ループ再生を有効にする'"
    @click.prevent="toggle"
  />
</template>

<script lang="ts" setup>
import AudioPlayerAbstractButton from './AudioPlayerAbstractButton.vue'

const loop = defineModel<boolean>('loop', { required: true })

withDefaults(
  defineProps<{
    size: number
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const toggle = () => {
  loop.value = !loop.value
}
</script>
