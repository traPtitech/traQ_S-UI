<template>
  <div :class="$style.container">
    <label :class="$style.formGroup">
      <span :class="$style.label">パレット名</span>
      <form-input
        v-model="nameModel"
        select-on-focus
        placeholder="パレット名は必須項目です"
        :max-length="STAMP_PALETTE_NAME_MAX_LENGTH"
        :class="$style.form"
      />
    </label>
    <label :class="$style.formGroup">
      <span :class="$style.label">説明</span>
      <form-text-area
        v-model="descriptionModel"
        :max-length="STAMP_PALETTE_DESCRIPTION_MAX_LENGTH"
        :class="$style.form"
      />
    </label>
  </div>
</template>

<script lang="ts" setup>
import {
  STAMP_PALETTE_DESCRIPTION_MAX_LENGTH,
  STAMP_PALETTE_NAME_MAX_LENGTH
} from './utils'
import FormInput from '/@/components/UI/FormInput.vue'
import FormTextArea from '/@/components/UI/FormTextArea.vue'

const nameModel = defineModel<string>('name', { required: true })
const descriptionModel = defineModel<string>('description', { required: true })
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.formGroup {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label {
  font-weight: bold;
}
.form {
  width: 100%;
  border-radius: 4px;
}
.limitIndicator {
  text-align: right;
}
</style>
