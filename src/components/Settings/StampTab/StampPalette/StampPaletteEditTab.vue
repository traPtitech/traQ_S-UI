<template>
  <not-found-page v-if="stampPalette === undefined" />
  <section v-else>
    <h3>スタンプパレットの編集</h3>
    <stamp-palette-editor v-model="stampPalette" />
  </section>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import StampPaletteEditor from './StampPaletteEditor.vue'
import NotFoundPage from '/@/views/NotFoundPage.vue'

const stampPalette = defineModel<StampPalette>()
</script>

<style lang="scss" module></style>
