<template>
  <img loading="lazy" :class="$style.container" :src="imageUrl" :alt="name" />
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import { buildStampImagePath } from '@/lib/api'

type Props = {
  stampId: StampId
  size: number
}

const useStyles = (props: Props) =>
  reactive({
    container: makeStyles(theme => ({
      width: `${props.size}px`,
      height: `${props.size}px`
    }))
  })

export default defineComponent({
  name: 'Stamp',
  props: {
    stampId: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 24
    }
  },
  setup(props: Props) {
    const stamp = store.state.entities.stamps[props.stampId]
    const fileId = stamp?.fileId ?? ''
    const name = stamp?.name ?? ''
    const imageUrl = fileId ? `${buildStampImagePath(fileId)}` : ''
    const styles = useStyles(props)
    return { props, imageUrl, name, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  user-select: none;
}
</style>
