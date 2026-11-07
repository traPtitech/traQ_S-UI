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
import useMarkdownInternalHandler from '/@/composables/markdown/useMarkdownInternalHandler'
import { useRenderedMarkdown } from '/@/composables/markdown/useRenderedMarkdown'

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

const { renderedContent } = useRenderedMarkdown(() => props.content, {
  inline: () => props.inline,
  onRendered: () => emit('render')
})

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
