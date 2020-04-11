<template>
  <div>
    <span
      :style="[props.isCurrent ? styles.current : '']"
      :class="$style.channelHash"
      >#</span
    >
    <span :style="[props.isCurrent ? styles.current : '']">
      <router-link :to="props.isCurrent ? '' : props.link">{{
        props.name
      }}</router-link>
    </span>
    <div v-if="props.topic" :class="$style.topic">
      {{ props.topic }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

type Props = {
  name: string
  topic: string
  isCurrent: boolean
  link: string
}

const useStyles = () =>
  reactive({
    current: makeStyles(theme => ({
      color: theme.accent.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarRelationElement',
  props: {
    name: { type: String, required: true },
    topic: { type: String, default: '' },
    isCurrent: { type: Boolean, default: false },
    link: { type: String }
  },
  setup(props: Props) {
    const styles = useStyles()
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
$topiclSize: 1rem;

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}

.topic {
  font-weight: normal;
  font-size: $topiclSize;
  margin-top: -8px;
}
</style>
