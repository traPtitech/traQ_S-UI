<template>
  <span
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
import { computed, nextTick, ref, watchEffect } from 'vue'

import useMarkdownInternalHandler from '/@/composables/markdown/useMarkdownInternalHandler'
import { render, renderCondensed } from '/@/lib/markdown/markdown'
import type { MarkdownRenderResult } from '/@/lib/markdown/types'

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
    rendered.value = await renderCondensed(props.content)
  } else {
    rendered.value = await render(props.content)
  }
  await nextTick()
  emit('render')
})
const renderedContent = computed(() => rendered.value?.renderedText)

const { onClick } = useMarkdownInternalHandler()
</script>

<style lang="scss" module>
.content {
  word-break: break-all;
  &[data-accept-action='false'] {
    pointer-events: none;
  }
}
</style>
