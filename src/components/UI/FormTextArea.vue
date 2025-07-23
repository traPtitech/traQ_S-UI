<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div
      :class="$style.inputContainer"
      :data-on-secondary="$boolAttr(onSecondary)"
    >
      <textarea-autosize
        :id="id"
        ref="inputRef"
        v-model="modelValue"
        :class="$style.input"
        :name="name"
        :placeholder="placeholder"
        :style="style"
        :rows="rows"
      />
      <length-count
        :class="$style.count"
        :val="modelValue"
        :max-length="maxLength"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import LengthCount from '/@/components/UI/LengthCount.vue'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
import { randomString } from '/@/lib/basic/randomString'

const modelValue = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    onSecondary?: boolean
    placeholder?: string
    name?: string
    label?: string
    maxHeight?: number
    maxLength?: number
    rows?: string
  }>(),
  {
    onSecondary: false,
    placeholder: '',
    rows: '1'
  }
)

const style = computed(() => ({ maxHeight: props.maxHeight }))

const inputRef = shallowRef<HTMLInputElement | null>(null)

const id = randomString()
</script>

<style lang="scss" module>
.label {
  @include color-ui-secondary;
  display: block;
  margin-bottom: 8px;
}
.inputContainer {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  border-radius: 4px;
  &[data-on-secondary] {
    @include background-primary;
  }

  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.input {
  padding: 0 8px;
  width: 100%;
  color: inherit;
}
.count {
  margin-right: 4px;
  margin-bottom: 4px;
}
</style>
