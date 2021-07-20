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
import { defineComponent, computed } from 'vue'
import SemiFixedSizeText from '/@/components/UI/SemiFixedSizeText.vue'

const getDisplayTime = (time: number) => {
  if (!Number.isFinite(time)) {
    return '0:00'
  }
  const min = Math.floor(time / 60)
  const sec = ('' + Math.floor(time % 60)).padStart(2, '0')
  return `${min}:${sec}`
}
const getDisplayTimeMaxText = (duration: string) => duration.replace(/\d/g, '0')

export default defineComponent({
  name: 'AudioPlayerTime',
  components: {
    SemiFixedSizeText
  },
  props: {
    currentTime: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const displayCurrentTime = computed(() => getDisplayTime(props.currentTime))
    const displayDuration = computed(() => getDisplayTime(props.duration))
    const displayTimeMaxText = computed(() =>
      getDisplayTimeMaxText(displayDuration.value)
    )
    return { displayCurrentTime, displayDuration, displayTimeMaxText }
  }
})
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
