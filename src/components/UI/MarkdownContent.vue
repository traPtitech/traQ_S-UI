<template>
  <span
    ref="contentRef"
    class="markdown-body"
    :class="$style.content"
    v-html="content"
  />
</template>

<script lang="ts" setup>
import { createVNode, onMounted, ref, render, watch } from 'vue'
import FoldableCodeBlock from './FoldableCodeBlock.vue'

const props = defineProps<{
  content: string
}>()

const contentRef = ref<HTMLElement>()

const foldWrapClass = 'fold-wrap'

const applyFoldCodeBlock = () => {
  const content = contentRef.value
  if (content === undefined) return

  const pre_list = content.querySelectorAll(`:not(.${foldWrapClass}) > pre`)

  pre_list.forEach(pre => {
    const mountBase = document.createElement('div')
    const parent = pre.parentElement
    if (parent === null) return

    const wrapper = createVNode(FoldableCodeBlock, {
      wrapClass: foldWrapClass,
      preContent: pre
    })
    parent.replaceChild(mountBase, pre)
    render(wrapper, mountBase)
  })
}

onMounted(() => {
  applyFoldCodeBlock()
})
watch(
  () => props.content,
  () => {
    applyFoldCodeBlock()
  },
  {
    flush: 'post'
  }
)
</script>

<style lang="scss" module>
.content {
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  line-break: loose;
}
</style>
