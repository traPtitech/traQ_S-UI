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
      <icon v-if="isEditing" width="20" height="20" name="check" mdi />
      <icon v-else width="20" height="20" name="pencil-outline" mdi />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import Icon from '/@/components/UI/Icon.vue'
import LengthCount from '/@/components/UI/LengthCount.vue'
import { countLength } from '/@/lib/util/string'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'

export default defineComponent({
  name: 'ContentEditor',
  components: {
    Icon,
    LengthCount,
    TextareaAutosize
  },
  props: {
    value: { type: String, default: undefined },
    isEditing: { type: Boolean, default: false },
    fallbackValue: { type: String, default: '未設定' },
    maxLength: { type: Number, default: undefined }
  },
  emits: {
    editStart: () => true,
    editDone: () => true,
    inputValue: (_val: string) => true
  },
  setup(props, { emit }) {
    const content = computed(() => {
      if (props.value === '') return props.fallbackValue
      if (props.value === undefined) return 'ロード中'
      return props.value
    })
    const isEmpty = computed(
      () => props.value === '' || props.value === undefined
    )
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
      () =>
        !!(props.maxLength && countLength(modelValue.value) > props.maxLength)
    )

    return {
      content,
      isEmpty,
      onButtonClick,
      length,
      isExceeded,
      modelValue
    }
  }
})
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
  word-break: break-all;
  min-width: 0;
  &[data-is-empty] {
    opacity: 0.5;
  }
}
.editor {
  @include color-ui-primary;
  width: 100%;
  resize: none;
}
.button {
  @include color-ui-primary;
  &[data-is-editing] {
    @include color-accent-primary;
  }
  cursor: pointer;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
  &[data-is-exceeded] {
    color: $theme-accent-error;
    cursor: default;
    opacity: 1;
  }
}
</style>
