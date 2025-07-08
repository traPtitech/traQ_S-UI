<template>
  <div :class="$style.container">
    <div v-if="isEditingValue && modelValue !== undefined">
      <textarea-autosize
        ref="textareaRef"
        v-model="modelValue"
        :class="$style.editor"
      />
      <length-count :val="modelValue" :max-length="maxLength" />
    </div>
    <div v-else :class="$style.content" :data-is-empty="$boolAttr(isEmpty)">
      <slot :content="content" />
    </div>
    <button
      :data-is-editing="$boolAttr(isEditingValue)"
      :disabled="isEditingValue && isExceeded"
      :data-is-exceeded="$boolAttr(isExceeded)"
      :class="$style.button"
      @click="onButtonClick"
    >
      <a-icon v-if="isEditingValue" :size="20" name="check" mdi />
      <a-icon v-else :size="20" name="pencil-outline" mdi />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import LengthCount from '/@/components/UI/LengthCount.vue'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
import { countLength } from '/@/lib/basic/string'

const props = withDefaults(
  defineProps<{
    fallbackValue?: string
    maxLength?: number
  }>(),
  {
    fallbackValue: '未設定'
  }
)

const modelValue = defineModel<string | undefined>({ required: true })
const isEditingValue = defineModel<boolean>('isEditing', { required: true })

const textareaRef = ref<InstanceType<typeof TextareaAutosize> | null>(null)

const content = computed(() => {
  if (modelValue.value === '') return props.fallbackValue
  if (modelValue.value === undefined) return 'ロード中'
  return modelValue.value
})
const isEmpty = computed(
  () => modelValue.value === '' || modelValue.value === undefined
)
const onButtonClick = async () => {
  isEditingValue.value = !isEditingValue.value
  await nextTick()
  if (isEditingValue.value) {
    textareaRef.value?.focus()
  }
}

const isExceeded = computed(
  () =>
    !!(props.maxLength && countLength(modelValue.value ?? '') > props.maxLength)
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

    &[data-is-exceeded] {
      color: $theme-accent-error-default;
      cursor: default;
      &:hover {
        color: $theme-accent-error-default;
      }
    }
  }
  cursor: pointer;
}
</style>
