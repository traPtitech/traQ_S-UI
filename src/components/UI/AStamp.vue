<template>
  <div :class="$style.container" :style="styles.container">
    <img
      v-if="imageUrl.length > 0"
      :class="$style.img"
      loading="lazy"
      :src="imageUrl"
      :alt="name"
      :title="!withoutTitle ? name : undefined"
      draggable="false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, PropType } from 'vue'
import store from '/@/store'
import { StampId } from '/@/types/entity-ids'
import { buildFilePath } from '/@/lib/apis'

const useStyles = (props: { size: number }) =>
  reactive({
    container: computed(() => ({
      width: `${props.size}px`,
      height: `${props.size}px`
    }))
  })

export default defineComponent({
  name: 'AStamp',
  props: {
    stampId: {
      type: String as PropType<StampId>,
      required: true
    },
    size: {
      type: Number,
      default: 24
    },
    withoutTitle: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const name = computed(
      () => store.state.entities.stampsMap.get(props.stampId)?.name ?? ''
    )
    const imageUrl = computed(() => {
      const fileId = store.state.entities.stampsMap.get(props.stampId)?.fileId
      return fileId ? `${buildFilePath(fileId)}` : ''
    })
    const styles = useStyles(props)
    return { imageUrl, name, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  object-fit: contain;
  user-select: none;
  contain: content; // strictだと縦横比がうまくいかない
}

.img {
  html[data-stamp-edge] & {
    filter: drop-shadow(0.1px 0.1px 0 rgb(255, 255, 255, 0.1))
      drop-shadow(0.1px -0.1px 0 rgb(255, 255, 255, 0.1))
      drop-shadow(-0.1px 0.1px 0 rgb(255, 255, 255, 0.1))
      drop-shadow(-0.1px -0.1px 0 rgb(255, 255, 255, 0.1));
  }
}
</style>
