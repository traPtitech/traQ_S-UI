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
        ref="inputRef"
        :class="$style.input"
        :id="id"
        :value="modelValue"
        :name="name"
        :placeholder="placeholder"
        :max-height="maxHeight"
        rows="1"
        @input-value="onInput"
      />
      <length-count
        :class="$style.count"
        :value="modelValue"
        :max-length="maxLength"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from 'vue'
import { randomString } from '@/lib/util/randomString'
import LengthCount from '@/components/UI/LengthCount.vue'

export default defineComponent({
  name: 'FormInput',
  components: {
    LengthCount
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
  setup(props, context) {
    const onInput = (val: string) => {
      context.emit('update:modelValue', val)
    }

    const inputRef = shallowRef<HTMLInputElement | null>(null)
    const focus = () => {
      inputRef.value?.focus()
    }

    const id = randomString()

    return {
      onInput,
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
