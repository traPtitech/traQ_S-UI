<template>
  <div>
    <div :class="$style.buttons">
      <FormButton label="キャンセル" type="tertiary" @click="emit('cancel')" />
      <FormButton
        label="確定"
        type="primary"
        :disabled="!isPaletteValid"
        @click="emit('finalize')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import FormButton from '/@/components/UI/FormButton.vue'
import type { StampPalette } from '/@/types/entity'

import { isStampPaletteValid } from './utils'

const { palette } = defineProps<{
  palette: StampPalette
}>()

const emit = defineEmits<{
  (e: 'finalize'): void
  (e: 'cancel'): void
}>()

const isPaletteValid = computed(() => isStampPaletteValid(palette))
</script>

<style lang="scss" module>
.errorMessage {
  @include color-ui-secondary;
  text-align: right;
}
.buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
