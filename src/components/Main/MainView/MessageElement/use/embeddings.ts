import { computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { MessageId } from '@/types/entity-ids'
import {
  EmbeddingFile,
  EmbeddingMessage,
  ExternalUrl
} from '@traptitech/traq-markdown-it'

const useEmbeddings = (props: { messageId: MessageId }) => {
  const state = reactive({
    fileIds: computed(
      () =>
        store.state.domain.messagesView.embeddingsMap[props.messageId]
          ?.filter((e): e is EmbeddingFile => e.type === 'file')
          .map(e => e.id) ?? []
    ),
    quoteMessageIds: computed(
      () =>
        store.state.domain.messagesView.embeddingsMap[props.messageId]
          ?.filter((e): e is EmbeddingMessage => e.type === 'message')
          .map(e => e.id) ?? []
    ),
    externalUrls: computed(
      () =>
        store.state.domain.messagesView.embeddingsMap[props.messageId]
          ?.filter((e): e is ExternalUrl => e.type === 'url')
          .map(e => e.url) ?? []
    )
  })
  return { embeddingsState: state }
}
export default useEmbeddings
