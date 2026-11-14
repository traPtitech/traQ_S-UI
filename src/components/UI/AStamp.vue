<template>
  <div :class="$style.container" :style="containerStyle">
    <img
      v-if="imageUrl.length > 0"
      v-stamp-shadow="stamp?.isUnicode ? undefined : stamp?.fileId"
      class="stamp-image"
      :class="$style.img"
      :data-unicode-stamp="stamp?.isUnicode || undefined"
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

import { buildFilePath } from '/@/lib/apis'
import { stampShadowDirective as vStampShadow } from '/@/lib/stampShadowDirective'
import { useStampsStore } from '/@/store/entities/stamps'
import type { StampId } from '/@/types/entity-ids'

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

const stamp = computed(() => stampsMap.value.get(props.stampId))
const name = computed(() => stamp.value?.name ?? 'unknown stamp')
const imageUrl = computed(() => {
  const fileId = stamp.value?.fileId
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
}
</style>
