<template>
  <section :class="$style.section">
    <div :class="$style.sectionHeader">
      <h3>パレット一覧</h3>
      <StampPaletteDescription />
    </div>
    <StampPaletteCreateLink />
    <div :class="$style.stampPaletteList">
      <div v-for="palette in stampPalettes" :key="palette.id">
        <StampPaletteListItem :palette="palette" />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useMeStore } from '/@/store/domain/me'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'

import StampPaletteCreateLink from './StampPaletteCreateLink.vue'
import StampPaletteDescription from './StampPaletteDescription.vue'
import StampPaletteListItem from './StampPaletteListItem.vue'

const { stampPalettesMap } = useStampPalettesStore()
const { myId } = useMeStore()

const stampPalettes = computed(() => {
  return [...stampPalettesMap.value.values()].filter(
    palette => palette.creatorId === myId.value
  )
})
</script>

<style lang="scss" module>
.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sectionHeader {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stampPaletteList {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  gap: 12px;
}
</style>
