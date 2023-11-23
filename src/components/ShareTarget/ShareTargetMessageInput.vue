<template>
  <div :class="$style.container">
    <label :for="id" :class="$style.label">メッセージ</label>
    <div ref="wrapperEle" :class="$style.wrapper">
      <div :class="$style.inputContainer">
        <div :class="$style.inputWrapper">
          <textarea
            :id="id"
            ref="textareaRef"
            :class="$style.input"
            :value="defaultTextRef"
            @input="event => state.text = (event.target as HTMLTextAreaElement)?.value"
          />
        </div>
        <div :class="$style.controls">
          <message-input-insert-stamp-button
            :class="$style.button"
            @click="toggleStampPicker"
          />
          <message-input-upload-button
            :class="$style.button"
            @click="addAttachment"
          />
        </div>
      </div>
      <message-input-file-list
        :class="$style.fileList"
        channel-id="share-target"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import MessageInputFileList from '/@/components/Main/MainView/MessageInput/MessageInputFileList.vue'
import MessageInputUploadButton from '/@/components/Main/MainView/MessageInput/MessageInputUploadButton.vue'
import MessageInputInsertStampButton from '/@/components/Main/MainView/MessageInput/MessageInputInsertStampButton.vue'
import { onMounted, shallowRef, computed, ref, toRef } from 'vue'
import { randomString } from '/@/lib/basic/randomString'
import useTextStampPickerInvoker from '../Main/MainView/composables/useTextStampPickerInvoker'
import useAttachments from '../Main/MainView/MessageInput/composables/useAttachments'
import useMessageInputState from '/@/composables/messageInputState/useMessageInputState'
import useMessageInputStateAttachment from '/@/composables/messageInputState/useMessageInputStateAttachment'
import { useToastStore } from '/@/store/ui/toast'
import { useStampsStore } from '/@/store/entities/stamps'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampHistory } from '/@/store/domain/stampHistory'

const props = defineProps<{
  defaultText: string
}>()
const defaultTextRef = computed(() => props.defaultText)

const { fetchStampHistory } = useStampHistory()
const { fetchStamps } = useStampsStore()
const { fetchStampPalettes } = useStampPalettesStore()
const { state } = useMessageInputState('share-target')
const { addErrorToast } = useToastStore()
const { addAttachment: addStateAttachment } = useMessageInputStateAttachment(
  'share-target',
  addErrorToast
)
const { addAttachment } = useAttachments(addStateAttachment)

const textareaRef = shallowRef<HTMLTextAreaElement>()
const focus = () => {
  textareaRef.value?.focus()
}
onMounted(() => {
  focus()
})

const wrapperEle = ref<HTMLDivElement>()
const { toggleStampPicker } = useTextStampPickerInvoker(
  toRef(state, 'text'),
  textareaRef,
  wrapperEle
)

// スタンプピッカーに必要
fetchStamps()
fetchStampPalettes()
fetchStampHistory()

const id = randomString()
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
}
.label {
  @include color-ui-secondary;
  display: block;
  margin-bottom: 8px;
}
.wrapper {
  @include color-ui-primary;
  @include background-secondary;
  @include size-body1;
  display: flex;
  flex-direction: column;
  padding: 8px;
  flex: 1;
  border-radius: 4px;

  border: solid 2px transparent;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.inputContainer {
  flex: 1;
  display: flex;
  align-items: stretch;
}
.inputWrapper {
  @include color-text-primary;
  min-height: 160px;
  width: 100%;
}
.input {
  height: 100%;
  width: 100%;
  color: inherit;
  resize: none;
}
.controls {
  margin-left: 8px;
  align-self: flex-start;
}
.button {
  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.fileList {
  margin-top: 8px;
}
</style>
