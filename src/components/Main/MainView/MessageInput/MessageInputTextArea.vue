<template>
  <div :class="$style.container">
    <textarea-autosize
      ref="textareaAutosizeRef"
      v-model="value"
      :class="$style.textarea"
      :style="style"
      :readonly="isPosting"
      placeholder="メッセージを入力"
      rows="1"
      :data-shrink-to-one-line="shrinkToOneLine"
      :data-is-mobile="isMobile"
      :data-is-firefox="firefoxFlag"
      data-testid="message-input-textarea"
      @before-input="onBeforeInput"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @focus="onFocus"
      @blur="onBlur"
      @paste="onPaste"
    />
    <div :class="$style.over" />
    <dropdown-suggester
      :is-shown="isSuggesterShown"
      :position="suggesterPosition"
      :candidates="suggestedCandidates"
      :selected-index="selectedCandidateIndex"
      :confirmed-part="confirmedPart"
      @select="onSelect"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue'
import useSendKeyWatcher from './use/sendKeyWatcher'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
import { useModelValueSyncer } from '/@/use/modelSyncer'
import { ChannelId } from '/@/types/entity-ids'
import DropdownSuggester from './DropdownSuggester/DropdownSuggester.vue'
import useWordSuggester from './use/wordSuggester'
import useInsertText from '/@/use/insertText'
import { getScrollbarWidth } from '/@/lib/dom'
import { isFirefox } from '/@/lib/util/browser'
import useIsMobile from '/@/use/isMobile'

const firefoxFlag = isFirefox()

const useFocus = (
  emit: ((event: 'focus') => void) & ((event: 'blur') => void)
) => {
  const onFocus = () => {
    emit('focus')
  }
  const onBlur = () => {
    emit('blur')
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
    },
    shrinkToOneLine: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    'update:modelValue': () => true,
    focus: () => true,
    blur: () => true,
    paste: (_event: ClipboardEvent) => true,
    postMessage: () => true,
    modifierKeyDown: () => true,
    modifierKeyUp: () => true
  },
  setup(props, { emit }) {
    const value = useModelValueSyncer(props, emit)
    const { isMobile } = useIsMobile()

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
    } = useSendKeyWatcher(emit, () => {
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

    const { onFocus, onBlur: onBlurDefault } = useFocus(emit)
    const onPaste = (event: ClipboardEvent) => {
      emit('paste', event)
    }

    const onBlur = () => {
      onBlurWordSuggester()
      onBlurSendKeyWatcher()
      onBlurDefault()
    }

    const scollbarWidth = getScrollbarWidth()
    const style = {
      '--input-scrollbar-width': `${scollbarWidth}px`
    }

    return {
      value,
      isMobile,
      onBeforeInput,
      onKeyDown,
      onKeyUp,
      textareaAutosizeRef,
      onFocus,
      onBlur,
      onPaste,
      onSelect,
      firefoxFlag,
      isSuggesterShown,
      suggesterPosition,
      suggestedCandidates,
      selectedCandidateIndex,
      confirmedPart,
      style
    }
  }
})
</script>

<style lang="scss" module>
$vertical-padding: 8px;
.container {
  position: relative;
  display: flex;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}
.textarea {
  @include color-text-primary;
  @include background-primary;
  width: 100%;
  padding: $vertical-padding 16px;
  // 左から、余白、スタンプパレットボタン、余白、送信ボタン、スクロールバー
  padding-right: calc(8px + 24px + 8px + 24px + var(--input-scrollbar-width));
  max-height: 160px;
  &[readonly] {
    @include color-ui-secondary;
    opacity: 0.5;
    cursor: wait;
  }
  &[data-is-mobile='true'] {
    max-height: 70px;
  }

  &[data-shrink-to-one-line='true'],
  &:placeholder-shown {
    // Chromeでは<textarea>でtext-overflow: ellipsisが利用できない
    // line-clampだけだと2行目が表示されるので下の.overを上に重ねることで隠す
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    &[data-is-firefox='true'] {
      // Firefoxではline-clampが効かないのでtext-overflow: ellipsisも使う
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // autosizeで直接スタイルが当てられているため上書きするために!importantをつける
    // overflow: clipは、Chromeではカーソル移動によるスクロールを無効化できるが、
    // Firefoxでデザインが崩れるようになってしまうので、今のところはつけない
    overflow: hidden !important;
    // overflow: clip !important;
    height: unset !important;
  }
}
.over {
  @include background-primary;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0;
  pointer-events: none;

  .textarea[data-shrink-to-one-line='true'] + &,
  .textarea:placeholder-shown + & {
    height: $vertical-padding;
  }
}
</style>
