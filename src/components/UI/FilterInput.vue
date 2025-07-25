<template>
  <div
    :class="$style.container"
    :data-on-secondary="$boolAttr(onSecondary)"
    @click="focus"
  >
    <a-icon mdi name="search" :size="18" :class="$style.icon" />
    <input
      ref="inputRef"
      :class="$style.input"
      :value="modelValue"
      :placeholder="placeholder"
      :autocapitalize="autocapitalize"
      :type="disableIme ? 'url' : 'text'"
      :title="title"
      :data-disable-ime="$boolAttr(disableIme)"
      :enterkeyhint="enterkeyhint"
      @input="onInput"
      @keydown.esc.stop="reset"
      @keydown.enter="emit('enter')"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, shallowRef } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import useOnInput from '/@/composables/useOnInput'
import { isTouchDevice } from '/@/lib/dom/browser'

const modelValue = defineModel<string>('modelValue', { default: '' })

const props = withDefaults(
  defineProps<{
    onSecondary?: boolean
    placeholder?: string
    autocapitalize?: string
    disableIme?: boolean
    title?: string
    focusOnMount?: boolean
    enterkeyhint?: string
  }>(),
  {
    onSecondary: false,
    placeholder: '',
    autocapitalize: 'off',
    disableIme: false,
    title: '',
    focusOnMount: false,
    enterkeyhint: 'search'
  }
)

const emit = defineEmits<{
  (e: 'enter'): void
}>()

const onInput = useOnInput(modelValue)

const reset = () => {
  modelValue.value = ''
}

const inputRef = shallowRef<HTMLInputElement | null>(null)
const focus = () => {
  inputRef.value?.focus()
}
onMounted(() => {
  if (!props.focusOnMount || isTouchDevice()) return
  focus()
})

defineExpose({ focus })
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
  @include size-body1;
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 4px;
  &[data-on-secondary] {
    @include background-primary;
  }

  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.icon {
  margin-right: 8px;
  flex-shrink: 0;
}
.input {
  @include color-ui-primary;
  width: 100%;
  &[data-disable-ime] {
    ime-mode: disabled;
  }
}
</style>
