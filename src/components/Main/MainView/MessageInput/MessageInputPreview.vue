<template>
  <div>
    <div
      :class="['markdown-body', $style.preview]"
      :data-is-mobile="isMobile"
      v-html="previewRendered"
    />
    <div
      v-for="quoteMessage in quoteMessages"
      :key="quoteMessage.id"
      :class="$style.quote"
    >
      引用メッセージ
    </div>
  </div>
</template>

<script lang="ts">
import { EmbeddingMessage } from '@traptitech/traq-markdown-it'
import { defineComponent, ref, watchEffect } from 'vue'
import { isMessage } from '/@/lib/guard/embeddingOrUrl'
import { render } from '/@/lib/markdown/markdown'
import useIsMobile from '/@/use/isMobile'

export default defineComponent({
  name: 'MessageInputPreview',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { isMobile } = useIsMobile()

    const previewRendered = ref('')
    const quoteMessages = ref<EmbeddingMessage[]>([])
    watchEffect(async () => {
      const { renderedText, embeddings } = await render(props.text)
      previewRendered.value = renderedText
      quoteMessages.value = embeddings.filter(isMessage)
    })

    return { isMobile, previewRendered, quoteMessages }
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

  &[data-is-mobile='true'] {
    max-height: 70px;
  }
}

.quote {
  padding-left: 16px;
  border-left: solid 4px $theme-ui-tertiary-default;
}
</style>
