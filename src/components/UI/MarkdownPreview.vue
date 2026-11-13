<template>
  <bdi
    v-if="props.inline"
    class="markdown-inline-body"
    :class="$style.content"
    :data-accept-action="acceptAction"
    @click="onClick"
    v-html="renderedContent"
  />
  <div
    v-else
    class="markdown-body"
    :class="$style.content"
    :data-accept-action="acceptAction"
    @click="onClick"
    v-html="renderedContent"
  />
</template>

<script lang="ts" setup>
import type { MarkdownRenderResult } from '@traptitech/traq-markdown-it'

import { computed, nextTick, ref, watch } from 'vue'

import useMarkdownInternalHandler from '/@/composables/markdown/useMarkdownInternalHandler'
import {
  render,
  renderInline,
  renderInlineIfReady
} from '/@/lib/markdown/markdown'

const props = withDefaults(
  defineProps<{
    content?: string
    acceptAction?: boolean
    inline?: boolean
    beforeNavigate?: () => Promise<void>
  }>(),
  {
    content: '',
    acceptAction: false,
    inline: false
  }
)
const emit = defineEmits<{
  render: []
}>()

const rendered = ref<MarkdownRenderResult>()
watch(
  () => [props.inline, props.content] as const,
  async ([inline, content], _previous, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })

    const result = inline
      ? (renderInlineIfReady(content) ?? (await renderInline(content)))
      : await render(content)

    if (cancelled) return

    rendered.value = result
    await nextTick()
    if (!cancelled) emit('render')
  },
  { immediate: true }
)

const renderedContent = computed(() => rendered.value?.renderedText)

const { onClick } = useMarkdownInternalHandler(() =>
  props.beforeNavigate ? props.beforeNavigate() : Promise.resolve()
)
</script>

<style lang="scss" module>
.content {
  word-break: break-all;
  &[data-accept-action='false'] {
    pointer-events: none;
  }
}
</style>
