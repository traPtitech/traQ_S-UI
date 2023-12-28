<template>
  <div>
    <div :class="$style.label">{{ label }}</div>
    <div v-if="isEditing" :class="$style.inputWrapper">
      <form-input
        ref="inputRef"
        v-model="localValue"
        :class="$style.input"
        :max-length="maxLength"
        on-secondary
      />
      <a-icon
        name="check"
        mdi
        :class="$style.icon"
        :size="20"
        @click="endEditing"
      />
    </div>
    <div v-else :class="$style.valueWrapper">
      <div :class="$style.value" :data-is-empty="localValue === ''">
        {{ localValue || `${label}が設定されていません` }}
      </div>
      <a-icon
        name="pencil-outline"
        mdi
        :class="$style.icon"
        :size="20"
        @click="startEditing"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormInput from '/@/components/UI/FormInput.vue'
import AIcon from '/@/components/UI/AIcon.vue'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import useLocalInput from '/@/composables/utils/useLocalInput'
import useToggle from '/@/composables/utils/useToggle'
import { ref, nextTick } from 'vue'

const props = defineProps<{
  label: string
  modelValue: string
  maxLength?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', _value: string): void
}>()

const inputRef = ref<InstanceType<typeof FormInput> | null>(null)

const remoteValue = useModelValueSyncer(props, emit)
const { localValue, isEditing } = useLocalInput(
  remoteValue,
  newValue => {
    remoteValue.value = newValue
    return true
  },
  true // キャンセルするUIがないため
)
const { open, close: endEditing } = useToggle(isEditing)

const startEditing = async () => {
  open()
  await nextTick()
  if (isEditing.value) {
    inputRef.value?.focus()
  }
}
</script>

<style lang="scss" module>
.label {
  @include color-ui-primary;
  font-weight: bold;
}
.icon {
  @include color-ui-primary-inactive;
  margin-left: 4px;
  cursor: pointer;
  &:hover {
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
