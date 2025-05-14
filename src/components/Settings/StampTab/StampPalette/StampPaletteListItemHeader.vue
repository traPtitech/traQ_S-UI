<template>
  <div :class="$style.container">
    <div :class="$style.name">{{ palette.name }}</div>
    <icon-button
      :class="$style.button"
      icon-name="pencil"
      icon-mdi
      @click="() => openStampPaletteEditModal(palette)"
    />
    <icon-button
      :class="$style.button"
      icon-name="delete"
      icon-mdi
      @click="() => deleteStampPalette(palette)"
    />
  </div>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import IconButton from '/@/components/UI/IconButton.vue'

const { palette } = defineProps<{
  palette: StampPalette
}>()

const openStampPaletteEditModal = async (palette: StampPalette) => {
  // TODO: implement open stamp palette edit modal
}

const deleteStampPalette = async (palette: StampPalette) => {
  // TODO: implement delete stamp palette
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  gap: 4px;
}
.name {
  @include background-primary;
  font-size: 16px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
}
.button {
  @include color-ui-secondary;
  padding: 4px;
  &:hover {
    @include background-primary;
  }
}
</style>
