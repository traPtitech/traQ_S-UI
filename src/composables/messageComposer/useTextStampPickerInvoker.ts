import type { Ref } from 'vue'

import { constructStampString } from '/@/lib/markdown/constructStampString'
import type { ReferenceInputHandle } from '/@/lib/referenceInput/editor'
import { useStampsStore } from '/@/store/entities/stamps'
import type {
  AlignmentPosition,
  StampSelectHandler
} from '/@/store/ui/stampPicker'
import { useStampPickerInvoker } from '/@/store/ui/stampPicker'

const useTextStampPickerInvoker = (
  text: Ref<string>,
  inputRef: Ref<ReferenceInputHandle | undefined>,
  positionElement: Ref<HTMLElement | undefined>,
  positionOf: AlignmentPosition = 'bottom-right'
) => {
  const { stampsMap } = useStampsStore()

  const selectHandler: StampSelectHandler = stampData => {
    const stampName = stampsMap.value.get(stampData.id)?.name
    if (!stampName) return

    const stampText = constructStampString(
      stampName,
      stampData.sizeEffect,
      stampData.animeEffects
    )

    const input = inputRef.value
    if (!input) {
      text.value += stampText

      return
    }

    input.insertText(stampText, { focus: false })
  }

  return useStampPickerInvoker(selectHandler, positionElement, true, positionOf)
}

export default useTextStampPickerInvoker
