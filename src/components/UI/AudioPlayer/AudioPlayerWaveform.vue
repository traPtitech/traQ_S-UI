<template>
  <div
    ref="waveformEle"
    :class="$style.waveformWrapper"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @mousemove="onMouseMove"
    @click.prevent="onClick"
  >
    <div :class="$style.waveformPlayedMask" :style="waveformWrapperStyle">
      <div :class="$style.waveform" :style="waveformStyle"></div>
    </div>
    <div
      v-show="selectingPosition"
      :class="$style.selectingPosition"
      :style="selectingPositionStyle"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, shallowRef } from 'vue'
import { throttle } from 'throttle-debounce'
import useHover from '/@/composables/useHover'

const props = defineProps<{
  waveformPath: string
  currentTime: number
  duration: number
}>()

const emit = defineEmits<{
  (e: 'update:currentTime', _val: number): void
}>()

const playedPercentage = computed(() =>
  props.duration === 0 ? 0 : (props.currentTime / props.duration) * 100
)
const waveformStyle = computed(() => {
  const value = `url(${props.waveformPath})`
  return {
    '-webkit-mask-image': value,
    'mask-image': value
  }
})
const waveformWrapperStyle = computed(() => {
  const value = `linear-gradient(to right, rgba(0,0,0,.75), rgba(0,0,0,.75) ${playedPercentage.value}%, rgba(0,0,0,.25) ${playedPercentage.value}%, rgba(0,0,0,.25))`
  return {
    '-webkit-mask-image': value,
    'mask-image': value
  }
})

const selectingPosition = ref<number>()
const waveformEle = shallowRef<HTMLDivElement>()
const { isHovered, onMouseEnter, onMouseLeave: onMouseLeaveHover } = useHover()
const onMouseMove = throttle(100, (e: MouseEvent) => {
  if (!waveformEle.value || !isHovered.value) return
  const left = e.pageX - waveformEle.value.getBoundingClientRect().left
  selectingPosition.value = left
})
const onMouseLeave = () => {
  onMouseLeaveHover()
  selectingPosition.value = undefined
}
const selectingPositionStyle = computed(() => ({
  transform: `translateX(${selectingPosition.value}px)`
}))

const onClick = (e: MouseEvent) => {
  if (!waveformEle.value) return
  const waveformRect = waveformEle.value.getBoundingClientRect()
  const left = e.pageX - waveformRect.left
  const newCurrentTime = props.duration * (left / waveformRect.width)
  emit('update:currentTime', newCurrentTime)
}
</script>

<style lang="scss" module>
.waveformWrapper {
  position: relative;
  cursor: pointer;
}
.waveformPlayedMask {
  height: 100%;
  width: 100%;
}
.waveform {
  height: 100%;
  width: 100%;
  background-color: var(--specific-waveform-color);
  background-image: var(--specific-waveform-gradation);
  background-blend-mode: overlay;
  mask-size: 100% 200%;
}
.selectingPosition {
  position: absolute;
  top: 0;
  left: -1px;
  width: 2px;
  height: 100%;
  background: $theme-ui-primary-background;
}
</style>
