<template>
  <div :class="$style.container" :style="styles.container">
    <icon mdi name="search" :size="18" :class="$style.icon" />
    <input
      :class="$style.input"
      :style="$style.input"
      :value="text"
      :placeholder="placeholder"
      @input="onInput"
      type="text"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'
import useInput from '@/use/input'

const useStyles = (props: { onSecondary: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: props.onSecondary
        ? theme.background.primary
        : theme.background.secondary,
      color: theme.ui.secondary
    })),
    input: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'FilterInput',
  components: {
    Icon
  },
  props: {
    text: {
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
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const { onInput } = useInput(context)
    return { styles, onInput }
  }
})
</script>

<style lang="scss" module>
.container {
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
</style>
