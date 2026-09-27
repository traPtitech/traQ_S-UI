import type { Ref } from 'vue'

import { embeddingOrigin } from '/@/lib/apis'
import { constructMessagesPath } from '/@/router'
import { useCommandPalette } from '/@/store/app/commandPalette'
import type { MessageId } from '/@/types/entity-ids'

const useSearchLink = (messageId: Ref<MessageId>) => {
  const { currentInput, settleQuery, resetPaging, openCommandPalette } =
    useCommandPalette()
  const searchLink = async () => {
    const link = `${embeddingOrigin}${constructMessagesPath(messageId.value)}`
    resetPaging()
    currentInput.value = link
    await settleQuery()
    await openCommandPalette('search')
  }
  return { searchLink }
}
export default useSearchLink
