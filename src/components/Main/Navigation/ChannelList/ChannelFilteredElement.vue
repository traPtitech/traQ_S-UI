<template>
  <div
    @click="onChannelSelect(props.id)"
    :style="[props.isCurrent ? styles.current : '']"
    :class="[props.isCurrent ? $style.current : '']"
  >
    <span :class="$style.channelHash">#</span>
    {{ props.name }}
    <div v-if="props.topic" :class="$style.topic">
      {{ props.topic }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useChannelSelect from '@/use/channelSelect'
import { transparentize } from '@/lib/util/color'

const useStyles = () =>
  reactive({
    current: makeStyles(theme => ({
      color: theme.accent.primary,
      backgroundColor: transparentize(theme.accent.primary, 0.1)
    }))
  })

export default defineComponent({
  name: 'ChannelFilteredElement',
  props: {
    name: { type: String, required: true },
    topic: { type: String, default: '' },
    isCurrent: { type: Boolean, default: false },
    id: { type: String, required: true }
  },
  setup(props) {
    const styles = useStyles()
    const { onChannelSelect } = useChannelSelect()

    return { props, styles, onChannelSelect }
  }
})
</script>

<style lang="scss" module>
$topicSize: 1rem;

.channelHash {
  margin-right: 0.125rem;
}
.topic {
  font-weight: normal;
  font-size: $topicSize;
}
.current {
  font-weight: bold;
}
</style>
