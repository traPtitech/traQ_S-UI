import { computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { MessageId } from '@/types/entity-ids'

const useEmbeddings = (props: { messageId: MessageId }) => {
  const state = reactive({
    fileIds: computed(
      () =>
        store.state.domain.messagesView.embeddingsMap[props.messageId]
          ?.filter(e => e.type === 'file')
          .map(e => e.id) ?? []
    ),
    quoteMessageIds: computed(
      () =>
        store.state.domain.messagesView.embeddingsMap[props.messageId]
          ?.filter(e => e.type === 'message')
          .map(e => e.id) ?? []
    )
  })
  return { embeddingsState: state }
}
export default useEmbeddings
