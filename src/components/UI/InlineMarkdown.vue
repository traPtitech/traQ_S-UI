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
import useSpoilerToggler from '/@/composables/markdown/useSpoilerToggler'

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

const { toggleSpoilerHandler } = useSpoilerToggler()
</script>

<style lang="scss" module>
.content {
  word-break: break-all;
  &[data-accept-action='false'] {
    pointer-events: none;
  }
}
</style>
