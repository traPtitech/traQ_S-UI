<template>
  <div :class="$style.preview" :data-is-mobile="isMobile">
    <markdown-content :content="previewRendered" />
    <div
      v-for="quoteMessage in quoteMessages"
      :key="quoteMessage.id"
      :class="$style.quote"
    >
      引用メッセージ
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { EmbeddingMessage } from '@traptitech/traq-markdown-it'
import { ref, watchEffect } from 'vue'
import { isMessage } from '/@/lib/guard/embeddingOrUrl'
import { render } from '/@/lib/markdown/markdown'
import { useResponsiveStore } from '/@/store/ui/responsive'
import MarkdownContent from '/@/components/UI/MarkdownContent.vue'

const props = defineProps<{
  text: string
}>()

const { isMobile } = useResponsiveStore()

const previewRendered = ref('')
const quoteMessages = ref<EmbeddingMessage[]>([])
watchEffect(async () => {
  const { renderedText, embeddings } = await render(props.text)
  previewRendered.value = renderedText
  quoteMessages.value = embeddings.filter(isMessage)
})
</script>

<style lang="scss" module>
.preview {
  width: 100%;
  max-height: 160px;
  overflow-y: auto;
  scrollbar-gutter: stable;

  &[data-is-mobile='true'] {
    max-height: 70px;
  }
}

.quote {
  padding-left: 16px;
  border-left: solid 4px $theme-ui-tertiary-default;
}
</style>
