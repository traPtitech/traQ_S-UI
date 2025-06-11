<template>
  <div :class="$style.container">
    <stamp-palette-editor-basic-info
      v-model:name="name"
      v-model:description="description"
    />
    <stamp-palette-editor-sortable-stamp-list v-model:stamp-ids="stamps" />
    <stamp-palette-editor-add-stamp :current-stamp-ids="stamps" />
  </div>
</template>

<script lang="ts" setup>
import type { StampPalette } from '@traptitech/traq'
import { computed } from 'vue'
import StampPaletteEditorAddStamp from './StampPaletteEditorAddableStampList.vue'
import StampPaletteEditorBasicInfo from './StampPaletteEditorBasicInfo.vue'
import StampPaletteEditorSortableStampList from './StampPaletteEditorSortableStampList.vue'
import type { StampId } from '/@/types/entity-ids'

const stampPaletteModel = defineModel<StampPalette>('palette', {
  required: true
})

const name = computed({
  get: () => stampPaletteModel.value.name,
  set: val => {
    stampPaletteModel.value = { ...stampPaletteModel.value, name: val }
  }
})

const description = computed({
  get: () => stampPaletteModel.value.description,
  set: val => {
    stampPaletteModel.value = { ...stampPaletteModel.value, description: val }
  }
})

const stamps = computed({
  get: () => stampPaletteModel.value.stamps,
  set: (val: StampId[]) => {
    stampPaletteModel.value = {
      ...stampPaletteModel.value,
      stamps: val
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
