<template>
  <span class="markdown-inline-body" v-html="renderedContent" />
</template>

<script lang="ts">
import { renderInline } from '@/lib/markdown/markdown'
import { MarkdownRenderResult } from '@traptitech/traq-markdown-it'
import { computed, defineComponent, ref, watchEffect } from 'vue'

export default defineComponent({
  name: 'InlineMarkdown',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const rendered = ref<MarkdownRenderResult>()
    watchEffect(async () => {
      rendered.value = await renderInline(props.content)
    })
    const renderedContent = computed(() => rendered.value?.renderedText)

    return { renderedContent }
  }
})
</script>
