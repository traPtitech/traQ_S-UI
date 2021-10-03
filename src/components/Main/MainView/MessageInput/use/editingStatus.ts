import { watch, Ref, onMounted, computed } from 'vue'
import { changeViewState } from '/@/lib/websocket'
import { ChannelId, DMChannelId } from '/@/types/entity-ids'
import { ChannelViewState } from '@traptitech/traq'
import store from '/@/store'

const useEditingStatus = (
  channelId: Ref<ChannelId | DMChannelId>,
  isTextEmpty: Ref<boolean>,
  isFocused: Ref<boolean>
) => {
  const isEditing = computed(
    () =>
      !isTextEmpty.value &&
      isFocused.value &&
      // 最新メッセージ閲覧中以外は入力中にしない(入力中にすると未読に追加されなくなるため)
      store.state.domain.messagesView.receiveLatestMessages
  )

  const change = (isEditing: boolean) => {
    if (isEditing) {
      changeViewState(channelId.value, ChannelViewState.Editing)
    } else {
      store.dispatch.domain.messagesView.syncViewState()
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
