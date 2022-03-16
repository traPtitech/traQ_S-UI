import { watch, Ref, onMounted, computed } from 'vue'
import { changeViewState } from '/@/lib/websocket'
import { ChannelId, DMChannelId } from '/@/types/entity-ids'
import { ChannelViewState } from '@traptitech/traq'
import { useMessagesView } from '/@/store/domain/messagesView'

const useEditingStatus = (
  channelId: Ref<ChannelId | DMChannelId>,
  isTextEmpty: Ref<boolean>,
  isFocused: Ref<boolean>
) => {
  const { receiveLatestMessages, syncViewState } = useMessagesView()
  const isEditing = computed(
    () =>
      !isTextEmpty.value &&
      isFocused.value &&
      // 最新メッセージ閲覧中以外は入力中にしない(入力中にすると未読に追加されなくなるため)
      receiveLatestMessages.value
  )

  const change = (isEditing: boolean) => {
    if (isEditing) {
      changeViewState(channelId.value, ChannelViewState.Editing)
    } else {
      syncViewState()
    }
  }

  onMounted(() => {
    change(isEditing.value)
  })
  watch(isEditing, (isEditing, wasEditing) => {
    if (isEditing === wasEditing) return
    change(isEditing)
  })
}

export default useEditingStatus
