<template>
  <div>
    <div :class="$style.labelContainer">
      <label v-if="label" :for="id" :class="$style.label">
        {{ label }}
      </label>
      <span v-if="hasError" :class="$style.errorMessage">
        {{ errorMessage }}
      </span>
    </div>
    <div v-if="isEditing" :class="$style.inputWrapper">
      <FormInput
        :id="id"
        ref="inputRef"
        v-model="localValue"
        :class="$style.input"
        :max-length="maxLength"
        on-secondary
        :error-message="hasError ? '' : null"
        @input="emit('update:localValue', localValue)"
      />
      <AIcon
        name="check"
        mdi
        :class="$style.icon"
        :size="20"
        :data-has-error="$boolAttr(hasError)"
        @click="endEditing"
      />
    </div>
    <div v-else :class="$style.valueWrapper">
      <div :class="$style.value" :data-is-empty="localValue === ''">
        {{ localValue || `${label}が設定されていません` }}
      </div>
      <AIcon
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
import { computed, nextTick, ref, useId } from 'vue'
import type { ComponentExposed } from 'vue-component-type-helpers'
import AIcon from '/@/components/UI/AIcon.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import useLocalInput from '/@/composables/utils/useLocalInput'
import useToggle from '/@/composables/utils/useToggle'

const remoteValue = defineModel<string>({ required: true })
const id = useId()

const props = withDefaults(
  defineProps<{
    label: string
    maxLength?: number
    errorMessage?: string | null
  }>(),
  {
    errorMessage: null
  }
)

const emit = defineEmits<{
  (e: 'update:localValue', value: string): void
}>()

const hasError = computed(() => props.errorMessage !== null)

const inputRef = ref<ComponentExposed<typeof FormInput> | null>(null)

const { localValue, isEditing } = useLocalInput(
  remoteValue,
  newValue => {
    remoteValue.value = newValue
    return true
  },
  true // キャンセルするUIがないため
)
const { open, close } = useToggle(isEditing)

const startEditing = async () => {
  open()
  await nextTick()
  if (isEditing.value) {
    inputRef.value?.focus()
  }
}

const endEditing = () => {
  if (hasError.value) return
  close()
}
</script>

<style lang="scss" module>
.labelContainer {
  display: flex;
  gap: 0px 8px;
  flex-wrap: wrap;
}
.label {
  @include color-ui-primary;
  font-weight: bold;
}
.errorMessage {
  color: $theme-accent-error-default;
}
.icon {
  @include color-ui-primary-inactive;
  margin-left: 4px;
  cursor: pointer;
  &:not([data-has-error]):hover {
    @include color-ui-primary;
  }
  &[data-has-error] {
    cursor: not-allowed;
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
