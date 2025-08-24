<template>
  <span
    v-if="props.inline"
    class="markdown-inline-body"
    :class="$style.content"
    :data-accept-action="acceptAction"
    @click="toggleSpoilerHandler"
    v-html="renderedContent"
  />
  <div
    v-else
    class="markdown-body"
    :class="$style.content"
    :data-accept-action="acceptAction"
    @click="toggleSpoilerHandler"
    v-html="renderedContent"
  />
</template>

<script lang="ts" setup>
import { render, renderInline } from '/@/lib/markdown/markdown'
import type { MarkdownRenderResult } from '@traptitech/traq-markdown-it'
import { computed, nextTick, ref, watchEffect } from 'vue'
import useSpoilerToggler from '/@/composables/markdown/useSpoilerToggler'

const props = withDefaults(
  defineProps<{
    content?: string
    acceptAction?: boolean
    inline?: boolean
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
watchEffect(async () => {
  if (props.inline) {
    rendered.value = await renderInline(props.content)
  } else {
    rendered.value = await render(props.content)
  }
  await nextTick()
  emit('render')
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
