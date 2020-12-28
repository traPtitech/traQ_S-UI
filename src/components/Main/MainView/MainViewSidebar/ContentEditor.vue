<template>
  <div :class="$style.container">
    <div v-if="isEditing">
      <textarea-autosize v-model="modelValue" :class="$style.editor" />
      <length-count
        :class="$style.count"
        :val="valueReal"
        :max-length="maxLength"
      />
    </div>
    <div v-else :class="$style.content" :data-is-empty="$boolAttr(isEmpty)">
      {{ content }}
    </div>
    <button
      @click="onButtonClick"
      :data-is-editing="$boolAttr(isEditing)"
      :disabled="isExceeded"
      :data-is-exceeded="$boolAttr(isExceeded)"
      :class="$style.button"
    >
      <icon v-if="isEditing" width="20" height="20" name="check" mdi />
      <icon v-else width="20" height="20" name="pencil" mdi />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import Icon from '@/components/UI/Icon.vue'
import LengthCount from '@/components/UI/LengthCount.vue'
import { countLength } from '@/lib/util/string'
import TextareaAutosize from '@/components/UI/TextareaAutosize.vue'

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
  setup(props, context) {
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
        context.emit('editDone')
      } else {
        context.emit('editStart')
      }
    }

    const valueReal = ref(props.value ?? '')
    const isExceeded = computed(
      () =>
        !!(props.maxLength && countLength(valueReal.value) > props.maxLength)
    )

    const modelValue = computed({
      get: () => props.value ?? '',
      set: v => {
        valueReal.value = v ?? ''
        context.emit('inputValue', v ?? '')
      }
    })

    return {
      content,
      isEmpty,
      onButtonClick,
      length,
      valueReal,
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
  white-space: pre-line;
  word-break: normal;
  overflow-wrap: break-word;
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
