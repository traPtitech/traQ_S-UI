<template>
  <span
    class="markdown-inline-body"
    :class="$style.content"
    :data-accept-action="acceptAction"
    @click="toggleSpoilerHandler"
    v-html="renderedContent"
  />
</template>

<script lang="ts" setup>
import { renderInline } from '/@/lib/markdown/markdown'
import type { MarkdownRenderResult } from '@traptitech/traq-markdown-it'
import { computed, ref, watchEffect } from 'vue'
import { toggleSpoiler } from '/@/lib/markdown/spoiler'

const props = withDefaults(
  defineProps<{
    content?: string
    acceptAction?: boolean
  }>(),
  {
    content: '',
    acceptAction: false
  }
)

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
</script>

<style lang="scss" module>
.content {
  word-break: break-all;
  &[data-accept-action='false'] {
    pointer-events: none;
  }
}
</style>
