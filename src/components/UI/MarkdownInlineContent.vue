<template>
  <div class="markdown-body" v-html="renderedContent" />
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { embeddingExtractor } from '@/lib/embeddingExtractor'
import { renderInline } from '@/lib/markdown'

export default defineComponent({
  name: 'MarkdownInlineContent',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const renderedContent = computed(() => {
      const extracted = embeddingExtractor(props.content)
      return renderInline(extracted.text)
    })

    return { renderedContent }
  }
})
</script>
