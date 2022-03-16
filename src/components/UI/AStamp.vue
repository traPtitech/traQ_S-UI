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
import { reactive, computed } from 'vue';
import { StampId } from '/@/types/entity-ids'
import { buildFilePath } from '/@/lib/apis'
import { useStampsStore } from '/@/store/entities/stamps'

const useStyles = (props: { size: number }) =>
  reactive({
    container: computed(() => ({
      width: `${props.size}px`,
      height: `${props.size}px`
    }))
  })
</script>

<script lang="ts" setup>


const props = withDefaults(defineProps<{
    stampId: StampId,
    size?: number,
    withoutTitle?: boolean
}>(), {
    size: 24,
    withoutTitle: false
});

const { stampsMap } = useStampsStore()

const name = computed(() => stampsMap.value.get(props.stampId)?.name ?? '')
const imageUrl = computed(() => {
  const fileId = stampsMap.value.get(props.stampId)?.fileId
  return fileId ? `${buildFilePath(fileId)}` : ''
})
const styles = useStyles(props)
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
