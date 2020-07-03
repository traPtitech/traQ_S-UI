<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div :class="$style.inputContainer" :data-on-secondary="onSecondary">
      <span v-if="prefix" :class="$style.prefix" @click="focus">
        {{ prefix }}
      </span>
      <input
        ref="inputRef"
        :class="$style.input"
        :id="id"
        :type="type"
        :value="value"
        :placeholder="placeholder"
        :step="step"
        @input="onInput"
        @change="onChange"
      />
      <span v-if="suffix" :class="$style.suffix" @click="focus">
        {{ suffix }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { randomString } from '@/lib/util/randomString'
import useInput from '@/use/input'

export default defineComponent({
  name: 'FormInput',
  props: {
    type: {
      type: String,
      default: 'text'
    },
    value: {
      type: [String, Number],
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
    label: String,
    prefix: String,
    suffix: String,
    step: String,
    useChangeEvent: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { onInput: onInputInternal } = useInput(context)

    const onInput = (e: InputEvent) => {
      if (props.useChangeEvent) return
      onInputInternal(e)
    }
    const onChange = (e: InputEvent) => {
      if (!props.useChangeEvent) return
      onInputInternal(e)
    }

    const inputRef = ref<HTMLInputElement | null>(null)
    const focus = () => {
      inputRef.value?.focus()
    }

    const id = randomString()
    return { onInput, onChange, id, inputRef, focus }
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
  height: 30px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  &[data-on-secondary] {
    @include background-primary;
  }

  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus;
  }
}
.prefix {
  margin-left: 8px;
}
.input {
  margin: 0 8px;
  width: 100%;
  color: inherit;
}
.suffix {
  margin-right: 8px;
}
</style>
