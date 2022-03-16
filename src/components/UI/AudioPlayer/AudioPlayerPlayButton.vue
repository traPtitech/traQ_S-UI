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
import AudioPlayerAbstractButton from './AudioPlayerAbstractButton.vue';

const props = withDefaults(defineProps<{
    isPlaying: boolean,
    size: number,
    disabled?: boolean
}>(), {
    disabled: false
});

const emit = defineEmits<{
    (e: "update:isPlaying", _val: boolean): void
}>();

const toggle = () => {
  emit('update:isPlaying', !props.isPlaying)
}
</script>
