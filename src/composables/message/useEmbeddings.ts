import { computed, reactive } from 'vue'
import type { MessageId } from '/@/types/entity-ids'
import { isFile, isMessage, isExternalUrl } from '/@/lib/guard/embeddingOrUrl'
import { useMessagesView } from '/@/store/domain/messagesView'

const useEmbeddings = (props: { messageId: MessageId }) => {
  const { embeddingsMap } = useMessagesView()

  const embeddings = computed(() => embeddingsMap.value.get(props.messageId))
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
    )
  })
  return { embeddingsState: state }
}
export default useEmbeddings
