import { watch, Ref, onMounted, computed } from '@vue/composition-api'
import { changeViewState } from '@/lib/websocket'
import { ChannelId, DMChannelId } from '@/types/entity-ids'
import { ChannelViewState } from '@traptitech/traq'

const useEditingStatus = (
  channelId: Ref<ChannelId | DMChannelId>,
  textStatus: { text: string },
  isFocused: Ref<boolean>
) => {
  const isEditing = computed(() => textStatus.text !== '' && isFocused.value)

  const change = (isEditing: boolean) => {
    changeViewState(
      channelId.value,
      isEditing ? ChannelViewState.Editing : ChannelViewState.Monitoring
    )
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
