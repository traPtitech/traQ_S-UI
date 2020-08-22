<template>
  <div :class="$style.container">
    <div :style="styles.time" :class="$style.time">
      {{ displayCurrentTime }}
    </div>
    <div :class="$style.slash">/</div>
    <div :style="styles.time" :class="$style.time">
      {{ displayDuration }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyles = (props: { timeWidth: number }) =>
  reactive({
    time: makeStyles(() => ({
      width: props.timeWidth > 0 ? `${props.timeWidth}px` : 'auto'
    }))
  })

export default defineComponent({
  name: 'ChromeAudioTime',
  props: {
    displayCurrentTime: {
      type: String,
      required: true
    },
    displayDuration: {
      type: String,
      required: true
    },
    timeWidth: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles(props)
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.time {
  font-size: 0.8rem;
}
.slash {
  font-size: 0.8rem;
  margin: 0 4px;
}
</style>
