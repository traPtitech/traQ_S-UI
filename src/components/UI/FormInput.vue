<template>
  <div :style="styles.container">
    <label v-if="label" :for="id" :class="$style.label">
      {{ label }}
    </label>
    <div :class="$style.inputContainer" :style="styles.inputContainer">
      <input
        :class="$style.input"
        :id="id"
        :value="value"
        :placeholder="placeholder"
        @input="onInput"
        type="text"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'
import { randomString } from '@/lib/util/randomString'
import useInput from '@/use/input'

const useStyles = (props: { onSecondary: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    inputContainer: makeStyles(theme => ({
      background: props.onSecondary
        ? theme.background.primary
        : theme.background.secondary
    }))
  })

export default defineComponent({
  name: 'FormInput',
  components: {
    Icon
  },
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
    label: String
  },
  setup(props, context) {
    const styles = useStyles(props)
    const { onInput } = useInput(context)
    const id = randomString()
    return { styles, onInput, id }
  }
})
</script>

<style lang="scss" module>
.inputContainer {
  height: 30px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
}
.icon {
  margin: 0 8px;
  flex-shrink: 0;
}
.input {
  margin: 0 8px;
  width: 100%;
}
.label {
  margin-bottom: 8px;
  display: block;
}
</style>
