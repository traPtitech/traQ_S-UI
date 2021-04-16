<template>
  <textarea-autosize
    ref="textareaAutosizeRef"
    v-model="value"
    :class="$style.container"
    :readonly="isPosting"
    placeholder="メッセージを送信"
    rows="1"
    @before-input="onBeforeInput"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    @focus="onFocus"
    @blur="onBlur"
    @paste="onPaste"
  />
  <dropdown-suggester
    :is-shown="isSuggesterShown"
    :position="suggesterPosition"
    :candidates="suggestedCandidates"
    :selected-index="selectedCandidateIndex"
    :confirmed-part="confirmedPart"
    @mousedown="beforeSelect"
    @select="onSelect"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  SetupContext,
  Ref,
  computed,
  PropType,
  toRef
} from 'vue'
import useSendKeyWatcher from './use/sendKeyWatcher'
import TextareaAutosize from '@/components/UI/TextareaAutosize.vue'
import { useModelValueSyncer } from '@/use/modelSyncer'
import { useMessageInputStateAttachment } from '@/providers/messageInputState'
import useToastStore from '@/providers/toastStore'
import { ChannelId } from '@/types/entity-ids'
import useWordCompleter from './use/wordCompleter'
import DropdownSuggester from './DropdownSuggester/DropdownSuggester.vue'
import useWordSuggester from './use/wordSuggester'
import useInsertText from '@/use/insertText'

const useFocus = (context: SetupContext) => {
  const onFocus = () => {
    context.emit('focus')
  }
  const onBlur = () => {
    context.emit('blur')
  }

  return { onFocus, onBlur }
}

const usePaste = (channelId: Ref<ChannelId>) => {
  const { addErrorToast } = useToastStore()
  const { addAttachment } = useMessageInputStateAttachment(
    channelId,
    addErrorToast
  )

  const onPaste = (event: ClipboardEvent) => {
    // メッセージ編集の場合などは無視
    if (channelId.value === '') return

    const dt = event?.clipboardData
    if (dt) {
      Array.from(dt.files).forEach(file => {
        addAttachment(file)
      })
    }
  }
  return { onPaste }
}

export default defineComponent({
  name: 'MessageInputTextArea',
  components: {
    TextareaAutosize,
    DropdownSuggester
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    channelId: {
      type: String as PropType<ChannelId>,
      default: ''
    },
    isPosting: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const value = useModelValueSyncer(props, context.emit)

    const textareaAutosizeRef = ref<{
      $el: HTMLTextAreaElement
    }>()
    const textareaRef = computed(() => textareaAutosizeRef.value?.$el)

    const { insertText } = useInsertText(value, textareaRef)

    const {
      onKeyUp: onKeyUpWordSuggester,
      onKeyDown: onKeyDownWordSuggester,
      onBlur: onBlurWordSuggester,
      beforeSelect,
      hideSuggester,
      isSuggesterShown,
      target,
      position,
      suggestedCandidates,
      selectedCandidateIndex,
      confirmedPart
    } = useWordSuggester(textareaRef, value)

    const {
      onBeforeInput,
      onKeyDown: onKeyDownSendKeyWatcher,
      onKeyUp: onKeyUpSendKeyWatcher,
      onBlur: onBlurSendKeyWatcher
    } = useSendKeyWatcher(context, () => {
      insertText('\n')
    })
    const { onKeyDown: onKeyDownWordCompleter, onSelect } = useWordCompleter(
      textareaRef,
      target,
      value,
      suggestedCandidates,
      selectedCandidateIndex,
      confirmedPart,
      hideSuggester
    )

    const suggesterPosition = computed(() => {
      if (!textareaRef.value) return
      const { top, left } = textareaRef.value.getBoundingClientRect()
      return {
        top: top + position.value.top,
        left: left + position.value.left
      }
    })

    const onKeyDown = (e: KeyboardEvent) => {
      onKeyDownSendKeyWatcher(e)
      onKeyDownWordSuggester(e)
      onKeyDownWordCompleter(e)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      onKeyUpSendKeyWatcher(e)
      onKeyUpWordSuggester(e)
    }

    const { onFocus, onBlur: onBlurDefault } = useFocus(context)
    const { onPaste } = usePaste(toRef(props, 'channelId'))

    const onBlur = () => {
      onBlurWordSuggester()
      onBlurSendKeyWatcher()
      onBlurDefault()
    }

    return {
      value,
      onBeforeInput,
      onKeyDown,
      onKeyUp,
      textareaAutosizeRef,
      onFocus,
      onBlur,
      beforeSelect,
      onPaste,
      onSelect,
      isSuggesterShown,
      suggesterPosition,
      suggestedCandidates,
      selectedCandidateIndex,
      confirmedPart
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-text-primary;
  width: 100%;
  max-height: 160px;
  &[readonly] {
    @include color-ui-secondary;
    opacity: 0.5;
    cursor: wait;
  }
}
</style>
