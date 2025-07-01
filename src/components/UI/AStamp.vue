<template>
  <div :class="$style.container" :style="containerStyle">
    <img
      v-if="imageUrl.length > 0"
      :class="$style.img"
      :src="imageUrl"
      :alt="name"
      :title="!withoutTitle ? name : undefined"
      draggable="false"
      @contextmenu="noContextMenu ? $event.preventDefault() : undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { StampId } from '/@/types/entity-ids'
import { buildFilePath } from '/@/lib/apis'
import { useStampsStore } from '/@/store/entities/stamps'

const props = withDefaults(
  defineProps<{
    stampId: StampId
    size?: number
    withoutTitle?: boolean
    noContextMenu?: boolean
  }>(),
  {
    size: 24,
    withoutTitle: false
  }
)

const { stampsMap } = useStampsStore()

const name = computed(() => stampsMap.value.get(props.stampId)?.name ?? '')
const imageUrl = computed(() => {
  const fileId = stampsMap.value.get(props.stampId)?.fileId
  return fileId ? buildFilePath(fileId) : ''
})

const containerStyle = computed(() => ({
  width: `${props.size / 16}rem`,
  height: `${props.size / 16}rem`
}))
</script>

<style lang="scss" module>
.container {
  object-fit: contain;
  user-select: none;
  contain: content; // strictだと縦横比がうまくいかない
}

.img {
  max-height: 100%;
  margin: auto;
  html[data-stamp-edge='true'] & {
    filter: drop-shadow(0.1px 0.1px 0 rgb(255, 255, 255, 0.1))
      drop-shadow(0.1px -0.1px 0 rgb(255, 255, 255, 0.1))
      drop-shadow(-0.1px 0.1px 0 rgb(255, 255, 255, 0.1))
      drop-shadow(-0.1px -0.1px 0 rgb(255, 255, 255, 0.1));
  }
}
</style>
