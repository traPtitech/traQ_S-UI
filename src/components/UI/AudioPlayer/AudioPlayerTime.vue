<template>
  <div :class="$style.container">
    <semi-fixed-size-text
      :class="$style.time"
      :actual="displayCurrentTime"
      :placeholder="displayTimeMaxText"
    />
    <div :class="$style.slash">/</div>
    <semi-fixed-size-text
      :class="$style.time"
      :actual="displayDuration"
      :placeholder="displayTimeMaxText"
    />
  </div>
</template>

<script lang="ts">
import { computed } from 'vue';

const getDisplayTime = (time: number) => {
  if (!Number.isFinite(time)) {
    return '0:00'
  }
  const min = Math.floor(time / 60)
  const sec = ('' + Math.floor(time % 60)).padStart(2, '0')
  return `${min}:${sec}`
}
const getDisplayTimeMaxText = (duration: string) => duration.replace(/\d/g, '0')
</script>

<script lang="ts" setup>
import SemiFixedSizeText from '/@/components/UI/SemiFixedSizeText.vue';

const props = defineProps<{
    currentTime: number,
    duration: number
}>();

const displayCurrentTime = computed(() => getDisplayTime(props.currentTime))
const displayDuration = computed(() => getDisplayTime(props.duration))
const displayTimeMaxText = computed(() =>
  getDisplayTimeMaxText(displayDuration.value)
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}
.slash {
  margin: 0 4px;
}
.time {
  position: relative;
}
.placeholder {
  visibility: hidden;
}
.actual {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
