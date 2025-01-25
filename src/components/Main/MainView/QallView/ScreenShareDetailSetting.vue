<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import FormButton from '/@/components/UI/FormButton.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { addScreenShareTrack } = useQall()

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div v-if="open" class="popover-container">
    <div class="popover-content">
      <h3 class="popover-title">画面共有設定</h3>
      <div class="actions">
        <FormButton
          label="画面共有を追加"
          type="tertiary"
          @click="addScreenShareTrack"
        />
        <FormButton label="閉じる" type="secondary" @click="handleClose" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.popover-container {
  position: absolute;
  z-index: 50;
}

.popover-content {
  @include background-primary;
  @include color-ui-primary;
  padding: 24px;
  border-radius: 8px;
  width: 500px;
  border: 1px solid $theme-text-primary-default;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.popover-title {
  font-size: 1.25rem;
  margin-bottom: 16px;
  font-weight: bold;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item-label {
  font-weight: bold;
}

.input {
  padding: 8px;
  border-radius: 4px;
  @include background-primary;
  @include color-ui-primary;
  border: 1px solid $theme-ui-secondary-default;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-label {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.file-button {
  position: relative;
  padding: 12px 16px;
  border-radius: 4px;
  @include background-primary;
  @include color-ui-primary;
  border: 1px solid $theme-ui-secondary-default;
  cursor: pointer;
  overflow: hidden;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.file-name {
  font-size: 0.875rem;
  color: $theme-text-secondary-default;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
</style>
