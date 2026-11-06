<template>
  <div
    :class="$style.container"
    @mousedown.left.self.prevent="inputRef?.focus()"
  >
    <ReferenceInput
      ref="inputRef"
      v-model="modelValue"
      :document-key="documentKey"
      :class="$style.textarea"
      :style="inputStyle"
      :readonly="isPosting"
      placeholder="メッセージを入力"
      :data-simple-padding="simplePadding"
      :data-shrink-to-one-line="shrinkToOneLine"
      :data-is-max-height-none="isMaxHeightNone"
      :data-is-input-text-area-expanded="isInputTextAreaExpanded"
      :data-is-mobile="isMobile"
      :data-is-firefox="firefoxFlag"
      test-id="message-input-textarea"
      :prepare-paste="preparePaste"
      @before-input="onBeforeInput"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @focus="onFocus"
      @blur="onBlur"
      @layout-change="updateShowIsInputTextareaExpandButtonVisibility"
    />

    <div :class="$style.over" />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, shallowRef, watch } from 'vue'

import ReferenceInput from '/@/components/UI/ReferenceInput.vue'
import usePaste from '/@/composables/messageComposer/usePaste'
import useSendKeyWatcher from '/@/composables/messageComposer/useSendKeyWatcher'
import useResponsive from '/@/composables/useResponsive'
import { isFirefox } from '/@/lib/dom/browser'
import { getScrollbarWidth } from '/@/lib/dom/scrollbar'

const modelValue = defineModel<string>({ default: '' })

const showTextAreaExpandButton = defineModel<boolean>(
  'showTextAreaExpandButton',
  {
    default: false
  }
)

const props = withDefaults(
  defineProps<{
    documentKey?: string | number
    isPosting?: boolean
    simplePadding?: boolean
    shrinkToOneLine?: boolean
    isMaxHeightNone?: boolean
    isInputTextAreaExpanded?: boolean
  }>(),
  {
    documentKey: 'message',
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
  (e: 'addAttachments', _files: File[] | Promise<File[]>): void
  (e: 'postMessage'): void
  (e: 'modifierKeyDown'): void
  (e: 'modifierKeyUp'): void
}>()

const firefoxFlag = isFirefox()

const { isMobile } = useResponsive()
const inputRef = shallowRef<InstanceType<typeof ReferenceInput>>()
const inputHandle = computed(() => inputRef.value)

defineExpose({ inputHandle })

const { preparePaste } = usePaste(emit)

const {
  onBeforeInput,
  onKeyDown,
  onKeyUp,
  onBlur: onBlurSendKeyWatcher
} = useSendKeyWatcher(emit, () => inputRef.value?.insertLineBreak(), true)

const onFocus = () => {
  emit('focus')
}

const onBlur = () => {
  onBlurSendKeyWatcher()
  emit('blur')
}

const collapsedMaxHeight = computed(() => (isMobile.value ? 70 : 160))

const inputMaxHeight = computed(() => {
  if (props.isMaxHeightNone) {
    return 'none'
  }

  return (
    (props.isInputTextAreaExpanded
      ? collapsedMaxHeight.value * 2
      : collapsedMaxHeight.value) + 'px'
  )
})

const scrollbarWidth = getScrollbarWidth()

const inputStyle = computed(() => ({
  '--input-scrollbar-width': `${scrollbarWidth}px`,
  '--max-height': inputMaxHeight.value
}))

const updateShowIsInputTextareaExpandButtonVisibility = () => {
  nextTick(() => {
    if (inputHandle.value?.element) {
      showTextAreaExpandButton.value =
        inputHandle.value.element.scrollHeight > collapsedMaxHeight.value
    }
  })
}

watch(modelValue, updateShowIsInputTextareaExpandButtonVisibility, {
  immediate: true
})

watch(inputMaxHeight, updateShowIsInputTextareaExpandButtonVisibility)
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

  &[data-readonly='true'] {
    @include color-ui-secondary-inactive;
    cursor: wait;
  }

  &[data-simple-padding='true'] {
    padding-right: 16px;
  }

  &[data-shrink-to-one-line='true'] {
    // 折りたたみ時は次の行を下側の余白で隠す。
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    &[data-is-firefox='true'] {
      // Firefoxではline-clampが効かないのでtext-overflow: ellipsisも使う
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // overflow: clipは、Chromeではカーソル移動によるスクロールを無効化できるが、
    // Firefoxでデザインが崩れるようになってしまうので、今のところはつけない
    overflow: hidden;
    // overflow: clip !important;
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

  .textarea[data-shrink-to-one-line='true'] + & {
    height: $vertical-padding;
  }
}
</style>
