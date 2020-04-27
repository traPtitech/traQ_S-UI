<template>
  <div :class="$style.container" :style="styles.container">
    <div :class="['markdown-body', $style.content]" v-html="renderedContent" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { embeddingExtractor } from '@/lib/embeddingExtractor'
import { renderInline } from '@/lib/markdown'

export default defineComponent({
  name: 'ActivityElementContent',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.primary
      }))
    })

    const renderedContent = computed(() => {
      const extracted = embeddingExtractor(props.content)
      return renderInline(extracted.text)
    })

    return { styles, renderedContent }
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
