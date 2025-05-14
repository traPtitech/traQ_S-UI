<template>
  <div :class="$style.outerContainer">
    <stamp-palette-management-header />
    <stamp-palette-list />
  </div>
</template>

<script lang="ts" setup>
import StampPaletteList from '/@/components/Settings/StampTab/StampPalette/StampPaletteList.vue'
import StampPaletteManagementHeader from '/@/components/Settings/StampTab/StampPalette/StampPaletteManagementHeader.vue'
</script>

<style lang="scss" module>
.outerContainer {
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
