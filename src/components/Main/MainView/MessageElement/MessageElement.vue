<template>
  <div :class="$style.body" :style="styles.body" ref="bodyRef">
    <user-icon
      :class="$style.userIcon"
      :user-id="state.message.userId"
      :size="40"
    />
    <message-header
      :class="$style.messageHeader"
      :user-id="state.message.userId"
      :created-at="state.message.createdAt"
      :updated-at="state.message.updatedAt"
    />
    <div :class="$style.messageContents">
      <div :class="['markdown-body', $style.content]" v-html="state.content" />
      <message-file-list
        v-if="state.fileIds.length > 0"
        :class="$style.messageFileList"
        :file-ids="state.fileIds"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  watchEffect,
  watch,
  SetupContext,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import UserIcon from '@/components/UI/UserIcon.vue'
import MessageHeader from './MessageHeader.vue'
import MessageFileList from './MessageFileList.vue'
import { MessageId } from '@/types/entity-ids'
import useElementRenderObserver from './use/elementRenderObserver'

const useStyles = (props: { isEntryMessage: boolean }) =>
  reactive({
    body: makeStyles(theme => ({
      background: props.isEntryMessage
        ? transparentize(theme.accent.notification, 0.1)
        : ''
    }))
  })

export default defineComponent({
  name: 'MessageElement',
  components: { UserIcon, MessageHeader, MessageFileList },
  props: {
    messageId: {
      type: String as PropType<MessageId>,
      required: true
    },
    isEntryMessage: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context: SetupContext) {
    const bodyRef = ref<HTMLDivElement>(null)
    const state = reactive({
      message: computed(() => store.state.entities.messages[props.messageId]),
      content: computed(
        () =>
          store.state.domain.messagesView.renderedContentMap[props.messageId] ??
          ''
      ),
      fileIds: computed(() =>
        store.state.domain.messagesView.embeddedFilesMap[props.messageId].map(
          e => e.id
        )
      )
    })

    useElementRenderObserver(bodyRef, props, state, context)

    const styles = useStyles(props)

    return { state, bodyRef, styles }
  }
})
</script>

<style lang="scss" module>
.body {
  display: grid;
  grid-template-areas:
    'user-icon message-header'
    'user-icon message-contents'
    '... message-contents';
  grid-template-rows: 20px 1fr;
  grid-template-columns: 42px 1fr;
  width: 100%;
  min-width: 0;
  padding: 8px 32px;
  overflow: hidden;
}

.userIcon {
  grid-area: user-icon;
  margin-top: 2px;
}

.messageHeader {
  grid-area: message-header;
  padding-left: 8px;
}

.messageContents {
  grid-area: message-contents;
  padding-top: 4px;
  padding-left: 8px;
  min-width: 0;
}

.content {
  grid-area: message-contents;
  word-break: break-word;
  word-wrap: break-word;
  line-break: loose;

  & pre {
    white-space: pre-wrap;
  }
}

.messageFileList {
  margin-top: 16px;
}
</style>
