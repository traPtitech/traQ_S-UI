import { computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { MessageId } from '@/types/entity-ids'
import {
  isFile,
  isMessage,
  isExternalUrl
} from '@/lib/util/guard/embeddingOrUrl'

const useEmbeddings = (props: { messageId: MessageId }) => {
  const embeddingsMap = computed(
    () => store.state.domain.messagesView.embeddingsMap[props.messageId]
  )
  const state = reactive({
    fileIds: computed(
      () => embeddingsMap.value?.filter(isFile).map(e => e.id) ?? []
    ),
    quoteMessageIds: computed(
      () => embeddingsMap.value?.filter(isMessage).map(e => e.id) ?? []
    ),
    externalUrls: computed(
      () => embeddingsMap.value?.filter(isExternalUrl).map(e => e.url) ?? []
    )
  })
  return { embeddingsState: state }
}
export default useEmbeddings
