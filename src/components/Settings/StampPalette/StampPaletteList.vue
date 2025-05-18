<template>
  <section :class="$style.container">
    <h3>パレット一覧</h3>
    <stamp-palette-create-link />
    <div :class="$style.stampPaletteList">
      <!-- FIXME: おそらくスタンプパレットのスタンプの総数が多い時に重くなる -->
      <div v-for="palette in stampPalettes" :key="palette.id">
        <stamp-palette-list-item :palette="palette" />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import StampPaletteCreateLink from './StampPaletteCreateLink.vue'
import StampPaletteListItem from './StampPaletteListItem.vue'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'

const { stampPalettesMap } = useStampPalettesStore()

const stampPalettes = computed(() => {
  const palettes = [...stampPalettesMap.value.values()]
  return palettes.length > 0 ? palettes : []
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stampPaletteList {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  gap: 12px;
}
</style>
