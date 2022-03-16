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

const props = withDefaults(
  defineProps<{
    loop: boolean
    size: number
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:loop', _val: boolean): void
}>()

const toggle = () => {
  emit('update:loop', !props.loop)
}
</script>
