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
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import { buildFilePath } from '@/lib/apis'

const useStyles = (props: { size: number }) =>
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
      type: String as PropType<StampId>,
      required: true
    },
    size: {
      type: Number,
      default: 24
    }
  },
  setup(props) {
    const name = computed(
      () => store.state.entities.stamps[props.stampId]?.name ?? ''
    )
    const imageUrl = computed(() => {
      const fileId = store.state.entities.stamps[props.stampId]?.fileId
      return fileId ? `${buildFilePath(fileId)}` : ''
    })
    const styles = useStyles(props)
    return { imageUrl, name, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  user-select: none;
}
</style>
