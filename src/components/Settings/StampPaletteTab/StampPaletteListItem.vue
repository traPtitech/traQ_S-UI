<template>
  <div :class="$style.container">
    <StampPaletteListItemHeader :palette="palette" />
    <StampPaletteListItemStampList :stamps="stamps" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { StampPalette } from '/@/types/entity'

import StampPaletteListItemHeader from './StampPaletteListItemHeader.vue'
import StampPaletteListItemStampList from './StampPaletteListItemStampList.vue'

const { palette } = defineProps<{
  palette: StampPalette
}>()

const stamps = computed(() => palette.stamps)
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 4px;
}
</style>
