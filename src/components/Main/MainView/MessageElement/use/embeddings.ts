import { computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { MessageId } from '@/types/entity-ids'
import {
  isFile,
  isMessage,
  isExternalUrl
} from '@/lib/util/guard/embeddingOrUrl'
import config from '@/config'
import { ExternalUrl } from '@traptitech/traq-markdown-it'

const ignoredHostNamesSet = new Set<string>(config.ogpIgnoreHostNames)

const isIncludedHost = (url: ExternalUrl) => {
  try {
    const hostName = new URL(url.url).hostname
    return !ignoredHostNamesSet.has(hostName)
  } catch {
    return false // 不正なURL
  }
}

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
    externalUrls: computed(() =>
      Array.from(
        new Set(
          embeddingsMap.value
            ?.filter(isExternalUrl)
            .filter(isIncludedHost)
            .map(e => e.url) ?? []
        )
      )
    )
  })
  return { embeddingsState: state }
}
export default useEmbeddings
