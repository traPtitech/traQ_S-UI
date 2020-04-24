<template>
  <div
    @click="onChannelSelect(propst.id)"
    :style="[propst.isCurrent ? styles.current : '']"
  >
    <span :class="$style.channelHash">#</span>
    {{ propst.name }}
    <div v-if="propst.topic" :class="$style.topic">
      {{ propst.topic }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import useChannelSelect from '@/use/channelSelect'

const useStyles = () =>
  reactive({
    current: makeStyles(theme => ({
      color: theme.accent.primary,
      backgroundColor: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'ChannelFilteredElement',
  props: {
    name: { type: String, required: true },
    topic: { type: String, default: '' },
    isCurrent: { type: Boolean, default: false },
    id: { type: String }
  },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as {
      name: string
      topic: string
      isCurrent: boolean
      id: string
    }
    const styles = useStyles()
    const { onChannelSelect } = useChannelSelect()

    return { propst, styles, onChannelSelect }
  }
})
</script>

<style lang="scss" module>
$topiclSize: 1rem;

.channelHash {
  margin-right: 0.125rem;
}

.topic {
  font-weight: normal;
  font-size: $topiclSize;
}
</style>
