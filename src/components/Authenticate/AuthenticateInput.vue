<template>
  <div>
    <label :for="id" :class="$style.title">{{ label }}</label>
    <div :class="$style.container">
      <input
        :id="id"
        :class="$style.input"
        :value="modelValue"
        :type="typeWithShown"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :autocapitalize="autocapitalize"
        :enterkeyhint="enterkeyhint"
        @input="onInput"
      />
      <button
        v-if="type === 'password'"
        type="button"
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
import useShowPassword from '/@/composables/dom/useShowPassword'
import useOnInput from '/@/composables/useOnInput'
import { randomString } from '/@/lib/basic/randomString'

const modelValue = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    label?: string
    type?: 'text' | 'password'
    autocomplete?: string
    autofocus?: boolean
    autocapitalize?: string
    enterkeyhint?: string
  }>(),
  {
    label: '',
    type: 'text' as const,
    autofocus: false,
    autocapitalize: 'off'
  }
)

const onInput = useOnInput(modelValue)

const id = randomString()

const { isPasswordShown, togglePassword, typeWithShown } =
  useShowPassword(props)
</script>

<style lang="scss" module>
.title {
  @include color-ui-secondary;
  margin-bottom: 16px;
  font: {
    size: 1rem;
    weight: bold;
  }
}
.container {
  @include background-secondary;
  display: flex;
  border-radius: 4px;
}
.input {
  @include color-text-primary;
  width: 100%;
  height: 2rem;
  padding: 0.5rem;
}
.toggle {
  @include color-ui-secondary;
  height: 100%;
  padding: 0.25rem;
  padding-left: 0;
  cursor: pointer;
}
.toggleIcon {
  vertical-align: middle;
}
</style>
