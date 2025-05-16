<template>
  <div :class="$style.outerContainer">
    <stamp-palette-management-description />
    <stamp-palette-list />
  </div>
</template>

<script lang="ts" setup>
import StampPaletteList from '/@/components/Settings/StampPalette/StampPaletteList.vue'
import StampPaletteManagementDescription from '/@/components/Settings/StampPalette/StampPaletteManagementDescription.vue'
</script>

<style lang="scss" module>
.outerContainer {
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
