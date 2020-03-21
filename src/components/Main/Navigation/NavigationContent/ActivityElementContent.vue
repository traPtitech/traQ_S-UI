<template>
  <div :class="$style.container" :style="styles.container">
    <!-- TODO: Markdownパース対応 -->
    {{ props.content }}
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

type Props = { content: string }

export default defineComponent({
  name: 'ActivityElementContent',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.primary
      }))
    })
    return {
      props,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  font-size: 1rem;
  word-break: break-all;
}
</style>
