<template>
  <h3>スタンプパレットの作成</h3>
  <stamp-palette-editor v-model="newStampPalette" />
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import StampPaletteEditor from './StampPaletteEditor.vue'

const newStampPalette: StampPalette = {
  id: '',
  name: '',
  stamps: [],
  creatorId: '',
  createdAt: '',
  updatedAt: '',
  description: ''
}
</script>

<style lang="scss" module></style>
