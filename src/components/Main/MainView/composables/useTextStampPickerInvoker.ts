import type {
  AlignmentPosition,
  StampSelectHandler
} from '/@/store/ui/stampPicker'
import { useStampPickerInvoker } from '/@/store/ui/stampPicker'
import type { Ref } from 'vue'
import useInsertText from '/@/composables/dom/useInsertText'
import { useStampsStore } from '/@/store/entities/stamps'
import { constructStampString } from '/@/lib/markdown/constructStampString'

const useTextStampPickerInvoker = (
  text: Ref<string>,
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  positionElement: Ref<HTMLElement | undefined>,
  positionOf: AlignmentPosition = 'bottom-right'
) => {
  const { stampsMap } = useStampsStore()
  const { insertText } = useInsertText(textareaRef)

  const selecterHandler: StampSelectHandler = stampData => {
    const stampName = stampsMap.value.get(stampData.id)?.name
    if (!stampName) return

    const stampText = constructStampString(
      stampName,
      stampData.sizeEffect,
      stampData.animeEffects
    )

    if (!textareaRef.value) {
      text.value += stampText
      return
    }

    insertText(stampText)
  }

  return useStampPickerInvoker(
    selecterHandler,
    positionElement,
    true,
    positionOf
  )
}

export default useTextStampPickerInvoker
