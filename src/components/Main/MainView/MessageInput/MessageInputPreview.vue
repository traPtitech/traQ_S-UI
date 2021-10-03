<template>
  <div :class="['markdown-body', $style.preview]" v-html="previewRendered" />
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'
import { render } from '/@/lib/markdown/markdown'

export default defineComponent({
  name: 'MessageInputPreview',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const previewRendered = ref('')
    watchEffect(async () => {
      const res = await render(props.text)
      previewRendered.value = res.renderedText
    })
    return { previewRendered }
  }
})
</script>

<style lang="scss" module>
.preview {
  width: 100%;
  max-height: 160px;
  overflow-y: auto;
  scrollbar-gutter: stable;

  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  line-break: loose;
}
</style>
