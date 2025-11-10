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
import { ref, watchEffect } from 'vue'

import MarkdownContent from '/@/components/UI/MarkdownContent.vue'
import { isMessage } from '/@/lib/guard/embeddingOrUrl'
import { render } from '/@/lib/markdown/markdown'
import { useResponsiveStore } from '/@/store/ui/responsive'
import type { MessageId } from '/@/types/entity-ids'

import MessageQuoteList from '../MessageElement/Embeddings/MessageQuoteList.vue'

const props = defineProps<{
  channelId: string
  text: string
}>()

const { isMobile } = useResponsiveStore()

const previewRendered = ref('')
const quoteMessageIds = ref<MessageId[]>([])
watchEffect(async () => {
  const { renderedText, embeddings } = await render(props.text)
  previewRendered.value = renderedText
  quoteMessageIds.value = embeddings.filter(isMessage).map(({ id }) => id)
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

.quoteList {
  margin-top: 16px;
}
</style>
