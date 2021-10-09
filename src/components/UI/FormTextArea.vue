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
        v-model="value"
        :class="$style.input"
        :name="name"
        :placeholder="placeholder"
        :style="style"
        rows="1"
      />
      <length-count
        :class="$style.count"
        :val="modelValue"
        :max-length="maxLength"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, shallowRef } from 'vue'
import { randomString } from '/@/lib/basic/randomString'
import LengthCount from '/@/components/UI/LengthCount.vue'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
import { useModelValueSyncer } from '/@/use/modelSyncer'

export default defineComponent({
  name: 'FormTextArea',
  components: {
    LengthCount,
    TextareaAutosize
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    onSecondary: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: undefined
    },
    label: {
      type: String,
      default: undefined
    },
    maxHeight: {
      type: Number,
      default: undefined
    },
    maxLength: {
      type: Number,
      default: undefined
    }
  },
  emits: {
    'update:modelValue': (_val: string) => true
  },
  setup(props, { emit }) {
    const value = useModelValueSyncer(props, emit)

    const style = computed(() => ({ maxHeight: props.maxHeight }))

    const inputRef = shallowRef<HTMLInputElement | null>(null)
    const focus = () => {
      inputRef.value?.focus()
    }

    const id = randomString()

    return {
      value,
      style,
      id,
      inputRef,
      focus
    }
  }
})
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
    border-color: $theme-accent-focus;
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
