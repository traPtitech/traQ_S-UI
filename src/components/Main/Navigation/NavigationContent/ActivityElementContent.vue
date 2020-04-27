<template>
  <div :class="$style.container" :style="styles.container">
    <!-- TODO: Markdownパース対応 -->
    <!-- {{ content }} -->
    <div :class="['markdown-body', $style.content]" v-html="state.content" />
    <!-- <div :class="$style.content" v-html="state.content" /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { render } from '@/lib/markdown'
import { embeddingExtractor } from '@/lib/embeddingExtractor'

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
    const state = reactive({
      content: computed(() => {
        const extracted = embeddingExtractor(props.content)
        const renderedContent = render(extracted.text)
        return renderedContent
      })
    })
    return {
      styles,
      state
    }
  }
})
</script>

<style lang="scss" module>
.container {
  font-size: 1rem;
  word-break: break-all;
  width: 100%;
}
.content {
  a {
    pointer-events: none;
    color: currentColor;
  }
  pre {
    background-color: initial;
    padding: 0;
    overflow: initial;
  }
  code {
    background-color: initial;
    padding: 0;
    font-size: initial;
  }
  span {
    color: currentColor;
    word-break: break-all;
    white-space: pre-wrap;
  }
}
</style>
