<template>
  <div :class="$style.container" :style="styles.container">
    <!-- TODO: Markdownパース対応 -->
    {{ content }}
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

export default defineComponent({
  name: 'ActivityElementContent',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.primary
      }))
    })
    return {
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
