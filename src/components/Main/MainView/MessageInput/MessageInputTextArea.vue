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
    @select="onSelect"
  />
</template>

<script lang="ts">
import { defineComponent, ref, SetupContext, computed, PropType } from 'vue'
import useSendKeyWatcher from './use/sendKeyWatcher'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
import { useModelValueSyncer } from '/@/use/modelSyncer'
import { ChannelId } from '/@/types/entity-ids'
import DropdownSuggester from './DropdownSuggester/DropdownSuggester.vue'
import useWordSuggester from './use/wordSuggester'
import useInsertText from '/@/use/insertText'

const useFocus = (context: SetupContext) => {
  const onFocus = () => {
    context.emit('focus')
  }
  const onBlur = () => {
    context.emit('blur')
  }

  return { onFocus, onBlur }
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
      isSuggesterShown,
      position,
      suggestedCandidates,
      selectedCandidateIndex,
      confirmedPart,
      onSelect
    } = useWordSuggester(textareaRef, value)

    const {
      onBeforeInput,
      onKeyDown: onKeyDownSendKeyWatcher,
      onKeyUp: onKeyUpSendKeyWatcher,
      onBlur: onBlurSendKeyWatcher
    } = useSendKeyWatcher(context, () => {
      insertText('\n')
    })

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
    }
    const onKeyUp = (e: KeyboardEvent) => {
      onKeyUpSendKeyWatcher(e)
      onKeyUpWordSuggester(e)
    }

    const { onFocus, onBlur: onBlurDefault } = useFocus(context)
    const onPaste = (event: ClipboardEvent) => {
      context.emit('paste', event)
    }

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
