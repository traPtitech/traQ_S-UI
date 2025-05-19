<template>
  <div>
    <label :class="$style.label">
      パレット名
      <FormInput v-model="nameModel" :class="$style.form" />
    </label>
    <label :class="$style.label">
      説明
      <FormTextArea v-model="descriptionModel" :class="$style.form" />
    </label>
  </div>
</template>

<script lang="ts" setup>
import FormInput from '/@/components/UI/FormInput.vue'
import FormTextArea from '/@/components/UI/FormTextArea.vue'

const nameModel = defineModel<string>('name', { required: true })
const descriptionModel = defineModel<string>('description', { required: true })
</script>

<style lang="scss" module>
.label {
  display: block;
  font-weight: bold;
  border-radius: 4px;
}

.form {
  width: 100%;
}
</style>
