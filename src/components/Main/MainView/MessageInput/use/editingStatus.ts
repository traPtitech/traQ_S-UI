import { watch, Ref } from '@vue/composition-api'
import { changeViewState } from '@/lib/websocket'
import { ChannelId, DMChannelId } from '@/types/entity-ids'
import { ChannelViewState } from '@traptitech/traq'

const useEditingStatus = (
  channelId: Ref<ChannelId | DMChannelId>,
  textStatus: { text: string },
  isFocused: Ref<boolean>
) => {
  watch(
    () => textStatus.text !== '' && isFocused.value,
    (isEditing, wasEditing) => {
      if (isEditing === wasEditing) return
      changeViewState(
        channelId.value,
        isEditing ? ChannelViewState.Editing : ChannelViewState.Monitoring
      )
    }
  )
}

export default useEditingStatus
