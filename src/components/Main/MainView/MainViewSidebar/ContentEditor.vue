<template>
  <div :class="$style.container">
    <div v-if="isEditing">
      <textarea-autosize
        :value="value"
        :class="$style.editor"
        @input="onInput"
      />
      <div
        v-if="maxlength"
        :class="$style.count"
        :data-is-exceeded="$boolAttr(isExceeded)"
      >
        {{ length }}/{{ maxlength }}
      </div>
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

export default defineComponent({
  name: 'ContentEditor',
  components: {
    Icon
  },
  props: {
    value: { type: String, required: false },
    isEditing: { type: Boolean, default: false },
    fallbackValue: { type: String, default: '未設定' },
    maxlength: { type: Number, required: false }
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
        context.emit('edit-done')
      } else {
        context.emit('edit-start')
      }
    }

    const length = ref(0)
    const isExceeded = computed(
      () => !!(props.maxlength && props.maxlength < length.value)
    )

    const onInput = (payload: string) => {
      length.value = Array.from(payload).length
      context.emit('input', payload)
    }
    return { content, isEmpty, onButtonClick, length, isExceeded, onInput }
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
.count {
  @include color-ui-secondary;
  @include size-caption;
  text-align: right;
  &[data-is-exceeded] {
    color: $theme-accent-error;
  }
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
