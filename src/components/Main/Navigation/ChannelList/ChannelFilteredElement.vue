<template>
  <div
    @click="onChannelSelect(id)"
    :style="[isCurrent ? styles.current : '']"
    :class="[isCurrent ? $style.current : '']"
  >
    <div :class="$style.channelNameContainer">
      <div :class="$style.channelHash">#</div>
      <div :class="$style.name">{{ name }}</div>
    </div>
    <div v-if="topic" :class="$style.topic">
      {{ topic }}
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
  setup() {
    const styles = useStyles()
    const { onChannelSelect } = useChannelSelect()

    return { styles, onChannelSelect }
  }
})
</script>

<style lang="scss" module>
$channelNameSize: 1.125rem;
$topicSize: 0.875rem;

.channelNameContainer {
  display: flex;
  align-items: center;
  font: {
    size: $channelNameSize;
    weight: bold;
  }
}
.channelHash {
  flex-shrink: 0;
  margin-right: 0.125rem;
}
.name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.topic {
  font-weight: normal;
  font-size: $topicSize;
}
.current {
  font-weight: bold;
}
</style>
