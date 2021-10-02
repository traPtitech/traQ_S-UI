<template>
  <span
    class="markdown-inline-body"
    :class="$style.content"
    :data-accept-action="acceptAction"
    @click="toggleSpoilerHandler"
    v-html="renderedContent"
  />
</template>

<script lang="ts">
import { renderInline } from '/@/lib/markdown/markdown'
import type { MarkdownRenderResult } from '@traptitech/traq-markdown-it'
import { computed, defineComponent, ref, watchEffect } from 'vue'
import { toggleSpoiler } from '/@/lib/markdown/spoiler'

export default defineComponent({
  name: 'InlineMarkdown',
  props: {
    content: {
      type: String,
      default: ''
    },
    acceptAction: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const rendered = ref<MarkdownRenderResult>()
    watchEffect(async () => {
      rendered.value = await renderInline(props.content)
    })
    const renderedContent = computed(() => rendered.value?.renderedText)

    const toggleSpoilerHandler = (e: MouseEvent) => {
      if (!e.target) return

      const toggled = toggleSpoiler(e.target as HTMLElement)
      if (toggled) {
        e.stopPropagation()
      }
    }

    return { renderedContent, toggleSpoilerHandler }
  }
})
</script>

<style lang="scss" module>
.content {
  word-break: break-all;
  &[data-accept-action='false'] {
    pointer-events: none;
  }
}
</style>
