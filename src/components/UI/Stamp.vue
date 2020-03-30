<template>
  <img
    v-if="imageUrl.length > 0"
    loading="lazy"
    :class="$style.container"
    :style="styles.container"
    :src="imageUrl"
    :alt="name"
  />
  <div v-else :class="$style.container" :style="styles.noImageContainer" />
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
      maxWidth: `${props.size}px`,
      maxHeight: `${props.size}px`
    })),
    noImageContainer: makeStyles(theme => ({
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
    const name = computed(
      () => store.state.entities.stamps[props.stampId]?.name ?? ''
    )
    const imageUrl = computed(() => {
      const fileId = store.state.entities.stamps[props.stampId]?.fileId
      return fileId ? `${buildStampImagePath(fileId)}` : ''
    })
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
