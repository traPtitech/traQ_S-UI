<template>
  <div :class="$style.container">
    <textarea-autosize
      ref="textareaAutosizeRef"
      v-model="modelValue"
      :class="$style.textarea"
      :style="textareaAutosizeStyle"
      :readonly="isPosting"
      placeholder="メッセージを入力"
      rows="1"
      :data-simple-padding="simplePadding"
      :data-shrink-to-one-line="shrinkToOneLine"
      :data-is-max-height-none="isMaxHeightNone"
      :data-is-input-text-area-expanded="isInputTextAreaExpanded"
      :data-is-mobile="isMobile"
      :data-is-firefox="firefoxFlag"
      data-testid="message-input-textarea"
      @before-input="onBeforeInput"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @focus="onFocus"
      @blur="onBlur"
      @paste="onPaste"
      @autosize-updated="updateShowIsInputTextareaExpandButtonVisibility"
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

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import usePaste from './composables/usePaste'
import useSendKeyWatcher from './composables/useSendKeyWatcher'
import useWordSuggester from './composables/useWordSuggester'
import DropdownSuggester from './DropdownSuggester/DropdownSuggester.vue'
import TextareaAutosize from '/@/components/UI/TextareaAutosize.vue'
import useInsertText from '/@/composables/dom/useInsertText'
import { isFirefox } from '/@/lib/dom/browser'
import { getScrollbarWidth } from '/@/lib/dom/scrollbar'
import { useResponsiveStore } from '/@/store/ui/responsive'
import type { ChannelId } from '/@/types/entity-ids'

const modelValue = defineModel<string>({ default: '' })
const showTextAreaExpandButton = defineModel<boolean>(
  'showTextAreaExpandButton',
  {
    default: false
  }
)

const props = withDefaults(
  defineProps<{
    channelId?: ChannelId
    isPosting?: boolean
    simplePadding?: boolean
    shrinkToOneLine?: boolean
    isMaxHeightNone?: boolean
    isInputTextAreaExpanded?: boolean
  }>(),
  {
    channelId: '',
    isPosting: false,
    simplePadding: false,
    shrinkToOneLine: false,
    isMaxHeightNone: false,
    isInputTextAreaExpanded: false
  }
)

const emit = defineEmits<{
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'addAttachments', _files: File[]): void
  (e: 'postMessage'): void
  (e: 'modifierKeyDown'): void
  (e: 'modifierKeyUp'): void
  (e: 'autosize-updated'): void
}>()

const firefoxFlag = isFirefox()

const { isMobile } = useResponsiveStore()

const textareaAutosizeRef = ref<InstanceType<typeof TextareaAutosize>>()
const textareaRef = computed(() => textareaAutosizeRef.value?.$el)

defineExpose({ textareaAutosizeRef })

const { insertText } = useInsertText(textareaRef)
const { onPaste } = usePaste(emit, insertText)

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
} = useWordSuggester(textareaRef, modelValue)

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

const onFocus = () => {
  emit('focus')
}
const onBlur = () => {
  onBlurWordSuggester()
  onBlurSendKeyWatcher()
  emit('blur')
}

const textAreaAutoSizeMaxHeightShrunk = computed(() =>
  isMobile.value ? 70 : 160
)

const textAreaAutoSizeMaxHeight = computed(() => {
  if (props.isMaxHeightNone) {
    return 'none'
  }
  return (
    (props.isInputTextAreaExpanded
      ? textAreaAutoSizeMaxHeightShrunk.value * 2
      : textAreaAutoSizeMaxHeightShrunk.value) + 'px'
  )
})

const scollbarWidth = getScrollbarWidth()
const textareaAutosizeStyle = computed(() => ({
  '--input-scrollbar-width': `${scollbarWidth}px`,
  '--max-height': textAreaAutoSizeMaxHeight.value
}))

const updateShowIsInputTextareaExpandButtonVisibility = () => {
  nextTick(() => {
    if (textareaRef.value) {
      showTextAreaExpandButton.value =
        textareaRef.value.scrollHeight > textAreaAutoSizeMaxHeightShrunk.value
    }
  })
}

watch(modelValue, updateShowIsInputTextareaExpandButtonVisibility, {
  immediate: true
})

watch(textAreaAutoSizeMaxHeight, () => {
  textareaAutosizeRef.value?.autosizeUpdateTextarea()
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
  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.textarea {
  @include color-text-primary;
  @include background-primary;
  width: 100%;
  padding: $vertical-padding 16px;
  // 左から、余白、スタンプパレットボタン、余白、送信ボタン、スクロールバー
  padding-right: calc(8px + 24px + 8px + 24px + var(--input-scrollbar-width));
  max-height: var(--max-height);
  &[readonly] {
    @include color-ui-secondary-inactive;
    cursor: wait;
  }
  &[data-simple-padding='true'] {
    padding-right: 16px;
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
