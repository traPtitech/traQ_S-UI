<template>
  <div :class="$style.container" :style="styles.container">
    <icon mdi name="search" :size="18" :class="$style.icon" />
    <input
      ref="inputRef"
      :class="$style.input"
      :style="styles.input"
      :value="text"
      :placeholder="placeholder"
      :autocapitalize="autocapitalize"
      :inputmode="disableIme ? 'url' : undefined"
      @input="onInput"
      type="text"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'
import useInput from '@/use/input'
import { isTouchDevice } from '@/lib/util/browser'

const useStyles = (props: { onSecondary: boolean; disableIme: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: props.onSecondary
        ? theme.background.primary
        : theme.background.secondary,
      color: theme.ui.secondary
    })),
    input: makeStyles(theme => ({
      color: theme.ui.primary,
      imeMode: props.disableIme ? 'disabled' : undefined
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
    },
    autocapitalize: {
      type: String,
      default: 'off'
    },
    disableIme: {
      type: Boolean,
      default: false
    },
    focusOnMount: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const styles = useStyles(props)
    const { onInput } = useInput(context)

    const inputRef = ref<HTMLInputElement>(null)
    onMounted(() => {
      if (!props.focusOnMount || isTouchDevice()) return
      inputRef.value?.focus()
    })

    return { styles, inputRef, onInput }
  }
})
</script>

<style lang="scss" module>
.container {
  @include font-size-regular;
  height: 30px;
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
