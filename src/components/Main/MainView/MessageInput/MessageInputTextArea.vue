<template>
  <textarea-autosize
    ref="textareaAutosizeRef"
    :class="$style.container"
    v-model="value"
    :readonly="isPosting"
    placeholder="メッセージを送信"
    rows="1"
    @before-input="onBeforeInput"
    @keydown="_onKeyDown"
    @keyup="onKeyUp"
    @focus="onFocus"
    @blur="onBlur"
    @paste="onPaste"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  SetupContext,
  Ref,
  onMounted,
  computed,
  nextTick,
  PropType,
  toRef
} from 'vue'
import styles from '@/store'
import useSendKeyWatcher from './use/sendKeyWatcher'
import TextareaAutosize from '@/components/UI/TextareaAutosize.vue'
import useModelSyncer from '@/use/modelSyncer'
import { useMessageInputStateAttachment } from '@/providers/messageInputState'
import useToastStore from '@/providers/toastStore'
import { ChannelId } from '@/types/entity-ids'
import useWordCompleter from './use/wordCompleter'

const useFocus = (context: SetupContext) => {
  const onFocus = () => {
    context.emit('focus')
  }
  const onBlur = () => {
    context.emit('blur')
  }

  return { onFocus, onBlur }
}

const useLineBreak = (
  props: { modelValue: string },
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  context: SetupContext
) => {
  const insertLineBreak = async () => {
    if (!textareaRef.value) return
    const pre = props.modelValue.slice(0, textareaRef.value.selectionStart)
    const suf = props.modelValue.slice(textareaRef.value.selectionEnd)
    const selectionIndex = pre.length + 1
    // inputイベントを発火することでテキストを変更
    context.emit('update:modelValue', `${pre}\n${suf}`)

    await nextTick()
    textareaRef.value.selectionStart = textareaRef.value.selectionEnd = selectionIndex
  }

  return { insertLineBreak }
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
    TextareaAutosize
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
    const value = useModelSyncer(props, context)

    const { createTree, getCurrentWord } = useWordCompleter()
    const tree = createTree(
      store.getters.entities.allUserNames.map(userName => '@' + userName)
    )

    const textareaAutosizeRef = ref<{
      $el: HTMLTextAreaElement
    }>()
    const textareaRef = computed(() => textareaAutosizeRef.value?.$el)

    const { insertLineBreak } = useLineBreak(props, textareaRef, context)

    let { onBeforeInput, onKeyDown, onKeyUp } = useSendKeyWatcher(
      context,
      insertLineBreak
    )

    // 一旦、ラップして実装
    const _onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.isComposing) {
        e.preventDefault()
        if (!textareaRef.value) return
        const target = getCurrentWord(textareaRef.value, value.value)
        value.value =
          value.value.slice(0, target.begin) +
          (tree.search(target.word).length === 0
            ? target.word
            : tree.search(target.word)[0]) +
          (target.end === value.value.length
            ? ''
            : value.value.slice(target.end))
        // caretが末尾になる(これは効かなそう)
        textareaRef.value.setSelectionRange(target.end, target.end)
      }
      onKeyDown(e)
    }

    const { onFocus, onBlur } = useFocus(context)
    const { onPaste } = usePaste(toRef(props, 'channelId'))

    return {
      value,
      onBeforeInput,
      _onKeyDown,
      onKeyUp,
      textareaAutosizeRef,
      onFocus,
      onBlur,
      onPaste
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
