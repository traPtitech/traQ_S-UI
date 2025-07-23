<template>
  <div>
    <div :class="$style.label">
      {{ label }}
    </div>
    <div v-if="isEditing" :class="$style.inputWrapper">
      <form-input
        ref="inputRef"
        :model-value="localValue as string"
        :class="$style.input"
        :max-length="maxLength"
        on-secondary
        @update:model-value="
          (val: string | number) => (localValue = val as string)
        "
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
import { nextTick, ref } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import useLocalInput from '/@/composables/utils/useLocalInput'
import useToggle from '/@/composables/utils/useToggle'

const remoteValue = defineModel<string>({ required: true })

defineProps<{
  label: string
  maxLength?: number
}>()

const inputRef = ref<InstanceType<typeof FormInput> | null>(null)

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
