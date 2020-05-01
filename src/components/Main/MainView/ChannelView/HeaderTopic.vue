<template>
  <div v-if="topic" :class="$style.container" :style="styles.container">
    <div :class="$style.topic" :style="styles.topic">{{ topic }}</div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  PropType,
  computed
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'

import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { transparentize } from '@/lib/util/color'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary,
      borderColor: transparentize(theme.ui.secondary, 0.3)
    }))
  })

export default defineComponent({
  name: 'MainViewHeaderTopic',
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()
    const topic = computed(
      () => store.state.entities.channels[props.channelId]?.topic
    )
    return { styles, topic }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 16px;
  padding: 0 16px;
  border-left: {
    style: solid;
    width: 2px;
  }
}
.topic {
  width: 100%;
  font-size: 0.875rem;
  font-weight: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
