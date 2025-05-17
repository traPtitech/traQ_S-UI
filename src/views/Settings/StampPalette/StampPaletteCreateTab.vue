<template>
  <section>
    <h3>パレットの作成</h3>
    <stamp-palette-editor v-model="newStampPalette" />
    <!-- TODO: キャンセルボタン、保存ボタン、確定ボタンの実装 -->
  </section>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import StampPaletteEditor from '/@/components/Settings/StampPalette/StampPaletteEditor.vue'

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
