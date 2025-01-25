<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useQall } from '/@/composables/qall/useQall'
import FormButton from '/@/components/UI/FormButton.vue'
import ClickOutside from '/@/components/UI/ClickOutside'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'close'): void
}>()

const { addScreenShareTrack } = useQall()

const handleScreenShare = () => {
  addScreenShareTrack()
  emit('add')
  emit('close')
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <ClickOutside @click-outside="handleClose">
    <div v-if="open" :class="$style.popoverContainer">
      <div :class="$style.popoverContent">
        <h3 :class="$style.popoverTitle">画面共有の設定</h3>
        <div :class="$style.actions">
          <FormButton
            label="画面共有を追加"
            type="primary"
            @click="handleScreenShare"
          />
        </div>
      </div>
    </div>
  </ClickOutside>
</template>

<style module lang="scss">
.popoverContainer {
  position: absolute;
  z-index: 50;
  bottom: 0;
}

.popoverContent {
  @include background-primary;
  @include color-ui-primary;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid $theme-text-primary-default;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 15rem;
}

.popoverTitle {
  font-size: 1.25rem;
  margin-bottom: 16px;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
</style>
