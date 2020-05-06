<template>
  <div>
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div :class="$style.inputContainer" :data-on-secondary="onSecondary">
      <span v-if="prefix" :class="$style.prefix">{{ prefix }}</span>
      <input
        :class="$style.input"
        :id="id"
        :value="value"
        :placeholder="placeholder"
        @input="onInput"
        @change="onChange"
        type="text"
      />
      <span v-if="suffix" :class="$style.suffix">{{ suffix }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { randomString } from '@/lib/util/randomString'
import useInput from '@/use/input'

const useStyles = (props: { onSecondary: boolean }) =>
  reactive({
    inputContainer: makeStyles(theme => ({
      background: props.onSecondary
        ? theme.background.primary
        : theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'FormInput',
  props: {
    value: {
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
    label: String,
    prefix: String,
    suffix: String,
    useChangeEvent: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const { onInput: onInputInternal } = useInput(context)

    const onInput = (e: InputEvent) => {
      if (props.useChangeEvent) return
      onInputInternal(e)
    }
    const onChange = (e: InputEvent) => {
      if (!props.useChangeEvent) return
      onInputInternal(e)
    }

    const id = randomString()
    return { styles, onInput, onChange, id }
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
