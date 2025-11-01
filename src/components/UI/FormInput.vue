<template>
  <div>
    <div :class="$style.labelContainer">
      <label v-if="label" :for="id" :class="$style.label">
        {{ label }}
      </label>
      <span v-if="errorMessage" :class="$style.errorMessage">
        {{ errorMessage }}
      </span>
    </div>

    <div
      :class="$style.inputContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
      :data-has-error="$boolAttr(errorMessage !== null)"
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
        @focus="onFocus"
      />
      <span v-if="suffix" :class="$style.suffix" @click="focus">
        {{ suffix }}
      </span>
      <LengthCount
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
        <AIcon
          :name="isPasswordShown ? 'eye-off-outline' : 'eye-outline'"
          mdi
          :class="$style.toggleIcon"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup generic="T extends string | number">
import { onMounted, shallowRef } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import LengthCount from '/@/components/UI/LengthCount.vue'
import useShowPassword from '/@/composables/dom/useShowPassword'
import useOnInput from '/@/composables/useOnInput'
import { randomString } from '/@/lib/basic/randomString'
import { isTouchDevice } from '/@/lib/dom/browser'

const modelValue = defineModel<T>({ required: true })

const props = withDefaults(
  defineProps<{
    type?: string
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
    errorMessage?: string | null
    maxLength?: number
    useChangeEvent?: boolean
    focusOnMount?: boolean
    selectOnFocus?: boolean
  }>(),
  {
    type: 'text',
    onSecondary: false,
    placeholder: '',
    useChangeEvent: false,
    focusOnMount: false,
    selectOnFocus: false,
    errorMessage: null
  }
)

const onInputInternal = useOnInput(modelValue)

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

const onFocus = () => {
  if (props.selectOnFocus) {
    inputRef.value?.select()
  }
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
.labelContainer {
  display: flex;
  gap: 0px 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.label {
  @include color-ui-primary;
  display: block;
}
.errorMessage {
  color: $theme-accent-error-default;
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
  &[data-has-error] {
    border-color: $theme-accent-error-default;
  }
  border: solid 2px transparent;
  &:not([data-has-error]):focus-within {
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
