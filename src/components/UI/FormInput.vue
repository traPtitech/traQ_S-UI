<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div
      :class="$style.inputContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
    >
      <span v-if="prefix" :class="$style.prefix" @click="focus">
        {{ prefix }}
      </span>
      <input
        :id="id"
        ref="inputRef"
        :class="$style.input"
        :type="typeWithShown"
        :value="modelValue"
        :name="name"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :max="max"
        :min="min"
        :step="step"
        @input="onInput"
        @change="onChange"
      />
      <span v-if="suffix" :class="$style.suffix" @click="focus">
        {{ suffix }}
      </span>
      <length-count
        v-if="maxLength && typeof modelValue === 'string'"
        :class="$style.count"
        :val="modelValue"
        :max-length="maxLength"
      />
      <button
        v-if="type === 'password'"
        :title="`パスワードを${isPasswordShown ? '非表示' : '表示'}`"
        :class="$style.toggle"
        @click.prevent="togglePassword"
      >
        <a-icon
          :name="isPasswordShown ? 'eye-off-outline' : 'eye-outline'"
          mdi
          :class="$style.toggleIcon"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import LengthCount from '/@/components/UI/LengthCount.vue'
import { onMounted, shallowRef } from 'vue'
import { randomString } from '/@/lib/basic/randomString'
import useInput from '/@/composables/useInput'
import useShowPassword from '/@/composables/dom/useShowPassword'
import { isTouchDevice } from '/@/lib/dom/browser'

const props = withDefaults(
  defineProps<{
    type?: string
    modelValue?: string | number
    onSecondary?: boolean
    placeholder?: string
    name?: string
    autocomplete?: string
    label?: string
    prefix?: string
    suffix?: string
    min?: string
    max?: string
    step?: string
    maxLength?: number
    useChangeEvent?: boolean
    focusOnMount?: boolean
  }>(),
  {
    type: 'text',
    modelValue: '',
    onSecondary: false,
    placeholder: '',
    useChangeEvent: false,
    focusOnMount: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', _val: string | number): void
}>()

const { onInput: onInputInternal } = useInput(emit, 'update:modelValue')

const onInput = (e: Event) => {
  if (props.useChangeEvent) return
  onInputInternal(e)
}
const onChange = (e: Event) => {
  if (!props.useChangeEvent) return
  onInputInternal(e)
}

const inputRef = shallowRef<HTMLInputElement | null>(null)
const focus = () => {
  inputRef.value?.focus()
}

const id = randomString()

const { isPasswordShown, togglePassword, typeWithShown } =
  useShowPassword(props)

onMounted(() => {
  if (!props.focusOnMount || isTouchDevice()) return
  focus()
})

defineExpose({ focus })
</script>

<style lang="scss" module>
.label {
  @include color-ui-primary;
  display: block;
  margin-bottom: 4px;
}
.inputContainer {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  height: 30px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  &[data-on-secondary] {
    @include background-primary;
  }
  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.prefix {
  margin-left: 8px;
}
.input {
  margin: 0 8px;
  width: 100%;
  color: inherit;
}
.suffix {
  margin-right: 8px;
}
.count {
  margin-right: 4px;
}
.toggle {
  @include color-ui-primary;
  height: 100%;
  margin-right: 4px;
  cursor: pointer;
}
.toggleIcon {
  vertical-align: middle;
}
</style>
