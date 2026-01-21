import { computed, reactive } from 'vue'

import { isExternalUrl, isFile, isMessage } from '/@/lib/guard/embeddingOrUrl'
import { useMessagesView } from '/@/store/domain/messagesView'
import type { MessageId } from '/@/types/entity-ids'

const useEmbeddings = (props: { messageId: MessageId }) => {
  const { embeddingsMap, renderedContentMap } = useMessagesView()

  const embeddings = computed(() => embeddingsMap.value.get(props.messageId))
  const renderedContent = computed(
    () => renderedContentMap.value.get(props.messageId) ?? ''
  )
  const state = reactive({
    fileIds: computed(
      () => embeddings.value?.filter(isFile).map(e => e.id) ?? []
    ),
    quoteMessageIds: computed(
      () => embeddings.value?.filter(isMessage).map(e => e.id) ?? []
    ),
    externalUrls: computed(() =>
      [
        ...new Set(
          embeddings.value?.filter(isExternalUrl).map(e => e.url) ?? []
        )
      ].slice(0, 2)
    ),
    hasCodeBlock: computed(() => renderedContent.value.includes('</pre>'))
  })
  return { embeddingsState: state }
}
export default useEmbeddings
