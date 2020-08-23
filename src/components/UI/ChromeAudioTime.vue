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
      align="left"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import SemiFixedSizeText from '@/components/UI/SemiFixedSizeText.vue'

const getDisplayTimeMaxText = (duration: string) => duration.replace(/\d/g, '0')

export default defineComponent({
  name: 'ChromeAudioTime',
  components: {
    SemiFixedSizeText
  },
  props: {
    displayCurrentTime: {
      type: String,
      required: true
    },
    displayDuration: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const displayTimeMaxText = computed(() =>
      getDisplayTimeMaxText(props.displayDuration)
    )
    return { displayTimeMaxText }
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
