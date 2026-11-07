<template>
  <div :class="$style.preview" :data-is-mobile="isMobile">
    <MarkdownContent :content="previewRendered" />
    <MessageQuoteList
      v-if="quoteMessageIds.length > 0"
      :class="$style.quoteList"
      :parent-message-channel-id="channelId"
      :message-ids="quoteMessageIds"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import { useRenderedMarkdown } from '/@/composables/markdown/useRenderedMarkdown'
import useResponsive from '/@/composables/useResponsive'
import { isMessage } from '/@/lib/guard/embeddingOrUrl'
import { normalizeMessageSource } from '/@/lib/message/content'

import MessageQuoteList from '../MessageElement/Embeddings/MessageQuoteList.vue'

const props = defineProps<{
  channelId: string
  text: string
}>()

const { isMobile } = useResponsive()
const { rendered, renderedContent: previewRendered } = useRenderedMarkdown(() =>
  normalizeMessageSource(props.text)
)

const quoteMessageIds = computed(
  () => rendered.value?.embeddings.filter(isMessage).map(({ id }) => id) ?? []
)
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

.quoteList {
  margin-top: 16px;
}
</style>
