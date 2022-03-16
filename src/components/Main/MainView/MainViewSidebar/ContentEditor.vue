<template>
  <div :class="$style.container">
    <div v-if="isEditing">
      <textarea-autosize v-model="modelValue" :class="$style.editor" />
      <length-count :val="modelValue" :max-length="maxLength" />
    </div>
    <div v-else :class="$style.content" :data-is-empty="$boolAttr(isEmpty)">
      <slot :content="content" />
    </div>
    <button
      :data-is-editing="$boolAttr(isEditing)"
      :disabled="isExceeded"
      :data-is-exceeded="$boolAttr(isExceeded)"
      :class="$style.button"
      @click="onButtonClick"
    >
      <a-icon v-if="isEditing" width="20" height="20" name="check" mdi />
      <a-icon v-else width="20" height="20" name="pencil-outline" mdi />
    </button>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import LengthCount from '/@/components/UI/LengthCount.vue'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
import { computed } from 'vue'
import { countLength } from '/@/lib/basic/string'

const props = withDefaults(
  defineProps<{
    value?: string
    isEditing?: boolean
    fallbackValue?: string
    maxLength?: number
  }>(),
  {
    isEditing: false,
    fallbackValue: '未設定'
  }
)

const emit = defineEmits<{
  (e: 'editStart'): void
  (e: 'editDone'): void
  (e: 'inputValue', _val: string): void
}>()

const content = computed(() => {
  if (props.value === '') return props.fallbackValue
  if (props.value === undefined) return 'ロード中'
  return props.value
})
const isEmpty = computed(() => props.value === '' || props.value === undefined)
const onButtonClick = () => {
  if (props.isEditing) {
    emit('editDone')
  } else {
    emit('editStart')
  }
}

const modelValue = computed({
  get: () => props.value ?? '',
  set: v => {
    emit('inputValue', v ?? '')
  }
})

const isExceeded = computed(
  () => !!(props.maxLength && countLength(modelValue.value) > props.maxLength)
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: grid;
  grid-template-columns: 1fr 20px;
  column-gap: 8px;
  align-items: start;
}
.content {
  @include color-ui-primary;
  word-break: break-all;
  min-width: 0;
  &[data-is-empty] {
    @include color-ui-primary-inactive;
  }
}
.editor {
  @include color-ui-primary;
  width: 100%;
  resize: none;
}
.button {
  @include color-ui-primary-inactive;
  &:hover {
    @include color-ui-primary;
  }
  &[data-is-editing] {
    @include color-accent-primary-inactive;
    &:hover {
      @include color-accent-primary;
    }
  }
  cursor: pointer;
  &[data-is-exceeded] {
    color: $theme-accent-error-default;
    cursor: default;
    &:hover {
      color: $theme-accent-error-default;
    }
  }
}
</style>
