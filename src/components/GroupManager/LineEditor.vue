<template>
  <div>
    <div :class="$style.label">{{ label }}</div>
    <div v-if="isEditing" :class="$style.inputWrapper">
      <form-input
        v-model="localValue"
        :class="$style.input"
        :max-length="maxLength"
        on-secondary
      />
      <icon-button
        icon-name="check"
        icon-mdi
        :size="20"
        :class="$style.iconButton"
        @click="endEditing"
      />
    </div>
    <div v-else :class="$style.valueWrapper">
      <div :class="$style.value" :data-is-empty="localValue === ''">
        {{ localValue || `${label}が設定されていません` }}
      </div>
      <icon-button
        icon-name="pencil-outline"
        icon-mdi
        :size="20"
        :class="$style.iconButton"
        @click="startEditing"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormInput from '/@/components/UI/FormInput.vue'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import useLocalInput from '/@/composables/utils/useLocalInput'
import useToggle from '/@/composables/utils/useToggle'
import IconButton from '/@/components/UI/IconButton.vue'

const props = defineProps<{
  label: string
  modelValue: string
  maxLength?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', _value: string): void
}>()

const remoteValue = useModelValueSyncer(props, emit)
const { localValue, isEditing } = useLocalInput(
  remoteValue,
  newValue => {
    remoteValue.value = newValue
    return true
  },
  true // キャンセルするUIがないため
)
const { open: startEditing, close: endEditing } = useToggle(isEditing)
</script>

<style lang="scss" module>
.label {
  @include color-ui-primary;
  font-weight: bold;
}
.iconButton {
  @include color-ui-primary-inactive;
  margin-left: 4px;
  cursor: pointer;
  &:hover,
  &:focus {
    @include color-ui-primary;
  }
}

.inputWrapper {
  @include color-ui-primary;
  display: flex;
  align-items: center;
}
.input {
  flex: 1;
}

.valueWrapper {
  display: flex;
  align-items: center;
}
.value {
  @include color-ui-primary;
  flex: 1;
  height: 24px;
  // inputに合わせるため4pxの倍数でない
  margin: 3px 0;
  &[data-is-empty='true'] {
    @include color-ui-primary-inactive;
  }
}
</style>
