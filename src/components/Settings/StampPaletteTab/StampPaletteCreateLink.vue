<template>
  <router-link
    :to="constructSettingsStampPaletteCreatePath()"
    :class="$style.container"
  >
    <a-icon mdi name="plus" />
    新規作成
  </router-link>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import { constructSettingsStampPaletteCreatePath } from '/@/router/settingsStampPalette'
</script>

<style lang="scss" module>
.container {
  @include color-accent-primary;
  font-weight: bold;
  max-width: fit-content;
  position: relative;
  border: solid 2px;
  border-radius: 4px;
  border-color: $theme-accent-primary-default;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 32px;
}
</style>
