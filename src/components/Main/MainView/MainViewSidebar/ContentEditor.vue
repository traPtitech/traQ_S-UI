<template>
  <div :class="$style.container" :style="styles.container">
    <textarea-autosize
      v-if="isEditing"
      :value="value"
      :class="$style.editor"
      :style="styles.textarea"
      :maxlength="maxlength"
      @input="onInput"
    />
    <div v-else :class="$style.content" :data-is-empty="isEmpty">
      {{ content }}
    </div>
    <button
      @click="onButtonClick"
      :style="styles.button"
      :class="$style.button"
    >
      <icon v-if="isEditing" width="20" height="20" name="check" mdi />
      <icon v-else width="20" height="20" name="pencil" mdi />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

const useStyles = (props: { isEditing: boolean }) =>
  reactive({
    container: makeStyles(theme => ({ color: theme.ui.primary })),
    button: makeStyles(theme => ({
      color: props.isEditing ? theme.accent.primary : theme.ui.primary
    })),
    textarea: makeStyles(theme => ({ color: theme.ui.primary }))
  })

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
    const styles = useStyles(props)
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
    const onInput = (payload: string) => context.emit('input', payload)
    return { styles, content, isEmpty, onButtonClick, onInput }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template-columns: 1fr 20px;
  column-gap: 8px;
  align-items: start;
}
.content {
  width: 100%;
  white-space: pre-line;
  word-break: keep-all;
  overflow-wrap: break-word;
  min-width: 0;
  &[data-is-empty] {
    opacity: 0.5;
  }
}
.editor {
  width: 100%;
  resize: none;
}
.button {
  cursor: pointer;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
}
</style>
