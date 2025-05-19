<template>
  <div :class="$style.container">
    <stamp-palette-list-item-header :palette="palette" />
    <div :class="$style.stamps">
      <div v-for="stampId in palette.stamps" :key="stampId">
        <a-stamp :stamp-id="stampId" />
      </div>
      <icon-button
        :class="$style.addButton"
        icon-name="plus"
        icon-mdi
        @click="addStampToStampPalette"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import StampPaletteListItemHeader from './StampPaletteListItemHeader.vue'
import AStamp from '/@/components/UI/AStamp.vue'
import IconButton from '/@/components/UI/IconButton.vue'

const { palette } = defineProps<{
  palette: StampPalette
}>()

const addStampToStampPalette = async () => {
  // TODO: implement add stamp to stamp palette
}
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
.addButton {
  @include color-ui-secondary;
  &:hover {
    @include background-primary;
  }
}
.stamps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
