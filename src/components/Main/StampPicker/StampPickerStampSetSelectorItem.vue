<template>
  <div
    :class="$style.container"
    :aria-selected="isActive"
    @click="emit('click')"
  >
    <div v-if="isActive" :class="$style.indicator" />
    <a-stamp
      v-if="stampSet.type === 'palette'"
      :stamp-id="pickThumbnail(stampSet.id)"
      :size="24"
      :class="$style.paletteStamp"
    />
    <a-icon
      v-else-if="stampSet.type === 'category'"
      :name="`stampCategory/${stampSet.id}`"
      :size="24"
      :class="$style.icon"
    />
    <a-icon
      v-else-if="stampSet.type === 'history'"
      mdi
      name="history"
      :size="24"
      :class="$style.icon"
    />
  </div>
</template>

<script lang="ts" setup>
import type { StampPaletteId } from '/@/types/entity-ids'
import type { StampSet } from './composables/useStampSetSelector'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import AIcon from '/@/components/UI/AIcon.vue'
import AStamp from '/@/components/UI/AStamp.vue'

withDefaults(
  defineProps<{
    stampSet: StampSet
    isActive?: boolean
  }>(),
  {
    isActive: false
  }
)

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { stampPalettesMap } = useStampPalettesStore()
const pickThumbnail = (paletteId: StampPaletteId) => {
  const palette = stampPalettesMap.value.get(paletteId)
  if (!palette) return ''
  if ((palette.stamps?.length ?? 0) > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return palette.stamps[0]!
  }
  return ''
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
  align-items: center;
  position: relative;
  height: 36px;
  cursor: pointer;
  &[aria-selected='true'] {
    @include color-accent-primary;
  }
}
.indicator {
  @include background-accent-primary;
  position: absolute;
  width: 32px;
  height: 2px;
  bottom: 0;
  left: -4px;
}
.paletteStamp {
  opacity: 0.5;
  filter: grayscale(1);
  .container[aria-selected='true'] & {
    opacity: 1;
    filter: initial;
  }
  .container:hover & {
    opacity: 1;
  }
}
.icon {
  opacity: 0.5;
  .container[aria-selected='true'] &,
  .container:hover & {
    opacity: 1;
  }
}
</style>
